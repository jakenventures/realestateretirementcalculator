// Main Application Entry Point
// Initializes all modules and wires up the Real Estate Retirement Calculator

import { initRouter } from './router.js';
import { initSEO } from './seo.js';
import { initCharts } from './charts.js';
import { initPages } from './pages.js';

class App {
    constructor() {
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        console.log('🚀 Initializing Real Estate Retirement Calculator...');

        try {
            // Initialize SEO first (updates meta tags)
            initSEO();
            console.log('✓ SEO initialized');

            // Initialize router (handles navigation)
            initRouter();
            console.log('✓ Router initialized');

            // Initialize charts (prepares canvas elements)
            initCharts();
            console.log('✓ Charts initialized');

            // Initialize pages (loads page content)
            initPages();
            console.log('✓ Pages initialized');

            // Setup global event listeners
            this.setupEventListeners();
            console.log('✓ Event listeners setup');

            this.initialized = true;
            console.log('✅ Application fully initialized');

        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            this.showErrorState();
        }
    }

    setupEventListeners() {
        // Handle LTV slider updates
        const ltvSlider = document.getElementById('ltv-ratio');
        const ltvDisplay = document.getElementById('ltv-display');
        
        if (ltvSlider && ltvDisplay) {
            ltvSlider.addEventListener('input', () => {
                ltvDisplay.textContent = ltvSlider.value + '%';
            });
        }

        // Handle form validation
        const calculatorForm = document.getElementById('calculator-form');
        if (calculatorForm) {
            calculatorForm.addEventListener('submit', (e) => {
                e.preventDefault();
                // The calculateRetirement function is already globally available from calculator.js
                if (typeof window.calculateRetirement === 'function') {
                    window.calculateRetirement();
                }
            });
        }

        // Handle window resize for charts (debounced)
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (typeof window.updateCharts === 'function') {
                    // Re-render charts on resize if data exists
                    const chartsContainer = document.getElementById('results-container');
                    if (chartsContainer && chartsContainer.style.display !== 'none') {
                        // Charts will auto-adjust via their internal logic
                        console.log('Window resized, charts will adjust');
                    }
                }
            }, 250);
        });
    }

    showErrorState() {
        const appContainer = document.getElementById('app') || document.querySelector('main');
        if (appContainer) {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'padding: 2rem; background: #fee; border: 2px solid #c00; border-radius: 8px; margin: 2rem auto; max-width: 600px; text-align: center;';
            errorDiv.innerHTML = `
                <h2 style="color: #c00; margin-bottom: 1rem;">⚠️ Application Error</h2>
                <p>There was an error loading the calculator. Please refresh the page.</p>
                <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #c00; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Reload Page
                </button>
            `;
            appContainer.prepend(errorDiv);
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new App();
        app.init();
    });
} else {
    const app = new App();
    app.init();
}

// Export for debugging
export default App;
