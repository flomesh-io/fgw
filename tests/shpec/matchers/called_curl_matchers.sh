
status_200() {
  assert present "$1" "HTTP/1.1 200 OK"
}

content_type() {
  assert present "$1" "Content-Type: $2;"
}

