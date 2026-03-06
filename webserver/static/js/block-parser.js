/**
 * Parsers for capabilities, products, teams, and architecture JSON.
 * Each parser returns a flat list of renderable objects; all metadata is on the object.
 */

/**
 * Flattens capabilities tree into a list of objects with full metadata.
 * Adds relations to value stream ids for linking.
 * @param {Array} capabilities - Array of capability nodes (may have nested capabilities)
 * @param {number} depth - Current nesting depth
 * @returns {Array} Flat list of { dataType, type, name, description, products, processes, valuestreams, relations, depth, ... }
 */
function parseCapabilities(capabilities, depth = 0) {
    if (!Array.isArray(capabilities)) return [];
    const items = [];
    for (const cap of capabilities) {
        const valuestreams = cap.valuestreams ?? [];
        const obj = {
            dataType: 'capability',
            type: cap.type || 'capability',
            name: cap.name,
            description: cap.description ?? '',
            products: cap.products ?? [],
            processes: cap.processes ?? [],
            valuestreams,
            relations: valuestreams.map((id) => ({ id: String(id) })),
            depth,
        };
        items.push(obj);
        if (Array.isArray(cap.capabilities) && cap.capabilities.length > 0) {
            items.push(...parseCapabilities(cap.capabilities, depth + 1));
        }
    }
    return items;
}

/**
 * Parses value streams from data (e.g. data.valuestreams or system-overview).
 * If not present, builds minimal items from ids collected from capabilities.
 * @param {Object} data - Root object with optional valuestreams array
 * @param {Array} capabilityItems - Already-parsed capability items (to collect valuestream ids)
 * @returns {Array} Flat list of { dataType: 'valuestream', id, name, description, drillable: true }
 */
function parseValuestreams(data, capabilityItems = []) {
    const fromData = data?.valuestreams;
    if (Array.isArray(fromData) && fromData.length > 0) {
        return fromData.map((vs) => ({
            dataType: 'valuestream',
            id: vs.id ?? vs.name,
            name: vs.name ?? vs.id ?? 'Value stream',
            description: vs.description ?? '',
            drillable: true,
        }));
    }
    const ids = new Set();
    for (const cap of capabilityItems) {
        for (const id of cap.valuestreams ?? []) ids.add(String(id));
    }
    return Array.from(ids).map((id) => ({
        dataType: 'valuestream',
        id,
        name: id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        description: '',
        drillable: true,
    }));
}

/**
 * Parses products JSON into a list of renderable objects.
 * @param {Object} data - Root object with products array
 * @returns {Array} List of { dataType, id, name, description }
 */
function parseProducts(data) {
    const products = data?.products;
    if (!Array.isArray(products)) return [];
    return products.map((p) => ({
        dataType: 'product',
        id: p.id,
        name: p.name,
        description: p.description ?? '',
        relations: p.relations ?? [],
    }));
}

/**
 * Parses teams JSON into a list of renderable objects.
 * @param {Object} data - Root object with teams array
 * @returns {Array} List of { dataType, name, description, processes }
 */
function parseTeams(data) {
    const teams = data?.teams;
    if (!Array.isArray(teams)) return [];
    return teams.map((t, i) => ({
        dataType: 'team',
        id: t.id ?? `team-${i}`,
        name: t.name,
        description: t.description ?? '',
        processes: t.processes ?? [],
        relations: t.relations ?? [],
    }));
}

/**
 * Flattens architecture (software-system + components) into a list of renderable objects.
 * @param {Object} data - Root object with software-system
 * @param {number} depth - Current nesting depth
 * @returns {Array} List of { dataType, type, name, description, depth, ... }
 */
function parseArchitecture(data, depth = 0) {
    const system = data?.softwareSystem ?? data?.['software-system'];
    if (!system) return [];

    const items = [];
    const push = (node, type = 'component', parentId = null) => {
        items.push({
            dataType: 'architecture',
            type,
            id: node.id ?? node.name,
            name: node.name,
            description: node.description ?? '',
            depth,
            parentId,
        });
    };

    push(system, 'software-system', null);
    const systemId = system.id ?? system.name;
    const components = system.components;
    if (Array.isArray(components)) {
        for (const comp of components) {
            items.push(...parseArchitectureNode(comp, depth + 1, systemId));
        }
    }
    return items;
}

function parseArchitectureNode(node, depth, parentId) {
    const items = [];
    const nodeId = node.id ?? node.name;
    items.push({
        dataType: 'architecture',
        type: 'component',
        id: nodeId,
        name: node.name,
        description: node.description ?? '',
        depth,
        parentId,
    });
    const children = node.components;
    if (Array.isArray(children)) {
        for (const child of children) {
            items.push(...parseArchitectureNode(child, depth + 1, nodeId));
        }
    }
    return items;
}

/**
 * Parses pipelines JSON. No pipelines.json in data; returns empty list or extend when file exists.
 */
function parsePipelines(data) {
    const pipelines = data?.pipelines;
    if (!Array.isArray(pipelines)) return [];
    return pipelines.map((p, i) => ({
        dataType: 'pipeline',
        id: p.id ?? `pipeline-${i}`,
        name: p.name,
        description: p.description ?? '',
        relations: p.relations ?? [],
        ...p,
    }));
}

class BlockParser {
    /**
     * Parse JSON data by type and return a flat list of objects to render.
     * Each object carries all metadata (dataType, name, description, etc.).
     *
     * @param {Object} data - Parsed JSON (e.g. from capabilities.json, products.json, ...)
     * @param {string} type - One of 'capabilities' | 'products' | 'teams' | 'architecture' | 'pipelines'
     * @returns {Array} List of renderable objects with metadata
     */
    static parse(data, type) {
        if (data == null) return [];
        let items = [];
        switch (type) {
            case 'capabilities': {
                const capabilityItems = parseCapabilities(data.capabilities ?? []);
                const valuestreamItems = parseValuestreams(data, capabilityItems);
                items = [...capabilityItems, ...valuestreamItems];
                break;
            }
            case 'products':
                items = parseProducts(data);
                break;
            case 'teams':
                items = parseTeams(data);
                break;
            case 'architecture':
                items = parseArchitecture(data);
                break;
            case 'pipelines':
                items = parsePipelines(data);
                break;
            default:
                throw new Error('Invalid type: ' + type);
        }
        return items;
    }
}

export { BlockParser, parseCapabilities, parseValuestreams, parseProducts, parseTeams, parseArchitecture, parsePipelines };
