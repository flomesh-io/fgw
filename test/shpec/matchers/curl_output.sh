
# in shpec/matchers/curl_output.sh
curl_output() {
  output=`curl -s -i $1`
  assert grep "$output" "$2"
}

