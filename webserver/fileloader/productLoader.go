package fileloader

import (
	"encoding/json"
	"os"
)

type Product struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type ProductsData struct {
	Products []Product `json:"products"`
}

func LoadProducts() (ProductsData, error) {
	var data ProductsData
	jsonData, err := os.ReadFile("data/products.json")
	if err != nil {
		return data, err
	}
	err = json.Unmarshal(jsonData, &data)
	return data, err
}
