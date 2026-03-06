package fileloader

// Relation describes a reference from one node to another (e.g. process → valuestream).
type Relation struct {
	Type string `json:"type"` // e.g. "valuestream", "capability", "architecture"
	ID   string `json:"id"`   // id of the target node
}

// Node is a single entity in the compiled model (process, product, valuestream, capability, etc.).
type Node struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Type        string     `json:"type"` // "process", "product", "valuestream", "capability", "architecture", "team", "pipeline"
	ParentID    string     `json:"parentId,omitempty"` // for capabilities: id of containing capability (empty for roots)
	Relations   []Relation `json:"relations,omitempty"`
}

// Model is the single compiled model served to the frontend.
type Model struct {
	Nodes []Node `json:"nodes"`
}
