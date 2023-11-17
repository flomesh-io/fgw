#include <assert.h>
#include <errno.h>
#include <stdarg.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <time.h>
#include <math.h>
#include <sys/time.h>
#include <sys/file.h>
#include <pipy/nmi.h>

#include "modbus.h"

enum {
  id_variable_modbusDeviceName,
  id_variable_modbusSlaveID,
  id_variable_modbusBaud,
  id_variable_modbusRecords,
};

typedef enum DATA_TYPE {
  UNKOWN,
  FLOAT,
  SHORT,
  USHORT,
  LONG,
} DATA_TYPE;

typedef struct read_task {
  int fc;
  int addr;
  DATA_TYPE type;
} read_task;

static int task_count = 0;
static read_task task_list[100];

static int parse_records(char *str) {
  char type[100] = {'\0'};
  char *ptr = str;
  char *pend = str + strlen(str);

  task_count = 0;
  while (ptr < pend) {
    char *ps = strchr(ptr, '\n');
    read_task *task = &task_list[task_count];

    memset(task, 0, sizeof(read_task));
    if (ps != NULL) {
      if (ps - ptr < 5 || ps - ptr > 100) {
        break;
      }
      *ps = '\0';
    } else {
      if (pend - ptr < 5 || pend - ptr > 100) {
        break;
      }
    }
    sscanf(ptr, "%d %d %s", &task->fc, &task->addr, type);
    if (strcmp(type, "float") == 0) {
      task->type = FLOAT;
    } else if (strcmp(type, "short") == 0) {
      task->type = SHORT;
    } else if (strcmp(type, "ushort") == 0) {
      task->type = USHORT;
    } else if (strcmp(type, "long") == 0) {
      task->type = LONG;
    }
    if (task->type == UNKOWN || (task->fc != 3 && task->fc != 4)) {
      printf("bad record: %s\n", ptr);
      break;
    }
    task_count++;
    if (task_count >= sizeof(task_list) / sizeof(task_list[0])) {
      printf("too many records\n");
      break;
    }
    // printf("no: %d, fc: %d, addr: %d, type: %s\n", task_count, task->fc, task->addr, type);
    if (ps == NULL) {
      break;
    } else {
      *ps = '\n';
      ptr = ps + 1;
    }
  }

  return task_count;
}

static int get_host_port(char *device, char *host) {
  char *ptr = strchr(device, ':');

  if (ptr != NULL) {
    *ptr++ = '\0';
    strcpy(host, device);
    return atoi(ptr);
  } else {
    return 0;
  }
}

static modbus_t *init_modbus(char *device, int slave, int baud, char *records, char **err_msg) {
  int port = 0;
  char host[256] = {'\0'};
  modbus_t *ctx = NULL;
  uint32_t old_response_to_sec;
  uint32_t old_response_to_usec;
  uint32_t new_response_to_sec;
  uint32_t new_response_to_usec;

  if (parse_records(records) < 1) {
    *err_msg = "records is wrong!\n";
    return NULL;
  }
  port = get_host_port(device, host);
  // printf("init_modbus, host: %s, port: %d\n", host, port);
  if ((port > 0) && ((ctx = modbus_new_tcp(host, port)) == NULL)) {
    *err_msg = "Unable to allocate libmodbus/TCP context\n";
    return NULL;
  } else if (port < 1 && (ctx = modbus_new_rtu(device, baud, 'N', 8, 1)) == NULL) {
    *err_msg = "Unable to allocate libmodbus/RTU context\n";
    return NULL;
  }
  if (port < 1) {
    modbus_set_debug(ctx, FALSE);
    modbus_set_error_recovery(ctx, MODBUS_ERROR_RECOVERY_LINK | MODBUS_ERROR_RECOVERY_PROTOCOL);
    modbus_set_slave(ctx, slave);
    modbus_get_response_timeout(ctx, &old_response_to_sec, &old_response_to_usec);
  }
  if (modbus_connect(ctx) == -1) {
    *err_msg = (char *)modbus_strerror(errno);
    fprintf(stderr, "Connection failed: %s\n", modbus_strerror(errno));
    modbus_free(ctx);
    return NULL;
  }
  /// modbus_get_response_timeout(ctx, &new_response_to_sec, &new_response_to_usec);
  /// assert(old_response_to_sec == new_response_to_sec && old_response_to_usec == new_response_to_usec);

  return ctx;
}

