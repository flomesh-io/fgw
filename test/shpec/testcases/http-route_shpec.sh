
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

# cp -f "config/$name/config.json" pjs/
(pipy ../../pjs/main.js --admin-port=12301 --no-graph --args --config "config/$name/config.json" >tmp/pipy.log 2>&1 &)
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

describe "SHPEC http route Test"

  start="$(date +%s%3N)"
  output_header1_8848="$(curl -s -i -H 'a:1' -H 'b:2' http://127.0.0.1/path?abc=1)"
  output_header2_8848="$(curl -s -i -H 'c:3' http://127.0.0.1/path?def=2)"
  output_header3_8848="$(curl -s -i -H 'a:1' -H 'b:2' 'http://127.0.0.1/path?abc=1&def=2' | sed 's/&//g')"
  output_header4_8848="$(curl -s -i -H 'a:1' -H 'b:2' -H 'c:3' 'http://127.0.0.1/path?abc=1&def=2' | sed 's/&//g')"
  output_header5_8848="$(curl -s -i -H 'a:1' -H 'b:2' -H 'c:3' http://127.0.0.1/path/abc?def=2)"
  output_header6_8849="$(curl -s -i -H 'a:2' -H 'b:2' -X GET http://127.0.0.1/path?def=2)"
  output_method1_8848="$(curl -s -i -H 'a:1' -H 'b:2' -H 'c:3' -X GET 'http://127.0.0.1/path?abc=1&def=2' | sed 's/&//g')"
  output_method2_8848="$(curl -s -i -H 'a:1' -H 'b:2' -H 'c:3' -X POST 'http://127.0.0.1/path?abc=1&def=2' | sed 's/&//g')"
  output_method3_8849="$(curl -s -i -H 'a:1' -H 'b:2' -X DELETE http://127.0.0.1/path?def=2)"
  output_param1_8849="$(curl -s -i -H 'a:1' -H 'b:2' http://127.0.0.1/path?abc=2)"
  output_param2_8849="$(curl -s -i -H 'a:1' -H 'b:2' http://127.0.0.1/path?def=1)"
  output_path1_8846="$(curl -s -i -H 'a:1' -H 'b:2' -H 'c:3' http://127.0.0.1/path/abc)"
  output_path2_8846="$(curl -s -i -H 'a:1' -H 'b:2' -H 'c:3' http://127.0.0.1/path/abc/tail?def=1)"
  output_path3_8846="$(curl -s -i http://127.0.0.1/path/abc/tail)"
  output_path4_8847="$(curl -s -i http://127.0.0.1/path/tail)"
  output_path5_8847="$(curl -s -i -H 'a:1' -H 'b:2' -H 'c:3' -X POST http://127.0.0.1/path/abc/tail?def=1)"
  output_path6_8848="$(curl -s -i -H 'a:1' -H 'b:2' -H 'c:3' 'http://127.0.0.1/path/abc/tail?abc=1&def=2' | sed 's/&//g')"
  output_path7_8848="$(curl -s -i -H 'a:1' -H 'b:2' -H 'c:3' 'http://127.0.0.1/path/abc?abc=1&def=2' | sed 's/&//g')"
  output_path8_8849="$(curl -s -i -H 'a:1' -H 'b:20' -H 'c:30' http://127.0.0.1/path?def=2)"
  output_path9_8849="$(curl -s -i -H 'a:1' -H 'b:2' -H 'c:3' http://127.0.0.1/pat?def=2)"
  end="$(date +%s%3N)"
  runtime=$((end-start))

  it "match header case 1"
    assert grep "$output_header1_8848" 'www-port-8849'
  end
  it "match header case 2"
    assert grep "$output_header2_8848" 'www-port-8849'
  end
  it "match header case 3"
    assert grep "$output_header3_8848" 'www-port-8849'
  end
  it "match header case 4"
    assert grep "$output_header4_8848" 'www-port-8848'
  end
  it "match header case 5"
    assert grep "$output_header5_8848" 'www-port-8846'
  end
  it "match header case 6"
    assert grep "$output_header6_8849" 'www-port-8849'
  end

  it "match method case 1"
    assert grep "$output_method1_8848" 'www-port-8848'
  end
  it "match method case 2"
    assert grep "$output_method2_8848" 'www-port-8848'
  end
  it "match method case 3"
    assert grep "$output_method3_8849" 'www-port-8849'
  end

  it "match param case 1"
    assert grep "$output_param1_8849" 'www-port-8849'
  end
  it "match param case 2"
    assert grep "$output_param2_8849" 'www-port-8849'
  end

  it "match path case 1"
    assert grep "$output_path1_8846" 'www-port-8846'
  end
  it "match path case 2"
    assert grep "$output_path2_8846" 'www-port-8846'
  end
  it "match path case 3"
    assert grep "$output_path3_8846" 'www-port-8846'
  end
  it "match path case 4"
    assert grep "$output_path4_8847" 'www-port-8847'
  end
  it "match path case 5"
    assert grep "$output_path5_8847" 'www-port-8847'
  end
  it "match path case 6"
    assert grep "$output_path6_8848" 'www-port-8848'
  end
  it "match path case 7"
    assert grep "$output_path7_8848" 'www-port-8848'
  end
  it "match path case 8"
    assert grep "$output_path8_8849" 'www-port-8849'
  end
  it "match path case 9"
    assert grep "$output_path9_8849" 'www-port-8849'
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

