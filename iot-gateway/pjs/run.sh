#!/bin/bash

cd /root/pipy-modbus

mkdir -p data

export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$PWD

nohup /root/pipy-modbus/pipy /root/pipy-modbus/main.js &


