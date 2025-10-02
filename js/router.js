// Client-side Router Module with Articles Support
// Handles navigation and content updates for articles and education pages

import { renderArticle, renderArticles } from './articles.js';

class Router {
    constructor() {
        this.currentRoute = '/';
        this.pageContainer = document.getElementById('app');
        this.routes = this.getRoutes();
        this.init();
    }

    init() {
        this.handleRoute(window.location.pathname);
        this.setupEventListeners();

        window.addEventListener('popstate', (e) => {
            this.handleRoute(window.location.pathname);
        });
    }

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

    isInternalLink(href) {
        try {
            const url = new URL(href, window.location.origin);
            return url.origin === window.location.origin;
        } catch {
            return false;
        }
    }

    getPathFromUrl(url) {
        try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.pathname === '/' ? '/' : urlObj.pathname.replace(/\/$/, '');
        } catch {
            return '/';
        }
    }

    navigate(path) {
        if (path !== this.currentRoute) {
            window.history.pushState(null, '', path);
            this.handleRoute(path);
        }
    }

    handleRoute(path) {
        this.currentRoute = path === '/' ? '/' : path.replace(/\/$/, '');

        // Handle articles routes first
        if (this.currentRoute === '/articles') {
            this.updateSEOForRoute({ title: 'Real Estate Investment Articles - Comprehensive Guides | Real Estate Retirement Calculator', description: 'Browse our collection of SEO-optimized real estate investment articles covering strategies, locations, property types, and market trends for investors.' });
            this.renderArticlesPage();
            return;
        }

        if (this.currentRoute.startsWith('/articles/')) {
            const articleSlug = this.currentRoute.replace('/articles/', '');
            const title = `${articleSlug.split('-').join(' ').replace(/\b\w/g, l => l.toUpperCase())} - Real Estate Investment Guide`;
            this.updateSEOForRoute({ title, description: 'Detailed real estate investment guide covering strategies, market analysis, and financial planning for successful investing.' });
            this.renderArticlePage(articleSlug);
            return;
        }

        // Handle other routes
        const route = this.findRoute(this.currentRoute);
        if (route) {
            this.renderPage(route);
            this.updateSEOForRoute(route);
        } else {
            this.handle404();
        }
    }

    findRoute(path) {
        return this.routes[path] || null;
    }

    renderPage(route) {
        // Update hero section
        this.updateHeroSection(route);
        if (this.pageContainer) {
            this.pageContainer.setAttribute('data-route', this.currentRoute);
        }
        window.scrollTo(0, 0);

        // Control calculator section visibility
        const calculatorSection = document.querySelector('.calculator-section');
        const hero = document.querySelector('.hero');
        const features = document.querySelector('.features');
        const ctaSection = document.querySelector('.cta-section');

        if (this.currentRoute === '/retirement-calculator') {
            // Show calculator, hide homepage sections
            if (calculatorSection) calculatorSection.style.display = 'block';
            if (hero) hero.style.display = 'none';
            if (features) features.style.display = 'none';
            if (ctaSection) ctaSection.style.display = 'none';
        } else if (this.currentRoute === '/' || this.currentRoute === '') {
            // Show homepage sections, hide calculator
            if (calculatorSection) calculatorSection.style.display = 'none';
            if (hero) hero.style.display = 'block';
            if (features) features.style.display = 'block';
            if (ctaSection) ctaSection.style.display = 'block';
        }
    }

    updateHeroSection(route) {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        const h1 = hero.querySelector('h1');
        const subtitle = hero.querySelector('.subtitle');

        if (h1) h1.textContent = route.h1 || 'Real Estate Retirement Calculator';
        if (subtitle) subtitle.textContent = route.subtitle || route.description || 'Calculate your retirement timeline through rental property investments.';
    }

    renderArticlesPage() {
        const calculatorSection = document.querySelector('.calculator-section');
        if (!calculatorSection) return;

        // Hide calculator and results sections
        const calculatorCard = calculatorSection.querySelector('.calculator-card');
        const resultsContainer = document.getElementById('results-container');
        if (calculatorCard) calculatorCard.style.display = 'none';
        if (resultsContainer) resultsContainer.style.display = 'none';

        // Create or update articles section
        let articlesSection = document.querySelector('.articles-page');
        if (!articlesSection) {
            articlesSection = document.createElement('div');
            articlesSection.className = 'articles-page';
            calculatorSection.appendChild(articlesSection);
        }

        articlesSection.innerHTML = renderArticles();
        articlesSection.style.display = 'block';

        // Update hero
        this.updateHeroSection({
            h1: 'Real Estate Investment Articles',
            subtitle: 'Comprehensive guides, strategies, and market analysis for real estate investors.'
        });
    }

    renderArticlePage(articleSlug) {
        const calculatorSection = document.querySelector('.calculator-section');
        if (!calculatorSection) return;

        // Hide calculator and results sections
        const calculatorCard = calculatorSection.querySelector('.calculator-card');
        const resultsContainer = document.getElementById('results-container');
        if (calculatorCard) calculatorCard.style.display = 'none';
        if (resultsContainer) resultsContainer.style.display = 'none';

        // Create or update article section
        let articleSection = document.querySelector('.article-page');
        if (!articleSection) {
            articleSection = document.createElement('div');
            articleSection.className = 'article-page';
            calculatorSection.appendChild(articleSection);
        }

        articleSection.innerHTML = renderArticle(articleSlug);
        articleSection.style.display = 'block';
    }

    handle404() {
        window.location.href = '/404.html';
    }

    updateSEOForRoute(route) {
        if (typeof updateRouteSEO === 'function') {
            updateRouteSEO(this.currentRoute);
        }
    }

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
