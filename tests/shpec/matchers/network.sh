
# in shpec/matchers/network.sh
still_alive() {
  ping -c 1 "$1" > /dev/null 2>&1
  assert equal "$?" 0
}


