package fileloader

import (
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"strings"
	"sync"
)

var (
	compiledModel   *Model
	compileModelOnce sync.Once
)

// capNode is used to unmarshal capability tree nodes.
type capNode struct {
	Type         string    `json:"type"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	Valuestreams []string  `json:"valuestreams"`
	Processes    []string  `json:"processes"`
	Capabilities []capNode `json:"capabilities"`
}

// processPayload is used to unmarshal processes.json.
type processPayload struct {
	Processes []struct {
		ID          string     `json:"id"`
		Name        string     `json:"name"`
		Description string     `json:"description"`
		Relations   []Relation `json:"relations"`
	} `json:"processes"`
}

// productPayload is used to unmarshal products.json (with relations).
type productPayload struct {
	Products []struct {
		ID          string     `json:"id"`
		Name        string     `json:"name"`
		Description string     `json:"description"`
		Relations   []Relation `json:"relations"`
	} `json:"products"`
}

// valuestreamPayload is used to unmarshal valuestreams.json.
type valuestreamPayload struct {
	Valuestreams []struct {
		ID          string `json:"id"`
		Name        string `json:"name"`
		Description string `json:"description"`
	} `json:"valuestreams"`
}

// capabilitiesPayload is used to unmarshal capabilities.json.
type capabilitiesPayload struct {
	Capabilities []capNode `json:"capabilities"`
}

// architecturePayload is used to unmarshal architecture.json.
type architecturePayload struct {
	SoftwareSystem *struct {
		ID          string `json:"id"`
		Name        string `json:"name"`
		Description string `json:"description"`
		Components  []struct {
			ID          string   `json:"id"`
			Name        string   `json:"name"`
			Description string   `json:"description"`
			Processes   []string `json:"processes"`
		} `json:"components"`
	} `json:"software-system"`
}

// teamsPayload is used to unmarshal teams.json.
type teamsPayload struct {
	Teams []struct {
		ID          string   `json:"id"`
		Name        string   `json:"name"`
		Description string   `json:"description"`
		Processes   []string `json:"processes"`
	} `json:"teams"`
}

// pipelinesPayload is used to unmarshal pipelines.json.
type pipelinesPayload struct {
	Pipelines []struct {
		ID          string     `json:"id"`
		Name        string     `json:"name"`
		Description string     `json:"description"`
		Relations   []Relation `json:"relations"`
	} `json:"pipelines"`
}

var slugRE = regexp.MustCompile(`[^a-z0-9-]+`)

func slug(s string) string {
	return slugRE.ReplaceAllString(strings.ToLower(strings.TrimSpace(s)), "-")
}

func loadProcesses() ([]Node, error) {
	data, err := os.ReadFile("data/processes.json")
	if err != nil {
		return nil, err
	}
	var p processPayload
	if err := json.Unmarshal(data, &p); err != nil {
		return nil, err
	}
	nodes := make([]Node, 0, len(p.Processes))
	for _, proc := range p.Processes {
		relations := make([]Relation, 0, len(proc.Relations))
		for _, r := range proc.Relations {
			relations = append(relations, Relation{Type: r.Type, ID: r.ID})
		}
		nodes = append(nodes, Node{
			ID:          proc.ID,
			Name:        proc.Name,
			Description: proc.Description,
			Type:        "process",
			Relations:   relations,
		})
	}
	return nodes, nil
}

func loadProductsForModel() ([]Node, error) {
	data, err := os.ReadFile("data/products.json")
	if err != nil {
		return nil, err
	}
	var p productPayload
	if err := json.Unmarshal(data, &p); err != nil {
		return nil, err
	}
	nodes := make([]Node, 0, len(p.Products))
	for _, prod := range p.Products {
		relations := make([]Relation, 0, len(prod.Relations))
		for _, r := range prod.Relations {
			relations = append(relations, Relation{Type: r.Type, ID: r.ID})
		}
		nodes = append(nodes, Node{
			ID:          prod.ID,
			Name:        prod.Name,
			Description: prod.Description,
			Type:        "product",
			Relations:   relations,
		})
	}
	return nodes, nil
}

func loadValuestreamsForModel() ([]Node, error) {
	data, err := os.ReadFile("data/valuestreams.json")
	if err != nil {
		return nil, err
	}
	var p valuestreamPayload
	if err := json.Unmarshal(data, &p); err != nil {
		return nil, err
	}
	nodes := make([]Node, 0, len(p.Valuestreams))
	for _, vs := range p.Valuestreams {
		nodes = append(nodes, Node{
			ID:          vs.ID,
			Name:        vs.Name,
			Description: vs.Description,
			Type:        "valuestream",
		})
	}
	return nodes, nil
}

// collectValuestreams returns all valuestream IDs from this capability and its descendants (composite drill-down).
func collectValuestreams(c capNode) map[string]bool {
	out := make(map[string]bool)
	for _, vsID := range c.Valuestreams {
		out[vsID] = true
	}
	for _, child := range c.Capabilities {
		for vsID := range collectValuestreams(child) {
			out[vsID] = true
		}
	}
	return out
}

// processNameToTeamIDs maps process name (as in capabilities/teams JSON) to team IDs for capability–team linking.
func getProcessNameToTeamIDs() (map[string][]string, error) {
	data, err := os.ReadFile("data/teams.json")
	if err != nil {
		return nil, err
	}
	var p teamsPayload
	if err := json.Unmarshal(data, &p); err != nil {
		return nil, err
	}
	out := make(map[string][]string)
	for i, t := range p.Teams {
		teamID := t.ID
		if teamID == "" {
			teamID = "team-" + fmt.Sprint(i)
		}
		for _, procName := range t.Processes {
			out[procName] = append(out[procName], teamID)
		}
	}
	return out, nil
}

func flattenCapabilities(caps []capNode, depth int, path, parentID string, processNameToTeamIDs map[string][]string) []Node {
	var nodes []Node
	for i, c := range caps {
		seg := path
		if seg != "" {
			seg += "/"
		}
		seg += slug(c.Name)
		id := seg
		if id == "" {
			id = "capability-" + fmt.Sprint(i)
		}
		allVS := collectValuestreams(c)
		relations := make([]Relation, 0, len(allVS))
		for vsID := range allVS {
			relations = append(relations, Relation{Type: "valuestream", ID: vsID})
		}
		// Link this capability to teams that share any of its processes (sub-capability → team when process matches).
		seenTeam := make(map[string]bool)
		for _, procName := range c.Processes {
			for _, teamID := range processNameToTeamIDs[procName] {
				if !seenTeam[teamID] {
					seenTeam[teamID] = true
					relations = append(relations, Relation{Type: "team", ID: teamID})
				}
			}
		}
		nodes = append(nodes, Node{
			ID:          id,
			Name:        c.Name,
			Description: c.Description,
			Type:        "capability",
			ParentID:    parentID,
			Relations:   relations,
		})
		if len(c.Capabilities) > 0 {
			nodes = append(nodes, flattenCapabilities(c.Capabilities, depth+1, seg, id, processNameToTeamIDs)...)
		}
	}
	return nodes
}

func loadCapabilitiesForModel(processNameToTeamIDs map[string][]string) ([]Node, error) {
	data, err := os.ReadFile("data/capabilities.json")
	if err != nil {
		return nil, err
	}
	var p capabilitiesPayload
	if err := json.Unmarshal(data, &p); err != nil {
		return nil, err
	}
	if processNameToTeamIDs == nil {
		processNameToTeamIDs = make(map[string][]string)
	}
	return flattenCapabilities(p.Capabilities, 0, "", "", processNameToTeamIDs), nil
}

func loadArchitectureForModel() ([]Node, error) {
	data, err := os.ReadFile("data/architecture.json")
	if err != nil {
		return nil, err
	}
	var p architecturePayload
	if err := json.Unmarshal(data, &p); err != nil {
		return nil, err
	}
	if p.SoftwareSystem == nil {
		return nil, nil
	}
	sys := p.SoftwareSystem
	nodes := []Node{{
		ID:          sys.ID,
		Name:        sys.Name,
		Description: sys.Description,
		Type:        "architecture",
	}}
	for _, comp := range sys.Components {
		nodes = append(nodes, Node{
			ID:          comp.ID,
			Name:        comp.Name,
			Description: comp.Description,
			Type:        "architecture",
			Relations:   []Relation{{Type: "architecture", ID: sys.ID}},
		})
	}
	return nodes, nil
}

func loadTeamsForModel() ([]Node, error) {
	data, err := os.ReadFile("data/teams.json")
	if err != nil {
		return []Node{}, nil
	}
	var p teamsPayload
	if err := json.Unmarshal(data, &p); err != nil {
		return nil, err
	}
	nodes := make([]Node, 0, len(p.Teams))
	for i, t := range p.Teams {
		id := t.ID
		if id == "" {
			id = "team-" + fmt.Sprint(i)
		}
		nodes = append(nodes, Node{
			ID:          id,
			Name:        t.Name,
			Description: t.Description,
			Type:        "team",
		})
	}
	return nodes, nil
}

func loadPipelinesForModel() ([]Node, error) {
	data, err := os.ReadFile("data/pipelines.json")
	if err != nil {
		return []Node{}, nil
	}
	var p pipelinesPayload
	if err := json.Unmarshal(data, &p); err != nil {
		return nil, err
	}
	nodes := make([]Node, 0, len(p.Pipelines))
	for i, pl := range p.Pipelines {
		id := pl.ID
		if id == "" {
			id = "pipeline-" + fmt.Sprint(i)
		}
		relations := make([]Relation, 0, len(pl.Relations))
		for _, r := range pl.Relations {
			relations = append(relations, Relation{Type: r.Type, ID: r.ID})
		}
		nodes = append(nodes, Node{
			ID:          id,
			Name:        pl.Name,
			Description: pl.Description,
			Type:        "pipeline",
			Relations:   relations,
		})
	}
	return nodes, nil
}

// CompileModel loads all data files and returns a single Model. Safe to call from multiple goroutines; compiles once.
func CompileModel() (*Model, error) {
	var err error
	compileModelOnce.Do(func() {
		compiledModel, err = compileModel()
	})
	if err != nil {
		return nil, err
	}
	return compiledModel, nil
}

func compileModel() (*Model, error) {
	var all []Node

	add := func(nodes []Node, e error) error {
		if e != nil {
			return e
		}
		all = append(all, nodes...)
		return nil
	}

	if err := add(loadProcesses()); err != nil {
		return nil, err
	}
	if err := add(loadProductsForModel()); err != nil {
		return nil, err
	}
	if err := add(loadValuestreamsForModel()); err != nil {
		return nil, err
	}
	processToTeams, err := getProcessNameToTeamIDs()
	if err != nil {
		return nil, err
	}
	if err := add(loadCapabilitiesForModel(processToTeams)); err != nil {
		return nil, err
	}
	if err := add(loadArchitectureForModel()); err != nil {
		return nil, err
	}
	if err := add(loadTeamsForModel()); err != nil {
		return nil, err
	}
	if err := add(loadPipelinesForModel()); err != nil {
		return nil, err
	}

	return &Model{Nodes: all}, nil
}
