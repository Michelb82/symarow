import { BlockSystem } from './block-system.js';

/**
 * Renders the diagram for the given data and type into the canvas container.
 * Creates an SVG, passes it to BlockSystem for drawing.
 * @param {Object} data - Parsed JSON from the server
 * @param {string} type - One of 'capabilities' | 'products' | 'teams' | 'architecture' | 'pipelines'
 */
function renderCanvas(data, type) {
    const container = document.getElementById('canvas');
    if (!container) return;

    container.innerHTML = '';

    const width = container.offsetWidth || 800;
    const height = Math.max(container.offsetHeight || 600, 400);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'block-diagram');
    container.appendChild(svg);

    const blockSystem = new BlockSystem(svg, data, type);
    blockSystem.init();
}

/**
 * Loads JSON for the given type and renders the canvas.
 * @param {string} type - data-type value (capabilities, products, teams, architecture, pipelines)
 */
function loadAndRender(type) {
    fetch(`/${type}`, { method: 'GET', headers: { Accept: 'application/json' } })
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then((data) => renderCanvas(data, type))
        .catch((err) => console.error('Error loading canvas data:', err));
}

/**
 * Sets up the canvas container and click handlers for data-type links.
 * Call once when the DOM is ready.
 */
function initCanvas() {
    const container = document.getElementById('canvas');
    if (!container) return;

    const links = document.querySelectorAll('a[data-type]');
    links.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const type = link.getAttribute('data-type');
            if (type) loadAndRender(type);
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCanvas);
} else {
    initCanvas();
}

export { renderCanvas, loadAndRender, initCanvas };
