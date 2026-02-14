import { blockParser } from './block-parser.js';
import { Capabilities, Products, Teams, Pipelines, Architecture, BLOCK_DEFAULT_WIDTH, BLOCK_DEFAULT_HEIGHT } from './block-containers.js';

const PAD = 24;
const BLOCK_GAP = 16;
const DEPTH_INDENT = 24;

/**
 * Assigns x, y, width, height to each item for layout.
 * @param {Array} items - Parsed items (will be mutated)
 * @param {number} viewWidth - Available width for layout
 */
function layout(items, viewWidth = 800) {
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
            return new Capabilities(bounds, attributes);
        case 'product':
            return new Products(bounds, attributes);
        case 'team':
            return new Teams(bounds, attributes);
        case 'pipeline':
            return new Pipelines(bounds, attributes);
        case 'architecture':
            return new Architecture(bounds, attributes);
        default:
            return new Capabilities(bounds, attributes);
    }
}

class BlockSystem {
    constructor(svg, data, type) {
        this.svg = svg;
        this.data = data;
        this.type = type;
        this.blocks = [];
    }

    init() {
        const items = BlockParser.parse(this.data, this.type);
        if (items.length === 0) return;

        const viewWidth = this.svg.getAttribute('width') ? Number(this.svg.getAttribute('width')) : 800;
        layout(items, viewWidth);

        this.blocks = items.map((item) => toBlockContainer(item));
        this.renderBlocks();
        this.renderRelations();
    }

    renderBlocks() {
        this.blocks.forEach((block) => block.render(this.svg));
    }

    renderRelations() {
        // Relations can be added later when we have source/target data
    }
}

export { BlockSystem, layout, toBlockContainer };