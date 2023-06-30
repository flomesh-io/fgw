
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

describe "SHPEC throttle route Test"

  start="$(date +%s%3N)"
  curl -s -i http://127.0.0.1/tail > tmp/1.log
  curl -s -i http://127.0.0.1/tail > tmp/2.log
  curl -s -i http://127.0.0.1/tail > tmp/3.log
  curl -s -i http://127.0.0.1/tail > tmp/4.log &
  sleep 1
  curl -s -i http://127.0.0.1/tail > tmp/5.log &
  sleep 1
  curl -s -i http://127.0.0.1/tail > tmp/6.log &
  sleep 1
  curl -s -i http://127.0.0.1/tail > tmp/7.log &
  echo "sleep 30 seconds"
  sleep 30
  output_1="$(cat tmp/1.log)"
  output_2="$(cat tmp/2.log)"
  output_3="$(cat tmp/3.log)"
  output_4="$(cat tmp/4.log)"
  output_5="$(cat tmp/5.log)"
  output_6="$(cat tmp/6.log)"
  output_7="$(cat tmp/7.log)"
  end="$(date +%s%3N)"
  runtime=$((end-start))

  it "1: 200 OK"
    assert grep "$output_1" "200 OK"
  end

  it "2: 200 OK"
    assert grep "$output_2" "200 OK"
  end
  it "3: 200 OK"
    assert grep "$output_3" "200 OK"
  end
  it "4: 200 OK"
    assert grep "$output_4" "200 OK"
  end
  it "5: 200 OK"
    assert grep "$output_5" "200 OK"
  end
  it "6: 200 OK"
    assert grep "$output_6" "200 OK"
  end
  it "7: 431 Request"
    assert grep "$output_7" "431 Request"
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

