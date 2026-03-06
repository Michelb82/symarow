import { BlockSystem } from './block-system.js';

let cachedModel = null;

const DEFAULT_FILTER = 'products-valuestreams-capabilities';

/**
 * Renders the diagram from the unified model (products, value streams, capabilities).
 * @param {Object} model - { nodes: [...] } from GET /model
 * @param {string} filter - 'products-valuestreams-capabilities' (default) or 'all' | single type
 */
function renderCanvas(model, filter = DEFAULT_FILTER) {
    const container = document.getElementById('canvas');
    if (!container) return;

    container.innerHTML = '';

    const width = Math.max(container.offsetWidth || 800, 400);
    const height = Math.max(container.offsetHeight || 600, 400);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'block-diagram');
    container.appendChild(svg);

    const blockSystem = new BlockSystem(svg, model, 'model', filter);
    blockSystem.init();
}

/**
 * Loads the single compiled model from the server and renders (products, value streams, capabilities).
 */
function loadModelAndRender(filter = DEFAULT_FILTER) {
    if (cachedModel) {
        renderCanvas(cachedModel, filter);
        return;
    }
    fetch('/model', { method: 'GET', headers: { Accept: 'application/json' } })
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then((model) => {
            cachedModel = model && model.nodes ? model : { nodes: Array.isArray(model) ? model : [] };
            renderCanvas(cachedModel, filter);
        })
        .catch((err) => console.error('Error loading model:', err));
}

/**
 * Sets up the canvas and fetches the model on load.
 */
function initCanvas() {
    const container = document.getElementById('canvas');
    if (!container) return;
    loadModelAndRender();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCanvas);
} else {
    initCanvas();
}

export { renderCanvas, loadModelAndRender, initCanvas };
