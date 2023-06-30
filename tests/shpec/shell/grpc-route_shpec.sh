
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

describe "SHPEC grpc route Test"

  start="$(date +%s%3N)"
  output_header1_8846="$(curl -s -i -k -H 'host:test.com' -H 'canary:false' -H 'version:2' -H 'region:gz' https://127.0.0.1/com.example.GreetingService/Hello)"
  output_header2_8847="$(curl -s -i -k -H 'host:test.com' -H 'canary:true' https://127.0.0.1/com.example.secure/login)"
  output_header3_8849="$(curl -s -i -k -H 'host:test.com' -H 'canary:true' https://127.0.0.1/com.example.GreetingService/hello)"
  output_header4_8849="$(curl -s -i -k -H 'host:test.com' -H 'canary:false' https://127.0.0.1/com.example.GreetingService/Hello)"
  output_header5_8849="$(curl -s -i -k -H 'host:test.com' -H 'canary:false' -H 'version:2' -H 'region:gd' https://127.0.0.1/com.example.GreetingService/Hello)"
  output_header6_8849="$(curl -s -i -k -H 'host:test.com' -H 'canary:false' -H 'version:1' -H 'region:gd' https://127.0.0.1/com.example.secure/login)"
  output_method1_8846="$(curl -s -i -k -H 'host:test.com' -H 'canary:true' https://127.0.0.1/com.example.GreetingService/Hello)"
  output_method2_8847="$(curl -s -i -k -H 'host:test.com' -H 'canary:false' -H 'version:2' -H 'region:gd' https://127.0.0.1/com.example.secure/login)"
  output_method3_8849="$(curl -s -i -k -H 'host:test.com' -H 'canary:true' https://127.0.0.1/com.example.GreetingServic/Hello)"
  output_method4_8849="$(curl -s -i -k -H 'host:test.com' -H 'canary:true' https://127.0.0.1/com.example.secure/Login)"
  output_method5_8849="$(curl -s -i -k -H 'host:test.com' -H 'canary:true' https://127.0.0.1/com.example.sec/login)"
  end="$(date +%s%3N)"
  runtime=$((end-start))

  it "match header case 1"
    assert grep "$output_header1_8846" 'www-port-8846'
  end
  it "match header case 2"
    assert grep "$output_header2_8847" 'www-port-8847'
  end
  it "match header case 3"
    assert grep "$output_header3_8849" 'www-port-8849'
  end
  it "match header case 4"
    assert grep "$output_header4_8849" 'www-port-8849'
  end
  it "match header case 5"
    assert grep "$output_header5_8849" 'www-port-8849'
  end
  it "match header case 6"
    assert grep "$output_header6_8849" 'www-port-8849'
  end

  it "match service case 1"
    assert grep "$output_method1_8846" 'www-port-8846'
  end
  it "match service case 2"
    assert grep "$output_method2_8847" 'www-port-8847'
  end
  it "match service case 3"
    assert grep "$output_method3_8849" 'www-port-8849'
  end
  it "match service case 4"
    assert grep "$output_method4_8849" 'www-port-8849'
  end
  it "match service case 5"
    assert grep "$output_method5_8849" 'www-port-8849'
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

