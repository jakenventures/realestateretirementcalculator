// Pages Content Module
// Defines content for education pages and strategies

class PagesManager {
    constructor() {
        this.pages = this.getPagesContent();
    }

    // Get all page content definitions
    getPagesContent() {
        return {
            // This would contain the content templates referenced in pages.js
            // In this implementation, we've integrated content into router.js
            // But for production, we'd have rich content here

            '/beginner': {
                h1: 'Real Estate Retirement for Beginners',
                subtitle: 'Start your rental property investment journey with confidence',
                bodyHTML: this.generateBeginnerContent(),
                faq: [
                    {
                        q: 'How do I get started with real estate investing?',
                        a: 'Start by educating yourself, saving for down payments, getting your finances in order, and networking with experienced investors. Use our calculator to model your first deals.'
                    },
                    {
                        q: 'What\'s the minimum amount I need to start?',
                        a: 'For a single-family rental, expect to need $50,000-$100,000 including down payment, closing costs, and reserves. House hacking can reduce this significantly.'
                    }
                ]
            },

            '/house-hacking': {
                h1: 'House Hacking Your Way to Retirement',
                subtitle: 'Live rent-free while building wealth',
                bodyHTML: this.generateHouseHackingContent(),
                faq: [
                    {
                        q: 'How much can house hacking save me?',
                        a: 'House hacking can eliminate $800-$2,000/month in rent payments which you can redirect to mortgage and retirement savings.'
                    },
                    {
                        q: 'What are the best house hacking markets?',
                        a: 'College towns like Ann Arbor, Austin, and Tucson offer strong rental demand and property appreciation potential.'
                    }
                ]
            },

            '/brrrr': {
                h1: 'BRRRR Strategy: Accelerate Your Retirement',
                subtitle: 'Buy, Rehab, Rent, Refinance, Repeat - Scale rapidly',
                bodyHTML: this.generateBRRRRContent(),
                faq: [
                    {
                        q: 'What\'s the key to BRRRR success?',
                        a: 'Focus on finding undervalued properties, creating detailed rehab budgets, and ensuring post-rehab rents cover the new mortgage payment.'
                    },
                    {
                        q: 'How much rehab budget should I allocate?',
                        a: 'Plan for 25-40% of purchase price for major rehabs. Get multiple contractor bids and always add 10-15% contingency.'
                    }
                ]
            }
        };
    }

    generateBeginnerContent() {
        return `
            <div class="education-content">
                <h2>Your First Steps in Real Estate Retirement</h2>
                <p>Getting started with real estate investing can seem overwhelming, but breaking it down into manageable steps makes it achievable for anyone willing to learn.</p>

                <h3>1. Educate Yourself First</h3>
                <p>Knowledge is your strongest asset. Before investing a dollar, understand:</p>
                <ul>
                    <li>How rental property cash flow works</li>
                    <li>Key financial metrics (NOI, DSCR, cap rate)</li>
                    <li>Financing options and loan requirements</li>
                    <li>Tax implications and benefits</li>
                </ul>

                <h3>2. Get Your Finances in Order</h3>
                <p>Lenders will scrutinize your financial picture. Focus on:</p>
                <ul>
                    <li>Building emergency savings (3-6 months)</li>
                    <li>Maintaining excellent credit (aim for 720+)</li>
                    <li>Keeping debt-to-income ratio under 45%</li>
                    <li>Understanding your price range</li>
                </ul>

                <h4>Save Aggressively</h4>
                <p>Use our calculator to see how regular contributions compound. Starting with $50,000 in savings and $2,000/month contributions can get you to financial independence in 10-15 years.</p>

                <h3>3. Choose Your Strategy</h3>
                <p>As a beginner, consider these approaches:</p>
                <dl>
                    <dt>House Hacking</dt>
                    <dd>Live in one unit, rent others to offset your mortgage. Lowest risk entry point.</dd>
                    <dt>Duplex/Triplex</dt>
                    <dd>Small multi-units provide diversification and cash flow in one package.</dd>
                    <dt>BRRRR</dt>
                    <dd>Higher risk, higher reward. Requires more experience and contractor relationships.</dd>
                </dl>

                <h2>Common Beginner Mistakes to Avoid</h2>
                <div class="callout-box">
                    <h4>⚠️ Don't invest without proper education</h4>
                    <p>Jumping into real estate without understanding cash flow analysis is like investing in stocks without knowing P/E ratios.</p>

                    <h4>⚠️ Don't over-leverage on your first deal</h4>
                    <p>Aim for 70-80% LTV on starter properties. Leave yourself financial breathing room.</p>

                    <h4>⚠️ Don't forget about reserves</h4>
                    <p>Set aside 3-6 months of mortgage payments and 1-2 months of operating expenses in reserves.</p>
                </div>

                <div class="cta-section" style="text-align: center; margin: 3rem 0;">
                    <h3>Ready to Model Your First Deal?</h3>
                    <p>Get personalized loan terms to see if you're ready to start investing.</p>
                    <a href="https://www.getloanterms.com" class="btn" target="_blank" rel="noopener">Get Your Personalized Loan Terms</a>
                </div>
            </div>
        `;
    }

