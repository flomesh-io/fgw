
# in shpec/matchers/tls_sni.sh
tls_sni() {
  output="$(echo | openssl s_client -servername $1 -connect $2 2>&1 | openssl x509 -noout -text | grep -o 'CN =.*\|DNS:.*')"
  assert grep "$output" "$3"
}

