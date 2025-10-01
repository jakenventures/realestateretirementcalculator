// Client-side Router Module
// Handles navigation and content updates for different education/strategy pages

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = '/';
        this.pageContainer = document.getElementById('app');
        this.init();
    }

    // Initialize router
    init() {
        // Load route definitions
        this.routes = this.getRoutes();

        // Handle initial load
        this.handleRoute(window.location.pathname);

        // Listen for navigation
        this.setupEventListeners();

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            this.handleRoute(window.location.pathname);
        });
    }

    // Set up event listeners for navigation
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && this.isInternalLink(link.href)) {
                e.preventDefault();
                const path = this.getPathFromUrl(link.href);
                this.navigate(path);
            }
        });
    }

    // Check if link is internal (same origin)
    isInternalLink(href) {
        try {
            const url = new URL(href, window.location.origin);
            return url.origin === window.location.origin;
        } catch {
            return false;
        }
    }

    // Extract path from URL
    getPathFromUrl(url) {
        try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.pathname === '/' ? '/' : urlObj.pathname.replace(/\/$/, '');
        } catch {
            return '/';
        }
    }

    // Navigate to a route
    navigate(path) {
        if (path !== this.currentRoute) {
            window.history.pushState(null, '', path);
            this.handleRoute(path);
        }
    }

    // Handle route changes
    handleRoute(path) {
        this.currentRoute = path === '/' ? '/' : path.replace(/\/$/, '');

        // Find matching route
        const route = this.findRoute(this.currentRoute);

        if (route) {
            this.renderPage(route);
            // Trigger SEO update
            if (typeof updateRouteSEO === 'function') {
                updateRouteSEO(this.currentRoute);
            }
        } else {
            this.handle404();
        }
    }

    // Find matching route (with parameter support)
    findRoute(path) {
        // Exact match first
        if (this.routes[path]) {
            return this.routes[path];
        }

        // Dynamic routes with parameters
        for (const routePath in this.routes) {
            const routePattern = this.pathToRegex(routePath);
            const match = path.match(routePattern);

            if (match && routePattern.test(path)) {
                const route = { ...this.routes[routePath] };
                route.params = this.extractParams(routePath, path);
                return route;
            }
        }

        return null;
    }

    // Convert path with parameters to regex
    pathToRegex(path) {
        return new RegExp('^' + path.replace(/:\w+/g, '([^/]+)') + '$');
    }

    // Extract parameters from path
    extractParams(routePath, actualPath) {
        const params = {};
        const routeParts = routePath.split('/');
        const pathParts = actualPath.split('/');

        routeParts.forEach((part, index) => {
            if (part.startsWith(':')) {
                const paramName = part.slice(1);
                params[paramName] = decodeURIComponent(pathParts[index] || '');
            }
        });

        return params;
    }

    // Render page content
    renderPage(route) {
        this.pageContainer.setAttribute('data-route', this.currentRoute);

        // Update main content area (preserve nav and footer)
        const pageContent = document.querySelector('.calculator-section');
        const hero = document.querySelector('.hero');

        // Update hero section with route-specific content
        this.updateHeroSection(route);

        // Scroll to top
        window.scrollTo(0, 0);
    }

    // Update hero section based on route
    updateHeroSection(route) {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        const h1 = hero.querySelector('h1');
        const subtitle = hero.querySelector('.subtitle');

        if (h1) h1.textContent = route.h1 || route.title;
        if (subtitle) subtitle.textContent = route.subtitle || route.description;

        // Update page-specific CTAs if they exist in route data
        if (route.primaryCTA) {
            const ctaButton = hero.querySelector('.btn');
            if (ctaButton) {
                ctaButton.href = route.primaryCTA.url;
                ctaButton.textContent = route.primaryCTA.text;
            }
        }
    }

    // Handle 404 - redirect to home or show 404 page
    handle404() {
        window.location.href = '/404.html';
    }

    // Get route definitions
    getRoutes() {
        return {
            '/': {
                path: '/',
                title: 'Real Estate Retirement Calculator | Plan Your Rental Property Retirement',
                h1: 'Will Real Estate Retire You On Time?',
                subtitle: 'Calculate your retirement timeline through rental property investments with our free DSCR mortgage calculator.',
                description: 'Calculate your real estate retirement timeline with our DSCR mortgage calculator...',
                primaryCTA: {
                    text: 'Get Personalized Loan Terms',
                    url: 'https://www.jakenfinancegroup.com'
                }
            },

            '/retirement-calculator': {
                path: '/retirement-calculator',
                title: 'Real Estate Retirement Calculator - Plan Your Financial Independence',
                h1: 'Real Estate Retirement Calculator',
                subtitle: 'Use our comprehensive calculator to model rental property investments, DSCR loans, and cash flow growth.',
                description: 'Calculate your retirement timeline through rental properties...'
            },

            '/real-estate-retirement': {
                path: '/real-estate-retirement',
                title: 'Real Estate Retirement Planning - Achieve Financial Independence',
                h1: 'Real Estate Retirement Planning',
                subtitle: 'Discover how rental property investments can create lasting retirement income and wealth.',
                description: 'Plan your retirement through rental property investments...'
            }
        };
    }

    // Programmatic navigation (for internal use)
    goToRoute(route) {
        this.navigate(route);
    }

    // Get current route
    getCurrentRoute() {
        return this.currentRoute;
    }
}

// Initialize router
const router = new Router();

// Export functions
export function initRouter() {
    // Router is initialized in constructor
}

export function navigateTo(path) {
    router.navigate(path);
}

// Make router globally available
window.Router = Router;
window.router = router;
