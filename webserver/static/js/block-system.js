import { BlockParser } from './block-parser.js';
import { Capabilities, CapabilityContainer, Products, Teams, Pipelines, Architecture, Process, Valuestream, BLOCK_DEFAULT_WIDTH, BLOCK_DEFAULT_HEIGHT } from './block-containers.js';

const PAD = 24;
const BLOCK_GAP = 20;
const DEPTH_INDENT = 24;

/**
 * Builds a map from item id (or name) to index for relation resolution.
 * @param {Array} items - Parsed items
 * @returns {Map<string, number>}
 */
function buildIdToIndex(items) {
    const map = new Map();
    items.forEach((item, i) => {
        if (item.id != null) map.set(String(item.id), i);
        map.set(String(item.name), i);
    });
    return map;
}

const PRODUCTS_VALUESTREAMS_CAPABILITIES_TEAMS = new Set(['product', 'valuestream', 'capability', 'team']);

/**
 * Converts unified model nodes to items for layout/rendering. Optionally filters by type.
 * @param {Array} nodes - Model nodes from GET /model { id, name, description, type, relations }
 * @param {string} filter - 'products-valuestreams-capabilities' | 'all' | or a node type
 * @returns {Array} Items with dataType, id, name, description, relations
 */
function modelNodesToItems(nodes, filter) {
    if (!Array.isArray(nodes)) return [];
    let list;
    if (filter === 'products-valuestreams-capabilities') {
        list = nodes.filter((n) => PRODUCTS_VALUESTREAMS_CAPABILITIES_TEAMS.has(n.type));
    } else if (filter === 'products-valuestreams') {
        list = nodes.filter((n) => n.type === 'product' || n.type === 'valuestream');
    } else if (filter === 'all' || !filter) {
        list = nodes;
    } else {
        list = nodes.filter((n) => n.type === filter);
    }
    return list.map((n) => ({
        dataType: n.type,
        id: n.id,
        name: n.name,
        description: n.description ?? '',
        parentId: n.parentId ?? n.parentID ?? null,
        relations: (n.relations || []).map((r) => ({ type: r.type, id: r.id ?? r.ID })),
    }));
}

/**
 * Builds list of edges [fromIndex, toIndex] from items' relations or parentId.
 * @param {Array} items - Parsed items
 * @param {string} type - View type ('architecture' uses parentId; else uses relations)
 * @returns {Array<[number, number]>}
 */
function buildEdges(items, type) {
    const idToIndex = buildIdToIndex(items);
    const edges = [];
    const add = (a, b) => {
        if (a === b) return;
        const key = a < b ? `${a},${b}` : `${b},${a}`;
        if (!seen.has(key)) {
            seen.add(key);
            edges.push([a, b]);
        }
    };
    const seen = new Set();

    if (type === 'architecture') {
        for (let i = 0; i < items.length; i++) {
            const parentId = items[i].parentId;
            if (parentId == null) continue;
            const parentIndex = idToIndex.get(String(parentId));
            if (parentIndex != null) add(parentIndex, i);
        }
        return edges;
    }

    for (let i = 0; i < items.length; i++) {
        const relations = items[i].relations;
        if (!Array.isArray(relations)) continue;
        for (const rel of relations) {
            const targetId = rel.id ?? rel.ID ?? rel.targetId;
            if (targetId == null) continue;
            const j = idToIndex.get(String(targetId));
            if (j != null) add(i, j);
        }
    }
    return edges;
}

/**
 * Relation-based layout: unrelated blocks on opposite sides with margin;
 * related blocks adjacent with a line; relation-heavy (hub) blocks centered.
 * @param {Array} items - Parsed items (mutated with x, y, width, height)
 * @param {number} viewWidth - Canvas width
 * @param {number} viewHeight - Canvas height
 * @param {Array<[number, number]>} edges - Pairs of item indices
 */