struct pipeline_state {
  int is_started;
};

static void pipeline_init(pipy_pipeline ppl, void **user_ptr) {
  *user_ptr = calloc(1, sizeof(struct pipeline_state));
  ((struct pipeline_state *)*user_ptr)->is_started = 0;
}

static void pipeline_free(pipy_pipeline ppl, void *user_ptr) {
  struct pipeline_state *state = (struct pipeline_state *)user_ptr;
  free(user_ptr);
}

static char *get_string(pipy_pipeline ppl, int id, char *buf, int size) {
  pjs_value value = pjs_undefined();
  pipy_get_variable(ppl, id, value);
  if (pjs_is_undefined(value)) {
    return NULL;
  }
  int n = pjs_string_get_utf8_data(value, buf, size - 1);
  if (n > 0) {
    buf[n] = '\0';
    return buf;
  }
  return NULL;
}

static int get_int(pipy_pipeline ppl, int id) {
  pjs_value value = pjs_undefined();
  pipy_get_variable(ppl, id, value);
  if (pjs_is_undefined(value)) {
    return -1;
  }
  return pjs_to_number(value);
}

static void buffer_append(char **err_msg, char **buffer, int *space, const char *fmt, ...) {
  int n = 0;
  va_list args;

  va_start(args, fmt);
  n = vsnprintf(*buffer, *space, fmt, args);
  va_end(args);
  if (n <= 0 || n + 1 >= *space) {
    *err_msg = "too many data";
  } else {
    *buffer += n;
    *space -= n;
  }
}

static int lock_file(int lock_flag) {
  static int fd = -1;

  if (fd == -1) {
    fd = open("/tmp/pipy-modbus.lockfile", O_WRONLY | O_CREAT);
  }
  if (fd == -1) {
    return -1;
  }
  if (lock_flag) {
    return flock(fd, LOCK_EX);
  } else {
    return flock(fd, LOCK_UN);
  }
}

