
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

describe "SHPEC header modifier Test"

  start="$(date +%s%3N)"
  output="$(curl -s -i -H 'host: www.test.com'  http://127.0.0.1/ | tr -d '\n')"
  end="$(date +%s%3N)"
  runtime=$((end-start))

  it "request add header"
    assert grep "$output" '"accept": ".*,xxx"'
  end

  it "request set header"
    assert grep "$output" '"host": "set-bar"'
  end

  it "request delete header"
    assert no_grep "$output" 'user-agent:'
  end

  it "response set header"
    assert grep "$output" 'dummy1: set-bar'
  end

  it "response add header"
    assert grep "$output" 'dummy2: test2,add,baz'
  end

  it "response delete header"
    assert no_grep "$output" 'dummy3:'
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

