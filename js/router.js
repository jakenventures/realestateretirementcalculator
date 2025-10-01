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
            },

            // Additional SEO Pages - Cities and Markets
            '/city/atlanta': {
                path: '/city/atlanta',
                title: 'Atlanta Real Estate Retirement Calculator - Southern Rental Markets',
                h1: 'Atlanta Real Estate Retirement',
                subtitle: 'Calculate retirement opportunities in Atlanta\'s highest-growth rental property market.',
                description: 'Atlanta real estate retirement calculator...'
            },

            '/city/denver': {
                path: '/city/denver',
                title: 'Denver Real Estate Retirement Calculator - Mile High City Investments',
                h1: 'Denver Real Estate Retirement',
                subtitle: 'Calculate investment potential in Denver\'s booming rental and commercial markets.',
                description: 'Denver real estate retirement...'
            },

            '/city/seattle': {
                path: '/city/seattle',
                title: 'Seattle Real Estate Retirement Calculator - Pacific Northwest Markets',
                h1: 'Seattle Real Estate Retirement',
                subtitle: 'Calculate retirement income potential in Seattle and Puget Sound real estate.',
                description: 'Seattle real estate retirement...'
            },

            '/city/denver': {
                path: '/city/denver',
                title: 'Denver Real Estate Retirement Calculator - Mile High Investments',
                h1: 'Denver Real Estate Retirement',
                subtitle: 'Calculate retirement potential in Denver\'s growing mountain west market.',
                description: 'Denver real estate retirement calculator...'
            },

            '/city/charlotte': {
                path: '/city/charlotte',
                title: 'Charlotte Real Estate Retirement Calculator - Queen City Investments',
                h1: 'Charlotte Real Estate Retirement',
                subtitle: 'Calculate NC real estate retirement in Charlotte\'s corporate and job growth corridor.',
                description: 'Charlotte real estate retirement...'
            },

            '/city/nashville': {
                path: '/city/nashville',
                title: 'Nashville Real Estate Retirement Calculator - Music City Rentals',
                h1: 'Nashville Real Estate Retirement',
                subtitle: 'Discover retirement income potential in Nashville\'s booming music and healthcare industries.',
                description: 'Nashville real estate retirement...'
            },

            '/city/tampa': {
                path: '/city/tampa',
                title: 'Tampa Real Estate Retirement Calculator - Florida Gulf Coast',
                h1: 'Tampa Real Estate Retirement',
                subtitle: 'Calculate Tampa Bay real estate retirement potential and affordable Florida markets.',
                description: 'Tampa real estate retirement calculator...'
            },

            '/city/raleigh': {
                path: '/city/raleigh',
                title: 'Raleigh Real Estate Retirement Calculator - Research Triangle',
                h1: 'Raleigh Real Estate Retirement',
                subtitle: 'Calculate retirement income from Research Triangle\'s tech and university growth.',
                description: 'Raleigh real estate retirement...'
            },

            '/city/pittsburgh': {
                path: '/city/pittsburgh',
                title: 'Pittsburgh Real Estate Retirement Calculator - Rust Belt Renaissance',
                h1: 'Pittsburgh Real Estate Retirement',
                subtitle: 'Discover affordable retirement real estate in Pittsburgh\'s revitalized rental markets.',
                description: 'Pittsburgh real estate retirement...'
            },

            '/city/boise': {
                path: '/city/boise',
                title: 'Boise Real Estate Retirement Calculator - Idaho Growth Markets',
                h1: 'Boise Real Estate Retirement',
                subtitle: 'Calculate retirement potential in Boise\'s affordable mountain west real estate.',
                description: 'Boise real estate retirement calculator...'
            },

            // New Strategy Pages
            '/fix-and-flip-vs-rental': {
                path: '/fix-and-flip-vs-rental',
                title: 'Fix and Flip vs Long-Term Rental Retirement Calculator',
                h1: 'Fix and Flip vs Long-Term Rentals',
                subtitle: 'Compare fix-and-flip profits vs rental property retirement income - which strategy wins?',
                description: 'Fix and flip vs rental retirement comparison...'
            },

            '/portfolio-loans': {
                path: '/portfolio-loans',
                title: 'Portfolio Loans Retirement Calculator - Private Lending Options',
                h1: 'Portfolio Loans for Retirement',
                subtitle: 'Calculate retirement acceleration using portfolio lenders and private money financing.',
                description: 'Portfolio loans retirement calculator...'
            },

            '/hard-money-lending': {
                path: '/hard-money-lending',
                title: 'Hard Money Retirement Calculator - Speedy Investment Financing',
                h1: 'Hard Money for Retirement',
                subtitle: 'Calculate deal speed and profits using hard money lenders for rapid property acquisitions.',
                description: 'Hard money retirement financing...'
            },

            '/seller-financing': {
                path: '/seller-financing',
                title: 'Seller Financing Retirement Calculator - No Bank Loan Needed',
                h1: 'Seller Financing Retirement',
                subtitle: 'Calculate retirement potential using owner financing and seller carry-back terms.',
                description: 'Seller financing retirement calculator...'
            },

            '/partnership-investing': {
                path: '/partnership-investing',
                title: 'Real Estate Partnerships Retirement Calculator - Joint Venture Investing',
                h1: 'Partnership Investing for Retirement',
                subtitle: 'Calculate leveraged returns using real estate joint ventures and partnership investing.',
                description: 'Partnership investing retirement...'
            },

            '/wholesale-real-estate': {
                path: '/wholesale-real-estate',
                title: 'Wholesale Real Estate Retirement Calculator - Virtual Real Estate',
                h1: 'Wholesale Real Estate Retirement',
                subtitle: 'Calculate assignment fee profits and wholesale real estate retirement income.',
                description: 'Wholesale real estate retirement...'
            },

            '/turnkey-rentals': {
                path: '/turnkey-rentals',
                title: 'Turnkey Rentals Retirement Calculator - Managed Investment Properties',
                h1: 'Turnkey Rentals Retirement',
                subtitle: 'Calculate hands-off retirement income from professionally managed rental properties.',
                description: 'Turnkey rentals retirement calculator...'
            },

            '/real-estate-tax-lien': {
                path: '/real-estate-tax-lien',
                title: 'Tax Lien Retirement Calculator - Certificate Investing',
                h1: 'Tax Lien Certificate Retirement',
                subtitle: 'Calculate passive returns from tax lien certificates and county tax sales.',
                description: 'Tax lien retirement investing...'
            },

            // State-Level Pages
            '/state/arizona': {
                path: '/state/arizona',
                title: 'Arizona Real Estate Retirement Calculator - Grand Canyon State',
                h1: 'Arizona Real Estate Retirement',
                subtitle: 'Calculate retirement potential across Arizona markets with Phoenix and Tucson focus.',
                description: 'Arizona real estate retirement calculator...'
            },

            '/state/north-carolina': {
                path: '/state/north-carolina',
                title: 'North Carolina Real Estate Retirement Calculator - Tar Heel State',
                h1: 'North Carolina Real Estate Retirement',
                subtitle: 'Discover Charlotte, Raleigh, and NC mountain rental investment opportunities.',
                description: 'North Carolina real estate retirement...'
            },

            '/state/washington': {
                path: '/state/washington',
                title: 'Washington State Real Estate Retirement Calculator - Evergreen State',
                h1: 'Washington Real Estate Retirement',
                subtitle: 'Calculate Seattle area retirement potential and Pacific Northwest markets.',
                description: 'Washington state real estate retirement...'
            },

            '/state/colorado': {
                path: '/state/colorado',
                title: 'Colorado Real Estate Retirement Calculator - Centennial State',
                h1: 'Colorado Real Estate Retirement',
                subtitle: 'Plan retirement in Denver, Boulder, and Colorado mountain rental markets.',
                description: 'Colorado real estate retirement calculator...'
            },

            '/state/tennessee': {
                path: '/state/tennessee',
                title: 'Tennessee Real Estate Retirement Calculator - Volunteer State',
                h1: 'Tennessee Real Estate Retirement',
                subtitle: 'Calculate Nashville, Knoxville, and Chattanooga real estate retirement income.',
                description: 'Tennessee real estate retirement...'
            },

            // Educational Content Pages
            '/real-estate-passive-income': {
                path: '/real-estate-passive-income',
                title: 'Real Estate Passive Income Retirement - Build Wealth While You Sleep',
                h1: 'Real Estate Passive Income',
                subtitle: 'Learn how rental properties create true passive income for retirement and financial freedom.',
                description: 'Real estate passive income for retirement...'
            },

            '/1031-exchange-retirement': {
                path: '/1031-exchange-retirement',
                title: '1031 Exchange Retirement Calculator - Tax-Deferred Real Estate Growth',
                h1: '1031 Exchange for Retirement',
                subtitle: 'Calculate tax-deferred growth using 1031 exchanges to accelerate retirement wealth.',
                description: '1031 exchange retirement planning...'
            },

            '/real-estate-depreciation': {
                path: '/real-estate-depreciation',
                title: 'Real Estate Depreciation Retirement Calculator - Tax Shield Benefits',
                h1: 'Real Estate Depreciation Retirement',
                subtitle: 'Calculate retirement tax benefits from rental property depreciation deductions.',
                description: 'Real estate depreciation retirement...'
            },

            '/vacation-rental-tax': {
                path: '/vacation-rental-tax',
                title: 'Vacation Rental Tax Retirement Calculator - STR Tax Optimization',
                h1: 'Vacation Rental Tax Strategies',
                subtitle: 'Calculate tax-advantaged retirement income from short-term rental investments.',
                description: 'Vacation rental tax retirement...'
            },

            '/real-estate-crowdfunding': {
                path: '/real-estate-crowdfunding',
                title: 'Real Estate Crowdfunding Retirement Calculator - Small Investor Platforms',
                h1: 'Real Estate Crowdfunding Retirement',
                subtitle: 'Calculate passive returns from real estate crowdfunding platforms for retirement.',
                description: 'Real estate crowdfunding retirement...'
            },

            '/bridge-loans': {
                path: '/bridge-loans',
                title: 'Bridge Loan Retirement Calculator - Interim Financing Solutions',
                h1: 'Bridge Loans for Retirement',
                subtitle: 'Calculate quick financing solutions for real estate retirement deal flow.',
                description: 'Bridge loans retirement calculator...'
            },

            '/private-lenders': {
                path: '/private-lenders',
                title: 'Private Lenders Retirement Calculator - Alternative Investment Financing',
                h1: 'Private Lenders for Retirement',
                subtitle: 'Discover private money lenders for faster real estate retirement wealth building.',
                description: 'Private lenders retirement financing...'
            },

            '/lease-options': {
                path: '/lease-options',
                title: 'Lease Options Retirement Calculator - Virtually Rent-Free Living',
                h1: 'Lease Options Retirement',
                subtitle: 'Calculate creative housing solutions for accelerated retirement portfolio growth.',
                description: 'Lease options retirement strategy...'
            },

            '/real-estate-notes': {
                path: '/real-estate-notes',
                title: 'Real Estate Notes Retirement Calculator - Promissory Note Investing',
                h1: 'Real Estate Notes Retirement',
                subtitle: 'Calculate passive income from buying performing real estate note portfolios.',
                description: 'Real estate notes retirement investing...'
            },

            '/mei-profits': {
                path: '/mei-profits',
                title: 'MEI Profits Retirement Calculator - Materially Enhanced Income',
                h1: 'MEI Profits for Retirement',
                subtitle: 'Calculate syndication profits and preferred returns for retirement income.',
                description: 'MEI profits retirement calculator...'
            },

            '/reits-vs-rentals': {
                path: '/reits-vs-rentals',
                title: 'REITs vs Direct Rentals Retirement Calculator - Investment Choice',
                h1: 'REITs vs Direct Rentals for Retirement',
                subtitle: 'Compare real estate investment trusts vs direct ownership for retirement planning.',
                description: 'REITs vs rentals retirement comparison...'
            },

            // Market Timing and Exit Strategies
            '/real-estate-market-timing': {
                path: '/real-estate-market-timing',
                title: 'Real Estate Market Timing Retirement Calculator - Buy Low, Sell High',
                h1: 'Real Estate Market Timing',
                subtitle: 'Calculate optimal market entry and exit timing for retirement wealth maximization.',
                description: 'Real estate market timing retirement...'
            },

            '/retirement-real-estate-mobile-home-parks': {
                path: '/retirement-real-estate-mobile-home-parks',
                title: 'Mobile Home Park Retirement Calculator - Manufactured Housing Communities',
                h1: 'Mobile Home Parks Retirement',
                subtitle: 'Calculate recession-resistant retirement income from mobile home park investments.',
                description: 'Mobile home parks retirement calculator...'
            },

            '/self-storage-facilities': {
                path: '/self-storage-facilities',
                title: 'Self Storage Facilities Retirement Calculator - Passive Facility Management',
                h1: 'Self Storage Retirement',
                subtitle: 'Calculate hands-off retirement income from climate-controlled storage facilities.',
                description: 'Self storage retirement facilities...'
            },


            '/billboards-real-estate': {
                path: '/billboards-real-estate',
                title: 'Billboard Real Estate Retirement Calculator - Outdoor Advertising ROI',
                h1: 'Billboard Real Estate Retirement',
                subtitle: 'Calculate passive advertising income from billboard sign lease portfolios.',
                description: 'Billboard real estate retirement...'
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
