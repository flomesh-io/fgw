package config

import (
	"fmt"
	"github.com/flomesh-io/fgw/pkg/repo"
	"github.com/tidwall/sjson"
	"k8s.io/klog/v2"
	"time"
)

func UpdateConfigVersion(basepath string, repoClient *repo.PipyRepoClient) error {
	json, err := getConfigJson(basepath, repoClient)
	if err != nil {
		return err
	}

	newJson, err := sjson.Set(json, "Version", time.Now().UnixMilli())
	if err != nil {
		klog.Errorf("Failed to update HTTP config: %s", err)
		return err
	}

	return updateConfigJson(basepath, repoClient, newJson)
}

func getConfigJson(basepath string, repoClient *repo.PipyRepoClient) (string, error) {
	path := getPathOfConfigJson(basepath)

	json, err := repoClient.GetFile(path)
	if err != nil {
		klog.Errorf("Get %q from pipy repo error: %s", path, err)
		return "", err
	}

	return json, nil
}

func updateConfigJson(basepath string, repoClient *repo.PipyRepoClient, newJson string) error {
	batch := repo.Batch{
		Basepath: basepath,
		Items: []repo.BatchItem{
			{
				Path:     "",
				Filename: "config.json",
				Content:  newJson,
			},
		},
	}

	if err := repoClient.Batch([]repo.Batch{batch}); err != nil {
		klog.Errorf("Failed to update %q: %s", getPathOfConfigJson(basepath), err)
		return err
	}

	return nil
}

func getPathOfConfigJson(basepath string) string {
	return fmt.Sprintf("%s/config.json", basepath)
}
