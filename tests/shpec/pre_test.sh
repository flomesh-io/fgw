#!/bin/sh

 netstat --help > /dev/null 2>&1
 if ! [ $? -eq 0 ]; then
    echo "netstat: command not found"
    exit 1
 fi

for port in 80 81 443 2000 3000 4000 8443 8844 8845 8846 8847 8848 8849 8850 9443 ;
    do
       netstat -tulpn 2>&1 | grep LISTEN | grep ":$port "
       if [ $? -eq 0 ]; then
          echo "port: $port is being used by another application"
          exit 1
       fi
    done

 pipy -v > /dev/null 2>&1
 if ! [ $? -eq 0 ]; then
    echo "pipy: command not found"
    exit 1
 fi

 openssl md5 --help > /dev/null 2>&1
 if ! [ $? -eq 0 ]; then
    echo "openssl: command not found"
    exit 1
 fi

 curl --help > /dev/null 2>&1
 if ! [ $? -eq 0 ]; then
    echo "curl: command not found"
    exit 1
 fi

 cat --help > /dev/null 2>&1
 if ! [ $? -eq 0 ]; then
    echo "cat: command not found"
    exit 1
 fi

 grep --help > /dev/null 2>&1
 if ! [ $? -eq 0 ]; then
    echo "grep: command not found"
    exit 1
 fi

 shpec -v > /dev/null 2>&1
 if ! [ $? -eq 0 ]; then
    echo "shpec: command not found"
    echo 'please install: sh -c "`curl -L https://raw.githubusercontent.com/rylnd/shpec/master/install.sh`"'
    exit 1
 fi


echo "Use command 'shpec' to run all tests"