    generateHouseHackingContent() {
        return `
            <div class="education-content">
                <h2>House Hacking: Live for Free While Building Your Portfolio</h2>
                <p>House hacking is the single best way for individuals to start building rental wealth. It's so effective that many real estate investors started this way.</p>

                <h3>The House Hacking Formula</h3>
                <div class="formula-box">
                    <p><strong>(Rent Collected + Savings) - Mortgage = Housing Profit</strong></p>
                </div>

                <h3>Why House Hacking Works</h3>
                <p>When you live in your home, your mortgage payment becomes an investment expense rather than a personal expense. This creates 2X leverage:</p>
                <ol>
                    <li><strong>Lower Housing Costs:</strong> Rent offsets your mortgage and sometimes utilities too</li>
                    <li><strong>Property Ownership:</strong> Build equity and long-term wealth instead of enriching a landlord</li>
                    <li><strong>Forced Savings:</strong> Mortgage payments build home equity</li>
                    <li><strong>Investment Foundation:</strong> Experience managing rentals before growing your portfolio</li>
                </ol>

                <h2>Example: $400K House Hacking Scenario</h2>
                <table class="example-table">
                    <tr><th>Monthly Cash Flow</th><th>Without House Hacking</th><th>With House Hacking</th></tr>
                    <tr><td>Gross Rent</td><td>$0</td><td>$2,800</td></tr>
                    <tr><td>Mortgage Payment</td><td>$2,400</td><td>$2,400</td></tr>
                    <tr><td>Operating Costs</td><td>$0</td><td>$400</td></tr>
                    <tr><td>Net Monthly</td><td><span style="color: red;">-$2,400</span></td><td><span style="color: green;">$0</span></td></tr>
                </table>
                <p>In this example, house hacking eliminates $2,400/month in housing costs while building $600,000+ in home equity over 30 years.</p>

                <h3>Best House Hacking Markets</h3>
                <ul>
                    <li><strong>College Towns:</strong> Ann Arbor (MI), Madison (WI), Tucson (AZ)</li>
                    <li><strong>Tech Hubs:</strong> Austin (TX), Raleigh (NC)</li>
                    <li><strong>Growing Cities:</strong> Nashville (TN), Charlotte (NC)</li>
                </ul>

                <h2>House Hacking Loan Options</h2>
                <div class="loan-options">
                    <div class="loan-card">
                        <h4>Conventional Loan</h4>
                        <p>Best for primary residence benefits</p>
                        <ul>
                            <li>LTV up to 97%</li>
                            <li>30-year fixed or 15/30 ARM</li>
                            <li>Can rent rooms immediately</li>
                        </ul>
                    </div>

                    <div class="loan-card">
                        <h4>FHA Loan</h4>
                        <p>Makes house hacking accessible</p>
                        <ul>
                            <li>3.5% down payment required</li>
                            <li>Perfect for first-time investors</li>
                            <li>Rental covenants are flexible</li>
                        </ul>
                    </div>

                    <div class="loan-card">
                        <h4>Portfolio Loans</h4>
                        <p>Highest flexibility</p>
                        <ul>
                            <li>No rental restrictions</li>
                            <li>Faster approval</li>
                            <li>Higher rates but no PMI</li>
                        </ul>
                    </div>
                </div>

                <div class="cta-section" style="text-align: center; margin: 3rem 0;">
                    <h3>Get Qualified for House Hacking Financing</h3>
                    <p>See personalized loan options available in your market.</p>
                    <a href="https://www.getloanterms.com" class="btn" target="_blank" rel="noopener">Get Your Loan Options</a>
                </div>
            </div>
        `;
    }

