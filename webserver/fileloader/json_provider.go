package fileloader

import "fmt"

// LoadJSONForPath loads the JSON data for the given request path.
// Path should be the raw path (e.g. "/products", "/capabilities").
// Returns the loaded data and nil error, or nil and an error if the path is unknown or loading fails.
func LoadJSONForPath(path string) (any, error) {
	switch path {
		case "/products":
			return LoadProducts()
		case "/capabilities":
			return LoadCapabilities()
		case "/teams":
			return LoadTeams()
		case "/architecture":
			return LoadArchitecture()
		case "/pipelines":
			return LoadPipelines()
		case "/valuestreams":
			return LoadValuestreams()
		default:
			return nil, fmt.Errorf("unknown path: %s", path)
	}
}