function layoutRelationBased(items, viewWidth, viewHeight, edges) {
    const n = items.length;
    const w = Math.min(BLOCK_DEFAULT_WIDTH, viewWidth - 2 * PAD);
    const h = BLOCK_DEFAULT_HEIGHT;

    for (const item of items) {
        item.width = Math.max(w, 120);
        item.height = h;
    }

    if (n === 0) return;
    if (n === 1) {
        items[0].x = viewWidth / 2 - items[0].width / 2;
        items[0].y = viewHeight / 2 - items[0].height / 2;
        return;
    }

    const degree = new Array(n).fill(0);
    const neighbors = new Array(n).fill(null).map(() => []);
    for (const [a, b] of edges) {
        degree[a]++;
        degree[b]++;
        neighbors[a].push(b);
        neighbors[b].push(a);
    }

    const slotOrder = [];
    const slotOf = new Array(n).fill(-1);
    const byDegree = items.map((_, i) => i).sort((a, b) => degree[b] - degree[a]);
    let placeUnrelatedLeft = true;

    function updateSlotOf() {
        for (let k = 0; k < slotOrder.length; k++) slotOf[slotOrder[k]] = k;
    }

    for (const i of byDegree) {
        if (slotOrder.length === 0) {
            slotOrder.push(i);
            updateSlotOf();
            continue;
        }
        let insertAt = -1;
        for (const j of neighbors[i]) {
            const sj = slotOf[j];
            if (sj < 0) continue;
            const tryLeft = sj;
            const tryRight = sj + 1;
            if (tryLeft >= 0 && (insertAt < 0 || tryLeft < insertAt)) insertAt = tryLeft;
            if (tryRight <= slotOrder.length && (insertAt < 0 || tryRight < insertAt)) insertAt = tryRight;
        }
        if (insertAt < 0) {
            insertAt = placeUnrelatedLeft ? 0 : slotOrder.length;
            placeUnrelatedLeft = !placeUnrelatedLeft;
        }
        slotOrder.splice(insertAt, 0, i);
        updateSlotOf();
    }

    const numSlots = slotOrder.length;
    const totalBlockWidth = numSlots * w + (numSlots - 1) * BLOCK_GAP;
    const startX = Math.max(PAD, (viewWidth - totalBlockWidth) / 2);
    const startY = Math.max(PAD, (viewHeight - h) / 2);

    for (let s = 0; s < numSlots; s++) {
        const i = slotOrder[s];
        items[i].x = startX + s * (w + BLOCK_GAP);
        items[i].y = startY;
    }
}

/**
 * Fallback linear layout when no relation data (e.g. capabilities list).
 * @param {Array} items - Parsed items (mutated)
 * @param {number} viewWidth - Available width
 */
function layoutLinear(items, viewWidth = 800) {
    const w = Math.min(BLOCK_DEFAULT_WIDTH, viewWidth - 2 * PAD);
    const h = BLOCK_DEFAULT_HEIGHT;
    let y = PAD;
    for (const item of items) {
        const depth = item.depth ?? 0;
        item.x = PAD + depth * DEPTH_INDENT;
        item.y = y;
        item.width = Math.max(w - depth * DEPTH_INDENT, 120);
        item.height = h;
        y += h + BLOCK_GAP;
    }
}

const CONTAINER_HEADER_H = 40;
const CONTAINER_PAD = 12;

/**
 * Builds a flat item list with capability containment: root capabilities become containers
 * with their direct children placed inside. Non-capability items and child capabilities get bounds.
 * @param {Array} items - Items from modelNodesToItems (have dataType, id, parentId, etc.)
 * @param {number} viewWidth - Canvas width
 * @returns {Array} New flat list: nonCaps, then for each root [container, ...children]
 */
