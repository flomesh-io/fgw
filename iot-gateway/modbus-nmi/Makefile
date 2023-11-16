ROOT_DIR = $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
PIPY_DIR = $(abspath ${ROOT_DIR}/../../..)

BIN_DIR = $(ROOT_DIR)
INC_DIR = $(abspath ${PIPY_DIR}/include) -I$(abspath ${PIPY_DIR}/src) -I/root/flomesh/libmodbus-3.1.10/src

PRODUCT = ${BIN_DIR}/modbus-nmi.so

CXXFLAGS = -std=c++11 -fPIC
LDFLAGS = -lpthread -lmodbus

OS = $(shell uname -s)

ifeq (${OS},Darwin)
  LDFLAGS = -Wl,-flat_namespace,-undefined,dynamic_lookup
endif

all: ${PRODUCT}

${PRODUCT}: ${ROOT_DIR}/modbus.c
	clang -I${INC_DIR} ${LDFLAGS} -fPIC -shared $< -o $@

clean:
	rm -f ${PRODUCT} modbus-writer

test:
	${BIN_DIR}/pipy main.js --threads=max --reuse-port

tool:
	clang -I${INC_DIR} ${LDFLAGS} modbus-writer.c -o modbus-writer
