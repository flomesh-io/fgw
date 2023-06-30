
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

export REMOTE_LOGGING_ADDRESS=127.0.0.1:12301
export TRACING_ADDRESS=127.0.0.1:12301

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

describe "SHPEC metrics/tracing/logging Test"
  start="$(date +%s%3N)"
  output_1="$(curl -s -i -k --http1.1 -H 'host:www.test.com' http://127.0.0.1:8843/)"
  sleep 1
  pipylog="$(cat tmp/pipy.log | grep json | sed 's/|//g')"
  end="$(date +%s%3N)"
  runtime=$((end-start))

  it "curl request"
    assert grep "$output_1" "www-port-8850"
  end

  it "tracing json"
    assert grep "$pipylog" "\[tracing\] json:"
  end

  it "logging json"
    assert grep "$pipylog" "\[logging\] json:"
  end

  it "check json"
    assert grep "$pipylog" '"my-header6": "bar,baz"'
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

