package fileloader

import (
	"encoding/json"
	"os"
)

type Architecture struct {
	SoftwareSystem SoftwareSystem `json:"software-system"`
}

type SoftwareSystem struct {
	Components []Component `json:"components"`
}

type Component struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

func LoadArchitecture() (Architecture, error) {
	var architecture Architecture
	jsonData, err := os.ReadFile("data/architecture.json")
	if err != nil {
		return architecture, err
	}
	err = json.Unmarshal(jsonData, &architecture)
	return architecture, err
}
