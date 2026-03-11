function parseProducts(data) {
    if (!data || !data.products) return [];
    return data.products.map((p) => ({
        dataType: 'product',
        id: p.id,
        name: p.name,
        description: p.description ?? '',
        relations: (p.relations || []).map((r) => ({ type: r.type, id: r.id ?? r.ID })),
    }));
}

function parseCapabilities(data) {
    if (!data || !data.capabilities) return [];
    return data.capabilities.map((c) => ({
        dataType: 'capability',
        id: c.id,
        name: c.name,
        description: c.description ?? '',
        relations: (c.relations || []).map((r) => ({ type: r.type, id: r.id ?? r.ID })),
    }));
}

function parseTeams(data) {
    if (!data || !data.teams) return [];
    return data.teams.map((t) => ({
        dataType: 'team',
        id: t.id,
        name: t.name,
        description: t.description ?? '',
        relations: (t.relations || []).map((r) => ({ type: r.type, id: r.id ?? r.ID })),
    }));
}

function parseArchitecture(data) {
    if (!data || !data.architecture) return [];
    return data.architecture.map((a) => ({
        dataType: 'architecture',
        id: a.id,
        name: a.name,
        description: a.description ?? '',
        relations: (a.relations || []).map((r) => ({ type: r.type, id: r.id ?? r.ID })),
    }));
}

function parsePipelines(data) {
    if (!data || !data.pipelines) return [];
    return data.pipelines.map((pl) => ({
        dataType: 'pipeline',
        id: pl.id,
        name: pl.name,
        description: pl.description ?? '',
        relations: (pl.relations || []).map((r) => ({ type: r.type, id: r.id ?? r.ID })),
    }));
}

function parseProcesses(data) {
    if (!data || !data.processes) return [];
    return data.processes.map((proc) => ({
        dataType: 'process',
        id: proc.id,
        name: proc.name,
        description: proc.description ?? '',
        relations: (proc.relations || []).map((r) => ({ type: r.type, id: r.id ?? r.ID })),
    }));
}

function parseValuestreams(data) {
    if (!data || !data.valuestreams) return [];
    return data.valuestreams.map((vs) => ({
        dataType: 'valuestream',
        id: vs.id,
        name: vs.name,
        description: vs.description ?? '',
        relations: (vs.relations || []).map((r) => ({ type: r.type, id: r.id ?? r.ID })),
    }));
}

const BlockParser = {
    parse: function (data, type) {
        switch (type) {
            case 'products':
                return parseProducts(data);
            case 'capabilities':
                return parseCapabilities(data);
            case 'teams':
                return parseTeams(data);
            case 'architecture':
                return parseArchitecture(data);
            case 'pipelines':
                return parsePipelines(data);
            case 'processes':
                return parseProcesses(data);
            case 'valuestreams':
                return parseValuestreams(data);
            default:
                return [];
        }
    },
};

export { BlockParser };
