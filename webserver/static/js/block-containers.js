const BLOCK_DEFAULT_WIDTH = 220;
const BLOCK_DEFAULT_HEIGHT = 72;

class BlockContainers {
    constructor(bounds, attributes) {
        this.x = bounds.x;
        this.y = bounds.y;
        this.width = bounds.width ?? BLOCK_DEFAULT_WIDTH;
        this.height = bounds.height ?? BLOCK_DEFAULT_HEIGHT;
        this.attributes = attributes;
    }

    /**
     * Render this block into the given SVG element.
     * @param {SVGElement} svg - The SVG to append to
     */
    render(svg) {
        const ns = 'http://www.w3.org/2000/svg';
        const rect = document.createElementNS(ns, 'rect');
        rect.setAttribute('x', this.x);
        rect.setAttribute('y', this.y);
        rect.setAttribute('width', this.width);
        rect.setAttribute('height', this.height);
        rect.setAttribute('rx', 6);
        rect.setAttribute('ry', 6);
        rect.setAttribute('fill', '#f0f4f8');
        rect.setAttribute('stroke', '#334155');
        rect.setAttribute('stroke-width', 1);
        svg.appendChild(rect);

        const name = this.attributes?.name ?? '';
        const text = document.createElementNS(ns, 'text');
        text.setAttribute('x', this.x + 12);
        text.setAttribute('y', this.y + 24);
        text.setAttribute('font-size', 14);
        text.setAttribute('font-weight', '600');
        text.setAttribute('fill', '#1e293b');
        text.textContent = name.length > 28 ? name.slice(0, 25) + '…' : name;
        svg.appendChild(text);

        const desc = this.attributes?.description ?? '';
        if (desc) {
            const descText = document.createElementNS(ns, 'text');
            descText.setAttribute('x', this.x + 12);
            descText.setAttribute('y', this.y + 44);
            descText.setAttribute('font-size', 12);
            descText.setAttribute('fill', '#64748b');
            descText.textContent = desc.length > 32 ? desc.slice(0, 29) + '…' : desc;
            svg.appendChild(descText);
        }
    }
}

/**
 * Capabilities are the top-level container for all capabilities.
 * They contain sub-capabilities, products, and processes.
 */
class Capabilities extends BlockContainers {
    constructor(bounds, attributes) {
        super(bounds, attributes);
        this.validateAttributes(attributes);
    }
}

Capabilities.prototype.validateAttributes = function(attributes) {
    if (!attributes.name) {
        throw new Error('Name is required');
    }
    if (!attributes.description) {
        throw new Error('Description is required');
    }
}

Capabilities.prototype.getAttributes = function() {
    return this.attributes;
}

/**
 * Products are the containers for all products.
 * They contain sub-products, processes, and teams.
 */

class Products extends BlockContainers {
    constructor(bounds, attributes) {
        super(bounds, attributes);
        this.validateAttributes(attributes);
    }
}

Products.prototype.validateAttributes = function(attributes) {
    if (!attributes.name) {
        throw new Error('Name is required');
    }

    if (!attributes.description) {
        throw new Error('Description is required');
    }

    if (!attributes.id) {
        throw new Error('ID is required');
    }
}

Products.prototype.getAttributes = function() {
    return this.attributes;
}

/**
 * Teams are the containers for all teams.
 * They contain sub-teams, processes, and products.
 */

class Teams extends BlockContainers {
    constructor(bounds, attributes) {
        super(bounds, attributes);
        this.validateAttributes(attributes);
    }
}

Teams.prototype.validateAttributes = function(attributes) {
    if (!attributes.name) {
        throw new Error('Name is required');
    }
}

/**
 * Pipelines are the containers for all pipelines.
 * They contain sub-pipelines, processes, and products.
 */

class Pipelines extends BlockContainers {
    constructor(bounds, attributes) {
        super(bounds, attributes);
        this.validateAttributes(attributes);
    }
}

Pipelines.prototype.validateAttributes = function(attributes) {
    if (!attributes.name) {
        throw new Error('Name is required');
    }
}

Pipelines.prototype.getAttributes = function() {
    return this.attributes;
}

/**
 * Architecture blocks (software-system and components).
 */
class Architecture extends BlockContainers {
    constructor(bounds, attributes) {
        super(bounds, attributes);
        this.validateAttributes(attributes);
    }
}

Architecture.prototype.validateAttributes = function(attributes) {
    if (!attributes.name) {
        throw new Error('Name is required');
    }
}

Architecture.prototype.getAttributes = function() {
    return this.attributes;
}

export { Capabilities, Products, Teams, Pipelines, Architecture, BLOCK_DEFAULT_WIDTH, BLOCK_DEFAULT_HEIGHT };