
### header ###
export pipy=`ps aux | grep "pipy pjs/main.js --admin-port=12301" | grep -v grep | awk '{print $2}'`
if ! [ "x$pipy" = "x" ]; then
    kill -9 "$pipy" > /dev/null
fi
export name=`echo "$BASH_SOURCE" | awk -F "[./]" '{print $4}'`
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

describe "SHPEC black white list Test"

  it "Check white list 1"
    assert curl_code "--interface 127.0.0.1 http://127.0.0.1/" "52"
  end

  it "Check white list 2"
    assert curl_code "--interface 127.0.0.11 http://127.0.0.1/" "0"
  end

  it "Check black list 1"
    assert curl_code "--interface 127.0.0.11 http://127.0.0.1:81/" "52"
  end

  it "Check black list 2"
    assert curl_code "--interface 127.0.0.1 http://127.0.0.1:81/" "0"
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

