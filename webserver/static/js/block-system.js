// Block System - Drag, Drop, Relations, and Drill-down
class BlockSystem {
    constructor() {
        this.blocks = [];
        this.relations = [];
        this.selectedBlock = null;
        this.draggedBlock = null;
        this.offset = { x: 0, y: 0 };
        this.blockIdCounter = 0;
        
        this.init();
    }
    
    init() {
        if (!window.pageData || !window.pageType) {
            console.error('Page data or type not found');
            return;
        }
        
        this.parseData(window.pageData, window.pageType);
        this.renderBlocks();
        this.renderRelations();
        this.setupEventListeners();
    }
    
    parseData(data, type) {
        let items = [];
        
        switch(type) {
            case 'products':
                items = data.products || [];
                items.forEach((item, index) => {
                    this.blocks.push({
                        id: `block-${this.blockIdCounter++}`,
                        type: 'product',
                        data: item,
                        x: 100 + (index % 4) * 250,
                        y: 100 + Math.floor(index / 4) * 200,
                        width: 200,
                        height: 150,
                        relations: item.products || []
                    });
                });
                break;
                
            case 'teams':
                items = data.teams || [];
                items.forEach((team, index) => {
                    this.blocks.push({
                        id: `block-${this.blockIdCounter++}`,
                        type: 'team',
                        data: team,
                        x: 100 + (index % 4) * 250,
                        y: 100 + Math.floor(index / 4) * 200,
                        width: 200,
                        height: 150,
                        relations: team.processes || []
                    });
                });
                break;
                
            case 'capabilities':
                this.parseCapabilities(data.capabilities || [], 100, 100, 0);
                break;
                
            case 'architecture':
                if (data.softwareSystem && data.softwareSystem.components) {
                    this.parseComponents(data.softwareSystem.components, 100, 100, 0);
                }
                break;
                
            case 'pipelines':
                items = data.pipelines || [];
                items.forEach((pipeline, index) => {
                    this.blocks.push({
                        id: `block-${this.blockIdCounter++}`,
                        type: 'pipeline',
                        data: pipeline,
                        x: 100 + (index % 4) * 250,
                        y: 100 + Math.floor(index / 4) * 200,
                        width: 200,
                        height: 150,
                        relations: []
                    });
                });
                break;
        }
    }
    
    parseCapabilities(capabilities, startX, startY, level) {
        capabilities.forEach((cap, index) => {
            const block = {
                id: `block-${this.blockIdCounter++}`,
                type: 'capability',
                data: cap,
                x: startX + level * 50,
                y: startY + index * 200,
                width: 200,
                height: 150,
                relations: []
            };
            
            // Add relations based on products and processes
            if (cap.products && cap.products.length > 0) {
                block.relations.push(...cap.products.map(p => ({ type: 'product', target: p })));
            }
            if (cap.processes && cap.processes.length > 0) {
                block.relations.push(...cap.processes.map(p => ({ type: 'process', target: p })));
            }
            
            this.blocks.push(block);
            
            // Recursively parse nested capabilities
            if (cap.capabilities && cap.capabilities.length > 0) {
                this.parseCapabilities(cap.capabilities, startX + 300, startY + index * 200, level + 1);
            }
        });
    }
    
    parseComponents(components, startX, startY, level) {
        components.forEach((comp, index) => {
            const block = {
                id: `block-${this.blockIdCounter++}`,
                type: 'component',
                data: comp,
                x: startX + level * 50,
                y: startY + index * 200,
                width: 200,
                height: 150,
                relations: []
            };
            
            this.blocks.push(block);
            
            // Recursively parse nested components
            if (comp.components && comp.components.length > 0) {
                this.parseComponents(comp.components, startX + 300, startY + index * 200, level + 1);
            }
        });
    }
    
