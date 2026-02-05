package fileloader

import (
	"encoding/json"
	"os"
)

type Pipeline struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type PipelinesData struct {
	Pipelines []Pipeline `json:"pipelines"`
}

func LoadPipelines() (PipelinesData, error) {
	var data PipelinesData
	jsonData, err := os.ReadFile("data/pipelines.json")
	if err != nil {
		// If file doesn't exist, return empty data
		return data, nil
	}
	err = json.Unmarshal(jsonData, &data)
	return data, err
}
