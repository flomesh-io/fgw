package main

import (
	"fmt"
	"time"
)

func main() {
	fmt.Printf("%x", time.Now().UnixNano())
}
