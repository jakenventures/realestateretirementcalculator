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
                    url: 'https://www.getloanterms.com'
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
            },

            '/dscr-retirement-calculator': {
                path: '/dscr-retirement-calculator',
                title: 'DSCR Retirement Calculator - Debt Service Coverage Ratio Analysis',
                h1: 'DSCR Retirement Calculator',
                subtitle: 'Calculate retirement timing using debt service coverage ratios and rental property cash flow.',
                description: 'DSCR mortgage calculator for retirement planning...'
            },

            '/real-estate-financial-independence': {
                path: '/real-estate-financial-independence',
                title: 'Real Estate Financial Independence - FIRE Through Rentals',
                h1: 'Real Estate Financial Independence',
                subtitle: 'Achieve financial independence faster through leveraged rental property investments.',
                description: 'FIRE through rental properties...'
            },

            '/rental-property-retirement-calculator': {
                path: '/rental-property-retirement-calculator',
                title: 'Rental Property Retirement Calculator - Cash Flow Planning',
                h1: 'Rental Property Retirement Calculator',
                subtitle: 'Plan your retirement income from rental properties with accurate cash flow projections.',
                description: 'Rental property retirement calculator...'
            },

            '/brrrr-retirement-calculator': {
                path: '/brrrr-retirement-calculator',
                title: 'BRRRR Retirement Calculator - Buy Rehab Rent Refinance Strategy',
                h1: 'BRRRR Retirement Calculator',
                subtitle: 'Calculate BRRRR strategy returns for accelerated wealth building and retirement.',
                description: 'BRRRR retirement strategy calculator...'
            },

            '/house-hacking-retirement-calculator': {
                path: '/house-hacking-retirement-calculator',
                title: 'House Hacking Retirement Calculator - Live Rent Free',
                h1: 'House Hacking Retirement Calculator',
                subtitle: 'See how house hacking can eliminate housing costs and accelerate your retirement timeline.',
                description: 'House hacking retirement calculator...'
            },

            '/cash-flow-retirement-calculator': {
                path: '/cash-flow-retirement-calculator',
                title: 'Cash Flow Retirement Calculator - Passive Income Planning',
                h1: 'Cash Flow Retirement Calculator',
                subtitle: 'Calculate retirement income from rental property cash flow and passive income streams.',
                description: 'Cash flow retirement planning...'
            },

            // Strategy routes
            '/retirement-calculator/dscr-loans': {
                path: '/retirement-calculator/dscr-loans',
                title: 'DSCR Loan Retirement Calculator - Investment Property Financing',
                h1: 'DSCR Loans for Retirement',
                subtitle: 'Calculate retirement acceleration using DSCR mortgage financing for investment properties.',
                description: 'DSCR loan retirement strategy...'
            },

            '/house-hacking': {
                path: '/house-hacking',
                title: 'House Hacking Retirement Strategy - Live for Free',
                h1: 'House Hacking for Retirement',
                subtitle: 'Master house hacking to live rent-free while building rental wealth and retirement income.',
                description: 'House hacking retirement strategy...'
            },

            '/short-term-rentals': {
                path: '/short-term-rentals',
                title: 'Short-Term Rental Retirement Calculator - Airbnb & Vacation Rentals',
                h1: 'Short-Term Rental Retirement',
                subtitle: 'Calculate retirement potential from short-term rental income and platform economy opportunities.',
                description: 'Short-term rental retirement...'
            },

            '/long-term-rentals': {
                path: '/long-term-rentals',
                title: 'Long-Term Rental Retirement Calculator - Traditional Buy & Hold',
                h1: 'Long-Term Rental Retirement',
                subtitle: 'Calculate retirement income from traditional buy-and-hold rental property investments.',
                description: 'Long-term rental retirement...'
            },

            '/brrrr': {
                path: '/brrrr',
                title: 'BRRRR Strategy Retirement - Buy Rehab Rent Refinance Repeat',
                h1: 'BRRRR Strategy for Retirement',
                subtitle: 'Accelerate retirement through buy-rehab-rent-refinance strategies and cash-out financing.',
                description: 'BRRRR retirement strategy...'
            },

            '/duplex': {
                path: '/duplex',
                title: 'Duplex Retirement Calculator - Two-Unit Rental Properties',
                h1: 'Duplex Retirement Calculator',
                subtitle: 'Calculate retirement acceleration using duplex properties and efficient multi-unit investments.',
                description: 'Duplex retirement calculator...'
            },

            '/fourplex': {
                path: '/fourplex',
                title: 'Fourplex Retirement Calculator - Four-Unit Properties',
                h1: 'Fourplex Retirement Calculator',
                subtitle: 'Calculate retirement potential from fourplex properties and small multi-unit buildings.',
                description: 'Fourplex retirement calculator...'
            },

            '/syndication': {
                path: '/syndication',
                title: 'Real Estate Syndication Retirement Calculator - Passive Investor Returns',
                h1: 'Real Estate Syndication Retirement',
                subtitle: 'Calculate retirement income as a passive investor in real estate syndication deals.',
                description: 'Syndication retirement calculator...'
            },

            // Location routes - States
            '/state/illinois': {
                path: '/state/illinois',
                title: 'Illinois Real Estate Retirement Calculator - Chicago & Suburbs',
                h1: 'Illinois Real Estate Retirement',
                subtitle: 'Calculate retirement timing with Illinois rental properties including Chicago and suburban markets.',
                description: 'Illinois real estate retirement...'
            },

            '/state/florida': {
                path: '/state/florida',
                title: 'Florida Real Estate Retirement Calculator - Miami, Orlando & Tampa',
                h1: 'Florida Real Estate Retirement',
                subtitle: 'Calculate retirement potential in Florida hot markets including Miami, Orlando, and Tampa.',
                description: 'Florida real estate retirement...'
            },

            '/state/texas': {
                path: '/state/texas',
                title: 'Texas Real Estate Retirement Calculator - Austin, Dallas & Houston',
                h1: 'Texas Real Estate Retirement',
                subtitle: 'Calculate retirement timing in Texas major markets including Austin, Dallas, and Houston.',
                description: 'Texas real estate retirement...'
            },

            // City routes
            '/city/chicago': {
                path: '/city/chicago',
                title: 'Chicago Real Estate Retirement Calculator - Windy City Rentals',
                h1: 'Chicago Real Estate Retirement',
                subtitle: 'Calculate retirement potential in Chicago with accurate property values and rental rates.',
                description: 'Chicago real estate retirement...'
            },

            '/city/orlando': {
                path: '/city/orlando',
                title: 'Orlando Real Estate Retirement Calculator - Theme Park City Rentals',
                h1: 'Orlando Real Estate Retirement',
                subtitle: 'Calculate Orlando vacation rental retirement potential near world-famous theme parks.',
                description: 'Orlando real estate retirement...'
            },

            '/city/miami': {
                path: '/city/miami',
                title: 'Miami Real Estate Retirement Calculator - South Beach & Downtown',
                h1: 'Miami Real Estate Retirement',
                subtitle: 'Calculate retirement potential in Miami Beach and downtown Miami rental markets.',
                description: 'Miami real estate retirement...'
            },

            '/city/austin': {
                path: '/city/austin',
                title: 'Austin Real Estate Retirement Calculator - Live Music Capital',
                h1: 'Austin Real Estate Retirement',
                subtitle: 'Calculate retirement opportunities in Austin\'s booming rental property market.',
                description: 'Austin real estate retirement...'
            },

            '/city/phoenix': {
                path: '/city/phoenix',
                title: 'Phoenix Real Estate Retirement Calculator - Valley of the Sun',
                h1: 'Phoenix Real Estate Retirement',
                subtitle: 'Calculate retirement potential in Phoenix and the greater Arizona Valley market.',
                description: 'Phoenix real estate retirement...'
            },

            // Intent routes
            '/beginner': {
                path: '/beginner',
                title: 'Beginner Real Estate Retirement Guide - Start Your Investment Journey',
                h1: 'Beginner Real Estate Retirement',
                subtitle: 'Learn the fundamentals of real estate retirement planning for complete beginners.',
                description: 'Beginner real estate retirement guide...'
            },

            '/advanced': {
                path: '/advanced',
                title: 'Advanced Real Estate Retirement Strategies - Portfolio Optimization',
                h1: 'Advanced Real Estate Retirement',
                subtitle: 'Advanced techniques for optimizing rental portfolios and maximizing retirement cash flow.',
                description: 'Advanced real estate retirement...'
            },

            '/no-money-down': {
                path: '/no-money-down',
                title: 'No Money Down Real Estate Retirement - Creative Financing Strategies',
                h1: 'No Money Down Real Estate Retirement',
                subtitle: 'Build retirement wealth without large down payments using creative financing strategies.',
                description: 'No money down retirement...'
            },

            '/low-down-payment': {
                path: '/low-down-payment',
                title: 'Low Down Payment Real Estate Retirement - Minimize Initial Capital',
                h1: 'Low Down Payment Retirement',
                subtitle: 'Calculate retirement timelines using low-down-payment financing and FHA loan options.',
                description: 'Low down payment retirement...'
            },

            '/high-dscr': {
                path: '/high-dscr',
                title: 'High DSCR Retirement Calculator - Cash Flow Rich Properties',
                h1: 'High DSCR Retirement Calculator',
                subtitle: 'Focus on cash-flow-rich properties with high debt service coverage ratios.',
                description: 'High DSCR retirement...'
            },

            '/refi-cashout': {
                path: '/refi-cashout',
                title: 'Cash-Out Refinance Retirement Calculator - Leverage Property Equity',
                h1: 'Cash-Out Refinance Retirement',
                subtitle: 'Calculate retirement acceleration using cash-out refinances to purchase more properties.',
                description: 'Cash-out refinance retirement...'
            },

            '/seasoning-rules': {
                path: '/seasoning-rules',
                title: 'Seasoning Rules Retirement Calculator - Refinance Timing Strategy',
                h1: 'Seasoning Rules Retirement Calculator',
                subtitle: 'Calculate optimal refinance timing using property seasoning requirements and strategies.',
                description: 'Seasoning rules retirement...'
            },

            // Loan-type routes
            '/dscr-30-year-fixed': {
                path: '/dscr-30-year-fixed',
                title: '30-Year Fixed DSCR Loan Retirement Calculator - Long-Term Financing',
                h1: '30-Year Fixed DSCR Retirement',
                subtitle: 'Calculate retirement using 30-year fixed DSCR mortgage financing for stability.',
                description: '30-year fixed DSCR retirement...'
            },

            '/interest-only-scenarios': {
                path: '/interest-only-scenarios',
                title: 'Interest-Only Loan Retirement Calculator - Cash Flow Optimization',
                h1: 'Interest-Only Loan Retirement',
                subtitle: 'Calculate retirement potential using interest-only periods and cash flow management.',
                description: 'Interest-only retirement...'
            },

            '/adjustable-rate-scenarios': {
                path: '/adjustable-rate-scenarios',
                title: 'Adjustable Rate Retirement Calculator - ARM Loan Strategies',
                h1: 'Adjustable Rate Retirement Calculator',
                subtitle: 'Calculate retirement timelines considering adjustable rate mortgages and rate changes.',
                description: 'Adjustable rate retirement...'
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
