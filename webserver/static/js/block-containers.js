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
     * Render this block into the given SVG element as a draggable group.
     * @param {SVGElement} svg - The SVG to append to
     * @returns {SVGGElement} The group element (for drag wiring)
     */
    render(svg) {
        const ns = 'http://www.w3.org/2000/svg';
        const g = document.createElementNS(ns, 'g');
        g.setAttribute('transform', `translate(${this.x},${this.y})`);
        g.setAttribute('class', 'block-group');
        g.style.cursor = 'grab';

        const rect = document.createElementNS(ns, 'rect');
        rect.setAttribute('x', 0);
        rect.setAttribute('y', 0);
        rect.setAttribute('width', this.width);
        rect.setAttribute('height', this.height);
        rect.setAttribute('rx', 6);
        rect.setAttribute('ry', 6);
        rect.setAttribute('fill', '#f0f4f8');
        rect.setAttribute('stroke', '#334155');
        rect.setAttribute('stroke-width', 1);
        rect.setAttribute('class', 'block-rect');
        g.appendChild(rect);

        const name = this.attributes?.name ?? '';
        const text = document.createElementNS(ns, 'text');
        text.setAttribute('x', 12);
        text.setAttribute('y', 24);
        text.setAttribute('font-size', 14);
        text.setAttribute('font-weight', '600');
        text.setAttribute('fill', '#1e293b');
        text.setAttribute('class', 'block-name');
        text.textContent = name.length > 28 ? name.slice(0, 25) + '…' : name;
        g.appendChild(text);

        const desc = this.attributes?.description ?? '';
        if (desc) {
            const descText = document.createElementNS(ns, 'text');
            descText.setAttribute('x', 12);
            descText.setAttribute('y', 44);
            descText.setAttribute('font-size', 12);
            descText.setAttribute('fill', '#64748b');
            descText.textContent = desc.length > 32 ? desc.slice(0, 29) + '…' : desc;
            g.appendChild(descText);
        }

        svg.appendChild(g);
        this.group = g;
        return g;
    }
}

/**
 * CapabilityContainer: a main (parent) capability box that visually contains sub-capabilities.
 * Renders as a large rect with a header; sub-capability blocks are placed inside by the layout.
 */
class CapabilityContainer extends BlockContainers {
    constructor(bounds, attributes) {
        super(bounds, attributes);
    }
}

CapabilityContainer.prototype.render = function (svg) {
    const ns = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('transform', `translate(${this.x},${this.y})`);
    g.setAttribute('class', 'block-group block-capability-container');
    g.style.cursor = 'default';

    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', 0);
    rect.setAttribute('y', 0);
    rect.setAttribute('width', this.width);
    rect.setAttribute('height', this.height);
    rect.setAttribute('rx', 8);
    rect.setAttribute('ry', 8);
    rect.setAttribute('fill', 'rgba(241,245,249,0.95)');
    rect.setAttribute('stroke', '#64748b');
    rect.setAttribute('stroke-width', 2);
    rect.setAttribute('stroke-dasharray', '6 4');
    rect.setAttribute('class', 'block-rect');
    g.appendChild(rect);

    const name = this.attributes?.name ?? '';
    const text = document.createElementNS(ns, 'text');
    text.setAttribute('x', 12);
    text.setAttribute('y', 22);
    text.setAttribute('font-size', 13);
    text.setAttribute('font-weight', '600');
    text.setAttribute('fill', '#475569');
    text.textContent = name.length > 36 ? name.slice(0, 33) + '…' : name;
    g.appendChild(text);

    svg.appendChild(g);
    this.group = g;
    return g;
};

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

/**
 * Process block (same as base; distinct styling can be added via class).
 */
class Process extends BlockContainers {
    constructor(bounds, attributes) {
        super(bounds, attributes);
        this.validateAttributes(attributes);
    }
}

Process.prototype.validateAttributes = function(attributes) {
    if (!attributes.name) {
        throw new Error('Name is required');
    }
};

Process.prototype.getAttributes = function() {
    return this.attributes;
};

/**
 * Value stream block: same as base but with a drill-down magnifying glass icon.
 */
class Valuestream extends BlockContainers {
    constructor(bounds, attributes) {
        super(bounds, attributes);
        this.validateAttributes(attributes);
    }
}

Valuestream.prototype.validateAttributes = function(attributes) {
    if (!attributes.name) {
        throw new Error('Name is required');
    }
};

Valuestream.prototype.getAttributes = function() {
    return this.attributes;
};

Valuestream.prototype.render = function(svg) {
    const ns = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('transform', `translate(${this.x},${this.y})`);
    g.setAttribute('class', 'block-group block-valuestream');
    g.style.cursor = 'grab';

    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', 0);
    rect.setAttribute('y', 0);
    rect.setAttribute('width', this.width);
    rect.setAttribute('height', this.height);
    rect.setAttribute('rx', 6);
    rect.setAttribute('ry', 6);
    rect.setAttribute('fill', '#fef3c7');
    rect.setAttribute('stroke', '#d97706');
    rect.setAttribute('stroke-width', 1);
    rect.setAttribute('class', 'block-rect');
    g.appendChild(rect);

    const name = this.attributes?.name ?? '';
    const text = document.createElementNS(ns, 'text');
    text.setAttribute('x', 12);
    text.setAttribute('y', 24);
    text.setAttribute('font-size', 14);
    text.setAttribute('font-weight', '600');
    text.setAttribute('fill', '#1e293b');
    text.setAttribute('class', 'block-name');
    text.textContent = name.length > 28 ? name.slice(0, 25) + '…' : name;
    g.appendChild(text);

    const desc = this.attributes?.description ?? '';
    if (desc) {
        const descText = document.createElementNS(ns, 'text');
        descText.setAttribute('x', 12);
        descText.setAttribute('y', 44);
        descText.setAttribute('font-size', 12);
        descText.setAttribute('fill', '#64748b');
        descText.textContent = desc.length > 32 ? desc.slice(0, 29) + '…' : desc;
        g.appendChild(descText);
    }

    const iconSize = 18;
    const iconX = this.width - iconSize - 10;
    const iconY = (this.height - iconSize) / 2;
    const fo = document.createElementNS(ns, 'foreignObject');
    fo.setAttribute('x', iconX);
    fo.setAttribute('y', iconY);
    fo.setAttribute('width', iconSize);
    fo.setAttribute('height', iconSize);
    const div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
    div.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    div.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#d97706;font-size:14px;';
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-magnifying-glass';
    icon.setAttribute('title', 'Drill down');
    div.appendChild(icon);
    fo.appendChild(div);
    g.appendChild(fo);

    svg.appendChild(g);
    this.group = g;
    return g;
};

export { Capabilities, CapabilityContainer, Products, Teams, Pipelines, Architecture, Process, Valuestream, BLOCK_DEFAULT_WIDTH, BLOCK_DEFAULT_HEIGHT };