static void pipeline_process(pipy_pipeline ppl, void *user_ptr, pjs_value evt) {
  struct pipeline_state *state = (struct pipeline_state *)user_ptr;
  if (pipy_is_MessageStart(evt)) {
    state->is_started = 1;
  } else if (pipy_is_MessageEnd(evt)) {
    if (state->is_started == 1) {
      char device[256] = {'\0'};
      char records[8192] = {'\0'};
      unsigned char data[256]; // max 250 bytes
      int slave = get_int(ppl, id_variable_modbusSlaveID);
      int baud = get_int(ppl, id_variable_modbusBaud);
      char *err_msg = NULL;
      pjs_value response_head = pjs_object();
      char buffer[2000];
      char *ptr = buffer;
      int space = sizeof(buffer);
      int ts = time(NULL);

      get_string(ppl, id_variable_modbusDeviceName, device, sizeof(device));
      get_string(ppl, id_variable_modbusRecords, records, sizeof(records));
      pjs_object_set_property(response_head, pjs_string("id", strlen("id")), pjs_number(slave));
      pjs_object_set_property(response_head, pjs_string("ts", strlen("ts")), pjs_number(ts));

      buffer_append(&err_msg, &ptr, &space, "{\"id\":%d,\"ts\":%d,", slave, ts);

      if (device[0] == '\0') {
        err_msg = "__modbusDeviceName is undefined";
      } else if (slave == -1) {
        err_msg = "__modbusSlaveID is undefined";
      }

      lock_file(1);

      if (err_msg == NULL) {
        modbus_t *ctx = init_modbus(device, slave, baud, records, &err_msg);

        if (ctx == NULL) {
          printf("========= init modbus error: %s\n", (const char *)err_msg);
        } else {
          buffer_append(&err_msg, &ptr, &space, "\"records\":{");

          for (int i = 0; (err_msg == NULL) && (i < task_count); i++) {
            int rc = -1;
            int size = 1;
            read_task *task = &task_list[i];

            if (task->type == FLOAT || task->type == LONG) {
              size = 2;
            }
            if (task->fc == 3) {
              rc = modbus_read_registers(ctx, task->addr, size, (unsigned short *)data);
            } else if (task->fc == 4) {
              rc = modbus_read_input_registers(ctx, task->addr, size, (unsigned short *)data);
            }

            if (rc != size) {
              buffer_append(&err_msg, &ptr, &space, "\"%d\":\"%s\",", task->addr, modbus_strerror(errno));
            } else {

              // wpf debug
              // printf("data hex: [%x %x %x %x]\n", data[0],  data[1], data[2], data[3]);

              if (task->type == SHORT) {
                short value = data[1] << 8 | data[0];
                buffer_append(&err_msg, &ptr, &space, "\"%d\":\"%d\",", task->addr, value);
              } else if (task->type == USHORT) {
                int value = data[1] << 8 | data[0];
                buffer_append(&err_msg, &ptr, &space, "\"%d\":\"%d\",", task->addr, value);
              } else if (task->type == FLOAT) {
                unsigned char value[8] = {data[2], data[3], data[0], data[1]};
                buffer_append(&err_msg, &ptr, &space, "\"%d\":\"%.6g\",", task->addr, *((float *)value));
              } else if (task->type == LONG) {
                // long value = data[3] << 24 | data[2] << 16 | data[1] << 8 | data[0];
                long value = data[1] << 24 | data[0] << 16 | data[3] << 8 | data[2];
                buffer_append(&err_msg, &ptr, &space, "\"%d\":\"%ld\",", task->addr, value);
              }
            }
          }
          if (ptr > buffer && *(ptr - 1) == ',') {
            --ptr;
            ++space;
          }
          buffer_append(&err_msg, &ptr, &space, "}");

          modbus_close(ctx);
          modbus_free(ctx);
        }
      }

      lock_file(0);

      if (err_msg != NULL) {
        printf("========= modbus error message: %s\n", (const char *)err_msg);
        buffer_append(&err_msg, &ptr, &space, "\"error\":\"%s\"}", err_msg);
        pjs_object_set_property(response_head, pjs_string("error", strlen("error")), pjs_string(err_msg, strlen(err_msg)));
      } else {
        buffer_append(&err_msg, &ptr, &space, "}");
      }
      pipy_output_event(ppl, pipy_MessageStart_new(response_head));
      if (ptr > buffer) {
        // wpf debug
        // *ptr = '\0'; printf("modbus data: %s\n", buffer);
        pipy_output_event(ppl, pipy_Data_new(buffer, ptr - buffer));
      }
      pipy_output_event(ppl, pipy_MessageEnd_new(0, 0));
    }
  }
}

void pipy_module_init() {
  pipy_define_variable(id_variable_modbusDeviceName, "__modbusDeviceName", "modbus-nmi", pjs_undefined());
  pipy_define_variable(id_variable_modbusSlaveID, "__modbusSlaveID", "modbus-nmi", pjs_undefined());
  pipy_define_variable(id_variable_modbusBaud, "__modbusBaud", "modbus-nmi", pjs_undefined());
  pipy_define_variable(id_variable_modbusRecords, "__modbusRecords", "modbus-nmi", pjs_undefined());
  pipy_define_pipeline("", pipeline_init, pipeline_free, pipeline_process);
}

