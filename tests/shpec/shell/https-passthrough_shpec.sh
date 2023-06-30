
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

describe "SHPEC https passthrough Test"
  start="$(date +%s%3N)"
  output_1="$(curl -s -i -k --http1.1 --resolve test.com:8443:127.0.0.1 https://test.com:8443/)"
  output_2="$(curl -s -i -k --http1.1 --resolve www.test.com:8443:127.0.0.1 https://www.test.com:8443/)"
  curl -s -i -k --http1.1 --resolve no.test.com:8443:127.0.0.1 https://no.test.com:8443/
  code=$?
  end="$(date +%s%3N)"
  runtime=$((end-start))

  it "test domain1"
    assert grep "$output_1" "www-port-8849"
  end

  it "test domain2"
    assert grep "$output_2" "www-port-8850"
  end

  it "inlegal domain"
    assert equal $code "35"
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

