#include <arpa/inet.h>
#include <assert.h>
#include <errno.h>
#include <math.h>
#include <stdarg.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/time.h>
#include <time.h>

#include "modbus.h"

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

static modbus_t *init_modbus(char *device, int slave, int baud,
                             char **err_msg) {
  int port = 0;
  char host[256] = {'\0'};
  modbus_t *ctx = NULL;
  uint32_t old_response_to_sec;
  uint32_t old_response_to_usec;
  uint32_t new_response_to_sec;
  uint32_t new_response_to_usec;

  port = get_host_port(device, host);
  // printf("init_modbus, host: %s, port: %d\n", host, port);
  if ((port > 0) && ((ctx = modbus_new_tcp(host, port)) == NULL)) {
    *err_msg = "Unable to allocate libmodbus/TCP context\n";
    return NULL;
  } else if (port < 1 &&
             (ctx = modbus_new_rtu(device, baud, 'N', 8, 1)) == NULL) {
    *err_msg = "Unable to allocate libmodbus/RTU context\n";
    return NULL;
  }
  if (port < 1) {
    modbus_set_debug(ctx, FALSE);
    modbus_set_error_recovery(ctx, MODBUS_ERROR_RECOVERY_LINK |
                                       MODBUS_ERROR_RECOVERY_PROTOCOL);
    modbus_set_slave(ctx, slave);
    modbus_get_response_timeout(ctx, &old_response_to_sec,
                                &old_response_to_usec);
  }
  if (modbus_connect(ctx) == -1) {
    *err_msg = (char *)modbus_strerror(errno);
    fprintf(stderr, "Connection failed: %s\n", modbus_strerror(errno));
    modbus_free(ctx);
    return NULL;
  }
  /// modbus_get_response_timeout(ctx, &new_response_to_sec,
  /// &new_response_to_usec); assert(old_response_to_sec == new_response_to_sec
  /// && old_response_to_usec == new_response_to_usec);

  return ctx;
}

int main(int argc, char *argv[]) {
  int rc;
  char *device = "\0";
  int slave = 1;
  int baud = 9600;
  int addr;
  uint16_t value;
  modbus_t *ctx = NULL;
  char *err_msg = NULL;

  if (argc < 6) {
    printf("%s device(/dev/ttyUSB0) slave-id(1) baud(9600) write-address "
           "write-value [todo]\n",
           argv[0]);
    return -1;
  }
  device = argv[1];
  slave = atoi(argv[2]);
  baud = atoi(argv[3]);
  addr = atoi(argv[4]);
  value = atoi(argv[5]);

  printf("args device:%s, slave:%d, baud:%d, addr:%d, value:%d\n", device,
         slave, baud, addr, value);

  ctx = init_modbus(device, slave, baud, &err_msg);

  if (ctx == NULL) {
    printf("========= init modbus error: %s\n", (const char *)err_msg);
  } else {
    if (argc == 7) {
      rc = modbus_write_register(ctx, addr, value);
    } else {
      rc = -123456789;
    }
    printf("modbus_write_register, rc = %d, error = %s\n", rc,
           (char *)modbus_strerror(errno));
    modbus_close(ctx);
    modbus_free(ctx);
  }
  return 0;
}