function buildContainmentItems(items, viewWidth) {
    const w = Math.min(BLOCK_DEFAULT_WIDTH, viewWidth - 2 * PAD);
    const h = BLOCK_DEFAULT_HEIGHT;
    const nonCap = items.filter((i) => i.dataType !== 'capability');
    const caps = items.filter((i) => i.dataType === 'capability');
    const capIds = new Set(caps.map((c) => c.id));
    const roots = caps.filter((c) => !c.parentId || !capIds.has(c.parentId));

    const out = [];
    let currentY = PAD;
    const startX = Math.max(PAD, (viewWidth - w) / 2);

    for (const item of nonCap) {
        item.x = startX;
        item.y = currentY;
        item.width = Math.max(w, 120);
        item.height = h;
        out.push(item);
        currentY += h + BLOCK_GAP;
    }

    for (const root of roots) {
        const children = caps.filter((c) => c.parentId === root.id);

        if (children.length === 0) {
            root.x = startX;
            root.y = currentY;
            root.width = Math.max(w, 120);
            root.height = h;
            out.push(root);
            currentY += h + BLOCK_GAP;
            continue;
        }

        const innerH = children.length * (h + BLOCK_GAP) - BLOCK_GAP;
        const containerHeight = CONTAINER_HEADER_H + CONTAINER_PAD + innerH + CONTAINER_PAD;
        const containerWidth = Math.max(w + 2 * CONTAINER_PAD, 200);
        const containerX = Math.max(PAD, (viewWidth - containerWidth) / 2);

        const containerItem = {
            dataType: 'capability',
            id: root.id,
            name: root.name,
            description: root.description ?? '',
            relations: root.relations ?? [],
            isContainer: true,
            x: containerX,
            y: currentY,
            width: containerWidth,
            height: containerHeight,
        };
        out.push(containerItem);

        let childY = currentY + CONTAINER_HEADER_H + CONTAINER_PAD;
        const childX = containerX + CONTAINER_PAD;
        const childW = containerWidth - 2 * CONTAINER_PAD;

        for (const child of children) {
            child.x = childX;
            child.y = childY;
            child.width = Math.max(childW, 120);
            child.height = h;
            out.push(child);
            childY += h + BLOCK_GAP;
        }

        currentY += containerHeight + BLOCK_GAP;
    }

    return out;
}

/**
 * Total height needed for the current items (for SVG viewBox).
 */
function computeContentHeight(items) {
    if (items.length === 0) return 400;
    let maxBottom = 0;
    for (const item of items) maxBottom = Math.max(maxBottom, item.y + item.height);
    return maxBottom + PAD;
}

/**
 * Vertical layout: stack blocks in a single column, centered horizontally. Keeps blocks on screen.
 * @param {Array} items - Parsed items (mutated with x, y, width, height)
 * @param {number} viewWidth - Canvas width
 */
function layoutVertical(items, viewWidth) {
    const w = Math.min(BLOCK_DEFAULT_WIDTH, viewWidth - 2 * PAD);
    const h = BLOCK_DEFAULT_HEIGHT;
    const startX = Math.max(PAD, (viewWidth - w) / 2);
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        item.width = Math.max(w, 120);
        item.height = h;
        item.x = startX;
        item.y = PAD + i * (h + BLOCK_GAP);
    }
}

/**
 * Builds a block container instance from a parsed item with bounds.
 * @param {Object} item - Must have dataType, x, y, width, height, and type-specific attributes
 * @returns {BlockContainers}
 */
function toBlockContainer(item) {
    const bounds = { x: item.x, y: item.y, width: item.width, height: item.height };
    const attributes = {
        name: item.name,
        description: item.description,
        ...item,
    };
    switch (item.dataType) {
        case 'capability':
            return item.isContainer ? new CapabilityContainer(bounds, attributes) : new Capabilities(bounds, attributes);
        case 'product':
            return new Products(bounds, attributes);
        case 'team':
            return new Teams(bounds, attributes);
        case 'pipeline':
            return new Pipelines(bounds, attributes);
        case 'architecture':
            return new Architecture(bounds, attributes);
        case 'valuestream':
            return new Valuestream(bounds, attributes);
        case 'process':
            return new Process(bounds, attributes);
        default:
            return new Capabilities(bounds, attributes);
    }
}

class BlockSystem {
    constructor(svg, data, type, filter) {
        this.svg = svg;
        this.data = data;
        this.type = type;
        this.filter = filter;
        this.blocks = [];
    }

