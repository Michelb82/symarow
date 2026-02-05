package fileloader

import (
	"encoding/json"
	"os"
)

type Team struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Processes   []string `json:"processes"`
}

type TeamsData struct {
	Teams []Team `json:"teams"`
}

func LoadTeams() (TeamsData, error) {
	var data TeamsData
	jsonData, err := os.ReadFile("data/teams.json")
	if err != nil {
		return data, err
	}
	err = json.Unmarshal(jsonData, &data)
	return data, err
}
