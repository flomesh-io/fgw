
### header ###
export main=`ps aux | grep pipy | grep " --admin-port=12300" | grep -v grep | awk '{print $2}'`
if ! [ "x$main" = "x" ]; then
    kill -9 "$main" > /dev/null
fi
# kill -SIGINT $pipypid
export pipy=`ps aux | grep pipy | grep " --admin-port=12301" | grep -v grep | awk '{print $2}'`
if ! [ "x$pipy" = "x" ]; then
    kill -9 "$pipy" > /dev/null
fi

export name=`echo "$BASH_SOURCE" | awk -F "[./]" '{print $4}'`

if test -f "config/$name/main.js"; then
    (pipy "config/$name/main.js" --admin-port=12300 >/dev/null 2>&1 &)
fi

cp -f "config/$name/config.json" pjs/
(pipy pjs/main.js --admin-port=12301 >tmp/pipy.log 2>&1 &)
for i in {1..10}
do
    cat tmp/pipy.log 2>&1 | grep "Thread 0 started" >/dev/null
    if ! [ $? -eq 0 ]; then
       sleep 0.5
    else
	break
    fi
done

### shell ###

describe "SHPEC circuit breaker Test"

  start="$(date +%s%3N)"
  output_error1_503="$(curl -s -i -k http://127.0.0.1/)"
  output_error2_503="$(curl -s -i -k http://127.0.0.1/)"
  output_error3_503="$(curl -s -i -k http://127.0.0.1/)"
  output_error4_409="$(curl -s -i -k http://127.0.0.1/)"
  output_slow1_200="$(curl -s -i -k http://127.0.0.1/slow)"
  output_slow2_200="$(curl -s -i -k http://127.0.0.1/slow)"
  output_slow3_200="$(curl -s -i -k http://127.0.0.1/slow)"
  output_slow4_409="$(curl -s -i -k http://127.0.0.1/slow)"
  echo "sleep 10 seconds"
  sleep 11
  output_error5_503="$(curl -s -i -k http://127.0.0.1/)"
  output_slow5_200="$(curl -s -i -k http://127.0.0.1/slow)"
  end="$(date +%s%3N)"
  runtime=$((end-start))

  it "status code > 499"
    assert grep "$output_error1_503" '503 Service Unavailable'
    assert grep "$output_error2_503" '503 Service Unavailable'
    assert grep "$output_error3_503" '503 Service Unavailable'
    assert grep "$output_error4_409" '409 Conflict'
    assert grep "$output_error5_503" '503 Service Unavailable'
  end
  it "slow query > 1s"
    assert grep "$output_slow1_200" '200 OK'
    assert grep "$output_slow2_200" '200 OK'
    assert grep "$output_slow3_200" '200 OK'
    assert grep "$output_slow4_409" '409 Conflict'
    assert grep "$output_slow5_200" '200 OK'
  end

end

### footer ###

export main=`ps aux | grep pipy | grep " --admin-port=12300" | grep -v grep | awk '{print $2}'`
if ! [ "x$main" = "x" ]; then
    kill -9 "$main" > /dev/null
fi
# kill -SIGINT $pipypid
export pipy=`ps aux | grep pipy | grep " --admin-port=12301" | grep -v grep | awk '{print $2}'`
if ! [ "x$pipy" = "x" ]; then
    kill -9 "$pipy" > /dev/null
fi

