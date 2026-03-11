const BLOCK_DEFAULT_WIDTH = 240;
const BLOCK_DEFAULT_HEIGHT = 120;
const BLOCK_HEADER_HEIGHT = 32;
const BLOCK_PADDING = 12;
const BLOCK_CORNER_RADIUS = 8;

class BlockContainer {
    constructor(bounds, attributes) {
        this.x = bounds.x;
        this.y = bounds.y;
        this.width = bounds.width;
        this.height = bounds.height;
        this.name = attributes.name || '';
        this.description = attributes.description || '';
        this.group = null;
        this.rect = null;
        this.title = null;
        this.desc = null;
    }

    render(svg) {
        const ns = 'http://www.w3.org/2000/svg';
        const g = document.createElementNS(ns, 'g');
        g.setAttribute('class', 'block-group');
        g.setAttribute('transform', `translate(${this.x}, ${this.y})`);

        const rect = document.createElementNS(ns, 'rect');
        rect.setAttribute('class', 'block-rect');
        rect.setAttribute('width', this.width);
        rect.setAttribute('height', this.height);
        rect.setAttribute('rx', BLOCK_CORNER_RADIUS);
        rect.setAttribute('ry', BLOCK_CORNER_RADIUS);
        rect.setAttribute('fill', 'white');
        rect.setAttribute('stroke', '#ddd');
        rect.setAttribute('stroke-width', 2);
        g.appendChild(rect);

        const title = document.createElementNS(ns, 'text');
        title.setAttribute('class', 'block-title');
        title.setAttribute('x', BLOCK_PADDING);
        title.setAttribute('y', BLOCK_PADDING + 16);
        title.setAttribute('font-weight', '600');
        title.setAttribute('font-size', '14');
        title.setAttribute('fill', '#333');
        title.textContent = this.name;
        g.appendChild(title);

        const desc = document.createElementNS(ns, 'text');
        desc.setAttribute('class', 'block-description');
        desc.setAttribute('x', BLOCK_PADDING);
        desc.setAttribute('y', BLOCK_PADDING + 36);
        desc.setAttribute('font-size', '12');
        desc.setAttribute('fill', '#666');
        desc.textContent = this.description;
        g.appendChild(desc);

        this.group = g;
        this.rect = rect;
        this.title = title;
        this.desc = desc;
        svg.appendChild(g);
        return g;
    }
}

class Capabilities extends BlockContainer {
    constructor(bounds, attributes) {
        super(bounds, attributes);
    }

    render(svg) {
        const g = super.render(svg);
        if (this.rect) {
            this.rect.setAttribute('stroke', '#ff6b6b');
            this.rect.setAttribute('stroke-width', 2);
        }
        return g;
    }
}

class CapabilityContainer extends BlockContainer {
    constructor(bounds, attributes) {
        super(bounds, attributes);
        this.isContainer = true;
    }

    render(svg) {
        const ns = 'http://www.w3.org/2000/svg';
        const g = document.createElementNS(ns, 'g');
        g.setAttribute('class', 'block-group');
        g.setAttribute('transform', `translate(${this.x}, ${this.y})`);

        const rect = document.createElementNS(ns, 'rect');
        rect.setAttribute('class', 'block-rect');
        rect.setAttribute('width', this.width);
        rect.setAttribute('height', this.height);
        rect.setAttribute('rx', BLOCK_CORNER_RADIUS);
        rect.setAttribute('ry', BLOCK_CORNER_RADIUS);
        rect.setAttribute('fill', '#fff5f5');
        rect.setAttribute('stroke', '#ff6b6b');
        rect.setAttribute('stroke-width', 2);
        g.appendChild(rect);

        const header = document.createElementNS(ns, 'rect');
        header.setAttribute('x', 0);
        header.setAttribute('y', 0);
        header.setAttribute('width', this.width);
        header.setAttribute('height', BLOCK_HEADER_HEIGHT);
        header.setAttribute('fill', '#ff6b6b');
        header.setAttribute('rx', BLOCK_CORNER_RADIUS);
        header.setAttribute('ry', BLOCK_CORNER_RADIUS);
        g.appendChild(header);

        const title = document.createElementNS(ns, 'text');
        title.setAttribute('class', 'block-title');
        title.setAttribute('x', BLOCK_PADDING);
        title.setAttribute('y', BLOCK_PADDING + 14);
        title.setAttribute('font-weight', '600');
        title.setAttribute('font-size', '14');
        title.setAttribute('fill', 'white');
        title.textContent = this.name;
        g.appendChild(title);

        const desc = document.createElementNS(ns, 'text');
        desc.setAttribute('class', 'block-description');
        desc.setAttribute('x', BLOCK_PADDING);
        desc.setAttribute('y', BLOCK_HEADER_HEIGHT + BLOCK_PADDING + 16);
        desc.setAttribute('font-size', '12');
        desc.setAttribute('fill', '#666');
        desc.textContent = this.description;
        g.appendChild(desc);

        this.group = g;
        this.rect = rect;
        this.title = title;
        this.desc = desc;
        svg.appendChild(g);
        return g;
    }
}

class Products extends BlockContainer {
    constructor(bounds, attributes) {
        super(bounds, attributes);
    }

    render(svg) {
        const g = super.render(svg);
        if (this.rect) {
            this.rect.setAttribute('stroke', '#4a90e2');
            this.rect.setAttribute('stroke-width', 2);
        }
        return g;
    }
}

class Teams extends BlockContainer {
    constructor(bounds, attributes) {
        super(bounds, attributes);
    }

    render(svg) {
        const g = super.render(svg);
        if (this.rect) {
            this.rect.setAttribute('stroke', '#50c878');
            this.rect.setAttribute('stroke-width', 2);
        }
        return g;
    }
}

class Pipelines extends BlockContainer {
    constructor(bounds, attributes) {
        super(bounds, attributes);
    }

    render(svg) {
        const g = super.render(svg);
        if (this.rect) {
            this.rect.setAttribute('stroke', '#9b59b6');
            this.rect.setAttribute('stroke-width', 2);
        }
        return g;
    }
}

class Architecture extends BlockContainer {
    constructor(bounds, attributes) {
        super(bounds, attributes);
    }

    render(svg) {
        const g = super.render(svg);
        if (this.rect) {
            this.rect.setAttribute('stroke', '#ffa500');
            this.rect.setAttribute('stroke-width', 2);
        }
        return g;
    }
}

class Process extends BlockContainer {
    constructor(bounds, attributes) {
        super(bounds, attributes);
    }

    render(svg) {
        const g = super.render(svg);
        if (this.rect) {
            this.rect.setAttribute('stroke', '#646cff');
            this.rect.setAttribute('stroke-width', 2);
        }
        return g;
    }
}

class Valuestream extends BlockContainer {
    constructor(bounds, attributes) {
        super(bounds, attributes);
    }

    render(svg) {
        const g = super.render(svg);
        if (this.rect) {
            this.rect.setAttribute('fill', '#fef3c7');
            this.rect.setAttribute('stroke', '#d97706');
            this.rect.setAttribute('stroke-width', 2);
        }
        return g;
    }
}

export { Capabilities, CapabilityContainer, Products, Teams, Pipelines, Architecture, Process, Valuestream, BLOCK_DEFAULT_WIDTH, BLOCK_DEFAULT_HEIGHT };
