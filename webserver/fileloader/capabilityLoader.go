package fileloader

import (
	"encoding/json"
	"os"
)

type Capability struct {
	Type         string       `json:"type"`
	Name         string       `json:"name"`
	Description  string       `json:"description"`
	Capabilities []Capability `json:"capabilities"`
	Products     []string     `json:"products"`
	Processes    []string     `json:"processes"`
}

type CapabilitiesData struct {
	Capabilities []Capability `json:"capabilities"`
}

func LoadCapabilities() (CapabilitiesData, error) {
	var data CapabilitiesData
	jsonData, err := os.ReadFile("data/capabilities.json")
	if err != nil {
		return data, err
	}
	err = json.Unmarshal(jsonData, &data)
	return data, err
}
