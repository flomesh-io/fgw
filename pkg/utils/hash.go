package utils

import (
	"fmt"
	"github.com/mitchellh/hashstructure/v2"
	"k8s.io/klog/v2"
)

func SimpleHash(obj interface{}) string {
	hash, err := hashstructure.Hash(obj, hashstructure.FormatV2, nil)

	if err != nil {
		klog.Errorf("Not able convert Data to hash, error: %s", err.Error())
		return ""
	}

	return fmt.Sprintf("%x", hash)
}