    init() {
        const isModel = this.type === 'model';
        const rawNodes = isModel && this.data ? (this.data.nodes || []) : [];
        const items = isModel
            ? modelNodesToItems(rawNodes, this.filter)
            : BlockParser.parse(this.data, this.type);
        if (items.length === 0) return;

        const viewWidth = Math.max(400, Number(this.svg.getAttribute('width')) || 800);
        const viewHeight = Math.max(400, Number(this.svg.getAttribute('height')) || 600);
        this.svg.setAttribute('width', viewWidth);
        this.svg.setAttribute('height', viewHeight);
        this.svg.setAttribute('viewBox', `0 0 ${viewWidth} ${viewHeight}`);
        const edgeType = isModel ? 'model' : this.type;

        if (this.type === 'model') {
            const hasCapabilitiesWithParent = items.some((i) => i.dataType === 'capability' && i.parentId);
            if (hasCapabilitiesWithParent) {
                const withContainment = buildContainmentItems(items, viewWidth);
                items.length = 0;
                items.push(...withContainment);
            } else {
                layoutVertical(items, viewWidth);
            }
            const contentHeight = computeContentHeight(items);
            this.svg.setAttribute('height', Math.max(viewHeight, contentHeight));
            this.svg.setAttribute('viewBox', `0 0 ${viewWidth} ${Math.max(viewHeight, contentHeight)}`);
        }

        const edges = buildEdges(items, edgeType);
        if (this.type !== 'model') {
            if (edges.length > 0) layoutRelationBased(items, viewWidth, viewHeight, edges);
            else layoutLinear(items, viewWidth);
        }

        this.blocks = items.map((item) => toBlockContainer(item));
        this.edges = edges;
        this.renderRelations();
        this.renderBlocks();
        this.blocks.forEach((block, i) => {
            if (block.group) block.group.setAttribute('data-block-index', String(i));
        });
        this.setupDrag();
    }

    renderBlocks() {
        this.blocks.forEach((block) => block.render(this.svg));
    }

    renderRelations() {
        this.relationLines = [];
        if (!this.edges || this.edges.length === 0) return;
        const ns = 'http://www.w3.org/2000/svg';
        for (const [i, j] of this.edges) {
            const a = this.blocks[i];
            const b = this.blocks[j];
            if (!a || !b) continue;
            const line = document.createElementNS(ns, 'line');
            line.setAttribute('stroke', '#94a3b8');
            line.setAttribute('stroke-width', 2);
            this.svg.insertBefore(line, this.svg.firstChild);
            this.relationLines.push({ line, i, j });
        }
        this.updateRelationLines();
    }

    updateRelationLines() {
        if (!this.relationLines) return;
        for (const { line, i, j } of this.relationLines) {
            const a = this.blocks[i];
            const b = this.blocks[j];
            if (!a || !b) continue;
            const x1 = a.x + a.width / 2;
            const y1 = a.y + a.height / 2;
            const x2 = b.x + b.width / 2;
            const y2 = b.y + b.height / 2;
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
        }
    }

    setupDrag() {
        const svg = this.svg;
        let dragging = false;
        let blockIndex = -1;
        let startBlockX = 0;
        let startBlockY = 0;
        let startPt = null;

        function toSvgPoint(clientX, clientY) {
            const pt = svg.createSVGPoint();
            pt.x = clientX;
            pt.y = clientY;
            return pt.matrixTransform(svg.getScreenCTM().inverse());
        }

        function onMouseDown(e) {
            const g = e.target.closest('.block-group');
            if (!g) return;
            const idx = g.getAttribute('data-block-index');
            if (idx == null) return;
            e.preventDefault();
            dragging = true;
            blockIndex = Number(idx);
            const block = this.blocks[blockIndex];
            if (!block) return;
            startBlockX = block.x;
            startBlockY = block.y;
            startPt = toSvgPoint(e.clientX, e.clientY);
            svg.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        }

        function onMouseMove(e) {
            if (!dragging || blockIndex < 0) return;
            const block = this.blocks[blockIndex];
            if (!block || !block.group) return;
            const pt = toSvgPoint(e.clientX, e.clientY);
            block.x = startBlockX + (pt.x - startPt.x);
            block.y = startBlockY + (pt.y - startPt.y);
            block.group.setAttribute('transform', `translate(${block.x},${block.y})`);
            this.updateRelationLines();
        }

        function onMouseUp() {
            if (dragging) {
                dragging = false;
                blockIndex = -1;
                svg.style.cursor = '';
                document.body.style.userSelect = '';
            }
        }

        svg.addEventListener('mousedown', onMouseDown.bind(this));
        document.addEventListener('mousemove', onMouseMove.bind(this));
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mouseleave', onMouseUp);
    }
}

export { BlockSystem, layoutLinear as layout, layoutRelationBased, buildEdges, toBlockContainer };