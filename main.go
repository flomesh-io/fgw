package main

import (
	"github.com/flomesh-io/fgw/pkg/config"
	"github.com/flomesh-io/fgw/pkg/constants"
	"github.com/flomesh-io/fgw/pkg/repo"
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"k8s.io/apimachinery/pkg/util/wait"
	"k8s.io/klog/v2"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

const (
	ScriptsRoot = "pjs"
	RepoHost    = "localhost:6060"
	RepoRootUrl = "http://" + RepoHost
	HealthPath  = "/healthz"
	ReadyPath   = "/readyz"
)

func main() {
	cmd := exec.Command("pipy")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	klog.Infof("cmd = %v", cmd)

	if err := cmd.Start(); err != nil {
		klog.Fatal(err)
		os.Exit(1)
	}

	if err := initRepo(); err != nil {
		klog.Fatal(err)
		os.Exit(1)
	}

	startHealthAndReadyProbeServer()
}

func initRepo() error {
	klog.Infof("[MGR] Initializing PIPY Repo ...")
	// wait until pipy repo is up or timeout after 5 minutes
	repoClient := repo.NewRepoClient(RepoRootUrl)

	if err := wait.PollImmediate(5*time.Second, 60*5*time.Second, func() (bool, error) {
		if repoClient.IsRepoUp() {
			klog.Info("Repo is READY!")
			return true, nil
		}

		klog.Info("Repo is not up, sleeping ...")
		return false, nil
	}); err != nil {
		klog.Errorf("Error happened while waiting for repo up, %s", err)
		return err
	}

	// initialize the repo
	if err := repoClient.Batch(getBatches()); err != nil {
		return err
	}

	if err := repoClient.DeriveCodebase(constants.DefaultGatewayPath, constants.DefaultGatewayBasePath); err != nil {
		return err
	}

	go func() {
		// wait for pipy client to reconnect
		klog.Info("Sleep for a while ...")
		time.Sleep(5 * time.Second)
		// update version of config.json to trigger pipy client reloading
		klog.Info("Updating version of config.json ...")
		if err := config.UpdateConfigVersion(constants.DefaultGatewayBasePath, repoClient); err != nil {
			klog.Errorf("Failed to update config version: %s", err)
		}
	}()

	return nil
}

func getBatches() []repo.Batch {
	return []repo.Batch{fgwBatch()}
}

func fgwBatch() repo.Batch {
	return createBatch(constants.DefaultGatewayBasePath, ScriptsRoot)
}

func createBatch(repoPath, scriptsDir string) repo.Batch {
	batch := repo.Batch{
		Basepath: repoPath,
		Items:    []repo.BatchItem{},
	}

	for _, file := range listFiles(scriptsDir) {
		content, err := ioutil.ReadFile(file)
		if err != nil {
			panic(err)
		}

		balancerItem := repo.BatchItem{
			Path:     strings.TrimPrefix(filepath.Dir(file), scriptsDir),
			Filename: filepath.Base(file),
			Content:  string(content),
		}
		batch.Items = append(batch.Items, balancerItem)
	}

	return batch
}

func listFiles(root string) (files []string) {
	err := filepath.Walk(root, visit(&files))

	if err != nil {
		panic(err)
	}

	return files
}

func visit(files *[]string) filepath.WalkFunc {
	return func(path string, info os.FileInfo, err error) error {
		if err != nil {
			klog.Errorf("prevent panic by handling failure accessing a path %q: %v\n", path, err)
			return err
		}

		if !info.IsDir() {
			*files = append(*files, path)
		}

		return nil
	}
}

func startHealthAndReadyProbeServer() {
	router := gin.Default()
	router.GET(HealthPath, health)
	router.GET(ReadyPath, health)
	if err := router.Run(":8081"); err != nil {
		klog.Errorf("Failed to start probe server: %s", err)
		os.Exit(1)
	}
}

func health(c *gin.Context) {
	conn, err := net.DialTimeout("tcp", RepoHost, 5*time.Second)
	defer conn.Close()

	if err == nil {
		c.String(http.StatusOK, "OK")
		return
	}

	switch err := err.(type) {
	case *net.OpError:
		if err.Timeout() {
			c.String(http.StatusGatewayTimeout, "TIMEOUT")
		}
	default:
		c.String(http.StatusServiceUnavailable, "FAILED")
	}
}
