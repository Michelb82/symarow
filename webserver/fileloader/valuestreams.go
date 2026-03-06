package fileloader

import (
	"encoding/json"
	"os"
)

type Valuestream struct {
	id string `json:"id"`
	name string `json:"name"`
	description string `json:"description"`
}

type Valuestreams struct {
	Valuestreams []Valuestream `json:"valuestreams"`
}

func LoadValuestreams() (Valuestreams, error) {
	var valuestreams Valuestreams
	jsonData, err := os.ReadFile("data/valuestreams.json")
	if err != nil {
		return valuestreams, err
	}
	err = json.Unmarshal(jsonData, &valuestreams)
	return valuestreams, err
}