    generateBRRRRContent() {
        return `
            <div class="education-content">
                <h2>BRRRR: Buy, Rehab, Rent, Refinance, Repeat</h2>
                <p>The BRRRR strategy is like a money machine. Buy undervalued properties, improve them, find great tenants, refinance for cash out, and repeat.</p>

                <h3>The BRRRR Process</h3>
                <div class="process-steps">
                    <div class="step">
                        <h4>1. Buy</h4>
                        <p>Find properties 20-30% below market value. Look for motivated sellers and off-market deals.</p>
                    </div>
                    <div class="step">
                        <h4>2. Rehab</h4>
                        <p>Improve property to increase rent by 50-100%. Focus on kitchen, bathrooms, curb appeal.</p>
                    </div>
                    <div class="step">
                        <h4>3. Rent</h4>
                        <p>Find quality tenants willing to pay premium rent for an upgraded property.</p>
                    </div>
                    <div class="step">
                        <h4>4. Refinance</h4>
                        <p>Get cash out by refinancing at 70-80% LTV after rehab. Cash out pays off initial acquisition costs.</p>
                    </div>
                    <div class="step">
                        <h4>5. Repeat</h4>
                        <p>Each refinance generates capital for the next deal. Scale efficiently.</p>
                    </div>
                </div>

                <h2>BRRRR Math Example</h2>
                <div class="brrrr-example">
                    <h3>$150,000 Property Deal</h3>
                    <div class="deal-grid">
                        <div class="deal-item">
                            <strong>Purchase Price:</strong> $150,000
                        </div>
                        <div class="deal-item">
                            <strong>Rehab Budget:</strong> $35,000
                        </div>
                        <div class="deal-item">
                            <strong>Total Invested:</strong> $185,000
                        </div>
                        <div class="deal-item">
                            <strong>After Repair Value:</strong> $240,000
                        </div>
                        <div class="deal-item">
                            <strong>Refi at 75% LTV:</strong> $180,000
                        </div>
                        <div class="deal-item">
                            <strong>Cash Out:</strong> $135,000 (covers costs + profit)
                        </div>
                    </div>
                </div>

                <h3>BRRRR Deal Criteria</h3>
                <p>Not every property works for BRRRR. Focus on deals where:</p>
                <ul>
                    <li><strong>70% Rule:</strong> Purchase + Rehab ≤ 70% of After Repair Value</li>
                    <li><strong>Rent Growth:</strong> Post-rehab rent justifies refinance</li>
                    <li><strong>DSCR Target:</strong> ≥1.25x after refinance</li>
                    <li><strong>Market:</strong> Bull market with growing rents</li>
                </ul>

                <h2>BRRRR Financing Strategy</h2>
                <p>Success depends on timing your construction financing and refinance properly.</p>

                <div class="financing-timeline">
                    <div class="timeline-item">
                        <h4>M Month 1-3: Acquisition</h4>
                        <p>Hard money or construction loan for purchase + rehab</p>
                    </div>
                    <div class="timeline-item">
                        <h4>Month 4-6: Rehab Period</h4>
                        <p>Complete renovations, get property rented</p>
                    </div>
                    <div class="timeline-item">
                        <h4>Month 7: Cash-Out Refinance</h4>
                        <p>Long-term DSCR loan at 70-80% LTV</p>
                    </div>
                </div>

                <div class="cta-section" style="text-align: center; margin: 3rem 0;">
                    <h3>Find Your First BRRRR Deal</h3>
                    <p>Get qualified for construction and DSCR loans to start building your real estate portfolio.</p>
                    <a href="https://www.getloanterms.com" class="btn" target="_blank" rel="noopener">Get BRRRR Loan Terms</a>
                </div>
            </div>
        `;
    }

    // Initialize page content
    initPages() {
        // Insert dynamic content for specific routes
        const currentRoute = window.location.pathname;
        const pageData = this.pages[currentRoute];

        if (pageData && pageData.bodyHTML) {
            // Find content insertion point (after calculator)
            const calculator = document.querySelector('.calculator-card');
            if (calculator && calculator.parentNode) {
                const contentDiv = document.createElement('div');
                contentDiv.innerHTML = pageData.bodyHTML;
                calculator.parentNode.insertBefore(contentDiv, calculator.nextSibling);
            }
        }
    }
}

// Initialize pages manager
const pagesManager = new PagesManager();

// Export functions
export function initPages() {
    pagesManager.initPages();
}

// Make globally available
window.pagesManager = pagesManager;
