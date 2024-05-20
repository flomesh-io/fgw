
# in shpec/matchers/curl_code.sh
curl_code() {
  curl -s -i $1 > /dev/null 2>&1
  assert equal "$?" "$2"
}

