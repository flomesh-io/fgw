
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

describe "SHPEC HTTP health-check Test"
  start="$(date +%s%3N)"
  output_1="$(curl -v http://127.0.0.1:8080/ >/dev/null 2>&1)"
  output_2="$(curl -v http://127.0.0.1:8080/ >/dev/null 2>&1)"
  echo "sleep 30 seconds"
  sleep 35
  output_3="$(curl -v http://127.0.0.1:8080/ 2>/dev/null)"
  output_4="$(curl -v http://127.0.0.1:8080/ 2>/dev/null)"
  pipylog="$(cat tmp/pipy.log | grep refused)"
  end="$(date +%s%3N)"
  runtime=$((end-start))

  it "check Connection refused"
    assert grep "$pipylog" 'Connection refused'
  end

  it "check www1"
    assert grep "$output_3" '<p>www1</p>'
  end

  it "check www1 again"
    assert grep "$output_4" '<p>www1</p>'
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