    renderBlocks() {
        const container = document.getElementById('blocks-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.blocks.forEach(block => {
            const blockEl = document.createElement('div');
            blockEl.className = `block block-${block.type}`;
            blockEl.id = block.id;
            blockEl.style.left = block.x + 'px';
            blockEl.style.top = block.y + 'px';
            blockEl.style.width = block.width + 'px';
            blockEl.style.height = block.height + 'px';
            blockEl.draggable = true;
            
            // Block content
            const title = document.createElement('div');
            title.className = 'block-title';
            title.textContent = block.data.name || block.data.id || 'Unnamed';
            
            const desc = document.createElement('div');
            desc.className = 'block-description';
            desc.textContent = block.data.description || '';
            
            blockEl.appendChild(title);
            blockEl.appendChild(desc);
            
            // Click handler for drill-down
            blockEl.addEventListener('click', (e) => {
                if (e.target === blockEl || blockEl.contains(e.target)) {
                    this.handleDrillDown(block);
                }
            });
            
            container.appendChild(blockEl);
        });
    }
    
    renderRelations() {
        const svg = document.getElementById('relations-svg');
        if (!svg) return;
        
        // Clear existing lines
        svg.innerHTML = '';
        
        // Update SVG size to match canvas
        const canvas = document.getElementById('canvas');
        if (canvas) {
            svg.setAttribute('width', canvas.offsetWidth);
            svg.setAttribute('height', canvas.offsetHeight);
        }
        
        // Draw relations between blocks
        this.blocks.forEach(block => {
            if (block.relations && block.relations.length > 0) {
                block.relations.forEach(relation => {
                    const targetBlock = this.findBlockByRelation(relation, block);
                    if (targetBlock) {
                        this.drawRelation(block, targetBlock);
                    }
                });
            }
        });
    }
    
    findBlockByRelation(relation, sourceBlock) {
        // Find target block based on relation
        return this.blocks.find(b => {
            if (relation.type === 'product' && b.type === 'product') {
                return b.data.id === relation.target || b.data.name === relation.target;
            }
            if (relation.type === 'process' && b.type === 'team') {
                return b.data.processes && b.data.processes.includes(relation.target);
            }
            return false;
        });
    }
    
    drawRelation(sourceBlock, targetBlock) {
        const svg = document.getElementById('relations-svg');
        if (!svg) return;
        
        const sourceEl = document.getElementById(sourceBlock.id);
        const targetEl = document.getElementById(targetBlock.id);
        if (!sourceEl || !targetEl) return;
        
        const sourceRect = sourceEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const canvasRect = svg.getBoundingClientRect();
        
        const x1 = sourceRect.left - canvasRect.left + sourceRect.width / 2;
        const y1 = sourceRect.top - canvasRect.top + sourceRect.height / 2;
        const x2 = targetRect.left - canvasRect.left + targetRect.width / 2;
        const y2 = targetRect.top - canvasRect.top + targetRect.height / 2;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', '#666');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('marker-end', 'url(#arrowhead)');
        
        svg.appendChild(line);
        
        // Add arrowhead marker if not exists
        if (!document.getElementById('arrowhead')) {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.setAttribute('id', 'arrowhead');
            marker.setAttribute('markerWidth', '10');
            marker.setAttribute('markerHeight', '10');
            marker.setAttribute('refX', '9');
            marker.setAttribute('refY', '3');
            marker.setAttribute('orient', 'auto');
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', '0 0, 10 3, 0 6');
            polygon.setAttribute('fill', '#666');
            marker.appendChild(polygon);
            defs.appendChild(marker);
            svg.appendChild(defs);
        }
    }
    
    setupEventListeners() {
        const container = document.getElementById('blocks-container');
        if (!container) return;
        
        // Drag and drop
        container.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('block')) {
                this.draggedBlock = e.target;
                this.offset.x = e.clientX - e.target.offsetLeft;
                this.offset.y = e.clientY - e.target.offsetTop;
                e.target.style.opacity = '0.5';
            }
        });
        
        container.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('block')) {
                e.target.style.opacity = '1';
                this.updateBlockPosition(e.target);
                this.renderRelations();
            }
        });
        
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (this.draggedBlock) {
                const canvas = document.getElementById('canvas');
                const canvasRect = canvas.getBoundingClientRect();
                const x = e.clientX - canvasRect.left - this.offset.x;
                const y = e.clientY - canvasRect.top - this.offset.y;
                this.draggedBlock.style.left = Math.max(0, x) + 'px';
                this.draggedBlock.style.top = Math.max(0, y) + 'px';
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.renderRelations();
        });
    }
    
    updateBlockPosition(blockEl) {
        const block = this.blocks.find(b => b.id === blockEl.id);
        if (block) {
            block.x = parseInt(blockEl.style.left);
            block.y = parseInt(blockEl.style.top);
        }
    }
    
    handleDrillDown(block) {
        // Navigate to detail page or next level
        const baseUrl = window.nextPageBase || '';
        const blockId = block.data.id || block.data.name || block.id;
        const url = `${baseUrl}/${encodeURIComponent(blockId)}`;
        window.location.href = url;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new BlockSystem();
    });
} else {
    new BlockSystem();
}
