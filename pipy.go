package main

import (
	"os"
	"os/exec"
)

func main() {
	cmd := exec.Command("pipy", "--log-level=debug:thread", "http://localhost:6060/repo/local/fgw/", "--args", "--debug") // #nosec G204
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		panic(err)
	}
}
