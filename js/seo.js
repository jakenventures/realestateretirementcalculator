// SEO Management Module
// Handles dynamic meta tags, Open Graph, JSON-LD, and page title updates

class SEOManager {
    constructor() {
        // Get base URL from environment variable or default
        this.baseUrl = this.getBaseUrl();

        // Initialize route-based SEO data
        this.routeSEO = this.getRouteSEO();
        this.currentRoute = this.getCurrentRoute();
    }

    getBaseUrl() {
        // Production domain
        return 'https://realestateretirementcalculator.com';
    }

    getCurrentRoute() {
        // Remove leading slash and query params/hash
        const path = window.location.pathname.replace(/^\//, '').split(/[?#]/)[0];
        return path || '/';
    }

    updateSEO(route = null) {
        const currentRoute = route || this.getCurrentRoute();
        const seoData = this.routeSEO[currentRoute] || this.routeSEO['/'];

        // Update document title
        document.title = seoData.title;

        // Update meta tags
        this.updateMetaTag('description', seoData.description);
        this.updateMetaTag('keywords', seoData.keywords ||
            'real estate retirement calculator, DSCR calculator, rental property retirement, real estate financial independence');

        // Update canonical URL
        this.updateLinkTag('canonical', this.baseUrl + (currentRoute === '/' ? '' : '/' + currentRoute));

        // Update Open Graph tags
        this.updateMetaTag('og:type', seoData.ogType || 'website');
        this.updateMetaTag('og:url', this.baseUrl + (currentRoute === '/' ? '' : '/' + currentRoute));
        this.updateMetaTag('og:title', seoData.ogTitle || seoData.title);
        this.updateMetaTag('og:description', seoData.ogDescription || seoData.description);
        this.updateMetaTag('og:image', this.baseUrl + seoData.ogImage);

        // Update Twitter Card tags
        this.updateMetaTag('twitter:card', seoData.twitterCard || 'summary_large_image');
        this.updateMetaTag('twitter:title', seoData.twitterTitle || seoData.ogTitle || seoData.title);
        this.updateMetaTag('twitter:description', seoData.twitterDescription || seoData.ogDescription || seoData.description);
        this.updateMetaTag('twitter:image', this.baseUrl + seoData.twitterImage || seoData.ogImage);

        // Update JSON-LD structured data
        this.updateJSONLD(seoData, currentRoute);

        // Update favicon/apple touch icon if route-specific
        if (seoData.favicon) {
            this.updateLinkTag('icon', this.baseUrl + seoData.favicon);
        }
        if (seoData.appleTouchIcon) {
            this.updateLinkTag('apple-touch-icon', this.baseUrl + seoData.appleTouchIcon);
        }

        // Track page view (if analytics is enabled)
        this.trackPageView(currentRoute, seoData);
    }

    updateMetaTag(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`) ||
                   document.querySelector(`meta[property="${name}"]`);

        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(name.includes('og:') || name.includes('twitter:') ? 'property' : 'name', name);
            document.getElementsByTagName('head')[0].appendChild(meta);
        }

        meta.setAttribute('content', content);
    }

    updateLinkTag(rel, href) {
        let link = document.querySelector(`link[rel="${rel}"]`);

        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', rel);
            document.getElementsByTagName('head')[0].appendChild(link);
        }

        link.setAttribute('href', href);
    }

    updateJSONLD(seoData, currentRoute) {
        // Remove existing JSON-LD
        const existing = document.querySelector('script[type="application/ld+json"]');
        if (existing) {
            existing.remove();
        }

        // Create new JSON-LD
        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'Article',
            'headline': seoData.title,
            'description': seoData.description,
            'url': this.baseUrl + (currentRoute === '/' ? '' : '/' + currentRoute),
            'image': this.baseUrl + seoData.ogImage,
            'datePublished': '2023-01-01',
            'dateModified': new Date().toISOString().split('T')[0],
            'author': {
                '@type': 'Organization',
                'name': 'Jaken Finance Group',
                'url': 'https://www.jakenfinancegroup.com'
            },
            'publisher': {
                '@type': 'Organization',
                'name': 'Jaken Finance Group',
                'logo': {
                    '@type': 'ImageObject',
                    'url': this.baseUrl + '/public/icons/apple-touch-icon.png'
                }
            }
        };

        // Add FAQPage if FAQs exist
        if (seoData.faq && seoData.faq.length > 0) {
            jsonLd['@type'] = ['Article', 'FAQPage'];
            jsonLd.mainEntity = seoData.faq.map(faq => ({
                '@type': 'Question',
                'name': faq.q,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': faq.a
                }
            }));
        }

        // Add BreadcrumbList
        jsonLd.breadcrumb = {
            '@type': 'BreadcrumbList',
            'itemListElement': this.generateBreadcrumbs(currentRoute)
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(jsonLd, null, 2);
        document.head.appendChild(script);
    }

    generateBreadcrumbs(route) {
        const breadcrumbs = [
            {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': this.baseUrl
            }
        ];

        if (route === '/') return breadcrumbs;

        const segments = route.split('/').filter(s => s);
        let currentPath = '';

        segments.forEach((segment, index) => {
            currentPath += '/' + segment;
            const segmentName = this.formatSegmentName(segment);
            const position = index + 2;

            breadcrumbs.push({
                '@type': 'ListItem',
                'position': position,
                'name': segmentName,
                'item': this.baseUrl + currentPath
            });
        });

        return breadcrumbs;
    }

    formatSegmentName(segment) {
        // Convert URL segments to readable names
        return segment.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            .replace(/State\s/, '') // Remove "State" prefix
            .replace(/City\s/, '');  // Remove "City" prefix
    }

    trackPageView(route, seoData) {
        // Placeholder for analytics integration
        // This could be Google Analytics, Plausible, etc.

        // Example for Google Analytics 4:
        /*
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: seoData.title,
                page_location: window.location.href
            });
        }
        */

        console.log(`Page view tracked: ${route} - ${seoData.title}`);
    }

    getRouteSEO() {
        return {
            '/': {
                path: '/',
                title: 'Real Estate Retirement Calculator | Plan Your Rental Property Retirement',
                description: 'Calculate your real estate retirement timeline with our DSCR mortgage calculator. See when you\'ll reach financial independence through rental properties. Free loan terms available.',
                keywords: 'real estate retirement calculator, DSCR calculator, rental property retirement, real estate financial independence, mortgage retirement planning',
                ogTitle: 'Real Estate Retirement Calculator',
                ogDescription: 'Calculate your retirement timeline through rental properties. Get personalized loan terms.',
                ogImage: '/public/og/homepage.png',
                ogType: 'website',
                twitterCard: 'summary_large_image',
                faq: [
                    {
                        q: 'How does the real estate retirement calculator work?',
                        a: 'Our calculator simulates your rental property investment journey, projecting annual property acquisitions, mortgage payments, cash flow, and loan-to-value ratios to determine when you\'ll reach your target retirement income.'
                    },
                    {
                        q: 'What is DSCR in real estate investing?',
                        a: 'DSCR (Debt Service Coverage Ratio) measures how much cash flow a property generates relative to its mortgage payments. Lenders typically require a minimum DSCR of 1.20-1.25 for rental property financing.'
                    },
                    {
                        q: 'How much should I save for real estate retirement?',
                        a: 'Results vary by market and strategy. Our calculator shows you typically need $100K-$500K in down payments and closing costs to start, then regular contributions to scale your portfolio to $10M+ in property value for substantial retirement cash flow.'
                    }
                ]
            },

            '/retirement-calculator': {
                path: '/retirement-calculator',
                title: 'Real Estate Retirement Calculator - Plan Your Financial Independence',
                description: 'Use our comprehensive real estate retirement calculator to model rental property investments, DSCR loans, and cash flow growth. See exactly when you\'ll reach financial independence.',
                keywords: 'real estate retirement calculator, rental property calculator, DSCR retirement planning, financial independence calculator',
                ogTitle: 'Real Estate Retirement Calculator',
                ogDescription: 'Plan your retirement through rental property investments with precise cash flow projections.',
                ogImage: '/public/og/calculator.png',
                faq: [
                    {
                        q: 'What assumptions does the calculator use?',
                        a: 'The calculator uses conservative estimates: 4% annual property appreciation, 3% rent growth, 5% vacancy rates, and inflation-adjusted operating expenses. You can customize all assumptions.'
                    },
                    {
                        q: 'How accurate are the retirement projections?',
                        a: 'The calculator provides directional guidance based on mathematical modeling of rental cash flow and debt schedules. Actual results depend on market conditions, property performance, and your execution.'
                    }
                ]
            },

            '/house-hacking': {
                path: '/house-hacking',
                title: 'House Hacking Retirement Calculator - Live for Free While Building Wealth',
                description: 'Calculate how house hacking can accelerate your retirement timeline. Model living rent-free in your primary residence while renting rooms to offset mortgage costs and build passive income.',
                keywords: 'house hacking calculator, live rent free, rental property financing, mortgage offset strategy',
                ogTitle: 'House Hacking for Retirement',
                ogDescription: 'See how living in your own home while renting rooms accelerates retirement through mortgage offset strategies.',
                ogImage: '/public/og/house-hacking.png',
                faq: [
                    {
                        q: 'How does house hacking work?',
                        a: 'House hacking involves buying a multi-unit property and living in one unit while renting out others. The rental income covers most or all of your mortgage and living expenses.'
                    },
                    {
                        q: 'What loan options work for house hacking?',
                        a: 'Primary residence loans (conventional, FHA, VA) work best. You can also use portfolio loans or DSCR loans if the property has strong cash flow fundamentals.'
                    }
                ]
            },

            '/state/illinois': {
                path: '/state/illinois',
                title: 'Illinois Real Estate Retirement Calculator - Chicago & Suburbs Analysis',
                description: 'Calculate retirement timing with Illinois rental properties. Model Chicago, Aurora, Naperville, and other Illinois markets with accurate property values, rent rates, and local tax considerations.',
                keywords: 'Illinois real estate retirement, Chicago rental properties, Illinois DSCR loans, Midwest real estate investing',
                ogTitle: 'Illinois Real Estate Retirement Calculator',
                ogDescription: 'Plan retirement through Illinois rental properties using Chicago and suburban market data.',
                ogImage: '/public/og/illinois.png'
            },

            '/brrrr': {
                path: '/brrrr',
                title: 'BRRRR Strategy Retirement Calculator - Buy Rehab Rent Refinance Repeat',
                description: 'Model the BRRRR (Buy, Rehab, Rent, Refinance, Repeat) strategy for rapid portfolio growth. Calculate cash-on-cash returns, refinance cash-out, and accelerated property acquisitions.',
                keywords: 'BRRRR strategy calculator, buy rehab rent refinance, fix and flip rentals, cash out refinance',
                ogTitle: 'BRRRR Strategy Retirement Calculator',
                ogDescription: 'Calculate BRRRR strategy returns and see how buy-rehab-rent-refinance accelerates retirement wealth.',
                ogImage: '/public/og/brrrr.png'
            },

            '/beginner': {
                path: '/beginner',
                title: 'Beginner Real Estate Retirement Guide - Start Your Rental Portfolio',
                description: 'New to real estate investing? Learn how to calculate retirement readiness, understand DSCR loans, and build your first rental property portfolio from scratch.',
                keywords: 'beginner real estate investing, first rental property, real estate for beginners, rental portfolio starter',
                ogTitle: 'Beginner Real Estate Retirement Guide',
                ogDescription: 'Learn the fundamentals of real estate retirement planning for complete beginners.',
                ogImage: '/public/og/beginner.png'
            },

            '/no-money-down': {
                path: '/no-money-down',
                title: 'No Money Down Real Estate - Retirement Calculator for Creative Financing',
                description: 'Explore no-money-down real estate investing options including seller financing, private money, hard money, partnerships, and wholesale deals to achieve retirement without large down payments.',
                keywords: 'no money down real estate, creative financing, real estate partnerships, retirement without down payment',
                ogTitle: 'No Money Down Real Estate Retirement',
                ogDescription: 'Explore creative financing options to build retirement wealth without large down payments.',
                ogImage: '/public/og/no-money-down.png'
            }
        };
    }

    // Initialize SEO on page load and route changes
    initSEO() {
        this.updateSEO();

        // Listen for route changes if using SPA routing
        window.addEventListener('popstate', () => {
            this.updateSEO();
        });
    }

    // Update SEO for a specific route (used by router)
    updateRouteSEO(route) {
        this.currentRoute = route;
        this.updateSEO(route);
    }
}

// Initialize SEO manager
const seoManager = new SEOManager();

// Export functions
export function initSEO() {
    seoManager.initSEO();
}

export function updateRouteSEO(route) {
    seoManager.updateRouteSEO(route);
}

// Make available globally
window.initSEO = initSEO;
window.updateRouteSEO = updateRouteSEO;
