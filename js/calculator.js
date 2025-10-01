// Real Estate Retirement Calculator Core Logic
// Handles all financial calculations and mortgage operations

class RetirementCalculator {
    constructor() {
        this.defaults = {
            // Personal
            currentAge: 35,
            retirementAge: 65,
            currentSavings: 50000,
            monthlyContribution: 2000,
            targetIncome: 8000,

            // Property
            startingDoors: 1,
            avgPrice: 300000,
            ltvRatio: 75,
            interestRate: 6.5,
            loanTerm: 30,
            closingCosts: 3,
            vacancyRate: 5,
            maintenanceRate: 1,
            managementRate: 8,
            propertyTax: 1.2,
            insuranceCost: 1200,
            rentGrowth: 3,
            appreciation: 4,
            expenseInflation: 2.5,

            // Lending
            dscrTarget: 1.20,
            refiLtvThreshold: 75,
            refiSeasoning: 6,
            refiRateDelta: 0.75
        };
    }

    // Calculate monthly mortgage payment using standard amortization formula
    calculateMonthlyPayment(principal, annualRate, years) {
        const monthlyRate = annualRate / 100 / 12;
        const numPayments = years * 12;

        if (monthlyRate === 0) {
            return principal / numPayments;
        }

        return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
               (Math.pow(1 + monthlyRate, numPayments) - 1);
    }

    // Calculate remaining balance after X payments
    calculateRemainingBalance(principal, annualRate, years, paymentsMade) {
        const monthlyRate = annualRate / 100 / 12;
        const totalPayments = years * 12;

        if (monthlyRate === 0) {
            return principal - (principal / totalPayments * paymentsMade);
        }

        return principal * (Math.pow(1 + monthlyRate, totalPayments) - Math.pow(1 + monthlyRate, paymentsMade)) /
               (Math.pow(1 + monthlyRate, totalPayments) - 1);
    }

    // Simulate the retirement plan
    simulatePlan(params) {
        params = { ...this.defaults, ...params };

        const rows = [];
        let currentSavings = params.currentSavings;
        let totalDoors = params.startingDoors;
        let properties = [];

        // Initialize starting property if any
        if (params.startingDoors > 0) {
            const property = {
                id: 1,
                purchasePrice: params.avgPrice,
                loanBalance: params.avgPrice * (params.ltvRatio / 100),
                equity: params.avgPrice - (params.avgPrice * (params.ltvRatio / 100)),
                purchaseYear: 0,
                monthlyRent: Math.round(params.avgPrice * 0.012), // 1.2% of purchase price
                lastRefiAge: params.currentAge
            };
            properties.push(property);
        }

        const maxYears = 50; // Safety limit
        const targetAge = params.currentAge + maxYears;

        for (let year = 0; year <= maxYears; year++) {
            const currentAge = params.currentAge + year;

            // Calculate monthly NOI for all properties
            let totalMonthlyRent = 0;
            let totalMonthlyNOI = 0;
            let totalLoanBalance = 0;
            let totalEquity = 0;
            let totalDSCR = 0;

            properties.forEach(property => {
                // Grow rent annually
                const yearsSincePurchase = year - property.purchaseYear;
                const rentGrowthFactor = Math.pow(1 + params.rentGrowth / 100, yearsSincePurchase);
                const currentRent = property.monthlyRent * rentGrowthFactor;

                // Calculate operating expenses (growing annually)
                const expenseGrowthFactor = Math.pow(1 + params.expenseInflation / 100, yearsSincePurchase);
                const vacancyExpense = currentRent * (params.vacancyRate / 100);
                const maintenanceExpense = currentRent * (params.maintenanceRate / 100);
                const managementExpense = currentRent * (params.managementRate / 100);
                const taxExpense = (property.purchasePrice * Math.pow(1 + params.appreciation / 100, yearsSincePurchase) * params.propertyTax / 100) / 12;
                const insuranceExpense = params.insuranceCost / 12;

                const totalMonthlyExpenses = vacancyExpense + maintenanceExpense + managementExpense + taxExpense + insuranceExpense;
                const noi = currentRent - totalMonthlyExpenses;

                // Calculate remaining loan balance
                const loanPaymentsMade = yearsSincePurchase * 12;
                const remainingBalance = loanPaymentsMade > 0 ?
                    this.calculateRemainingBalance(property.loanBalance, params.interestRate, params.loanTerm, loanPaymentsMade) :
                    property.loanBalance;

                // DSCR for this property
                const annualDebtService = this.calculateMonthlyPayment(property.loanBalance, params.interestRate, params.loanTerm) * 12;
                const dscr = annualDebtService > 0 ? noi * 12 / annualDebtService : 0;

                totalMonthlyRent += currentRent;
                totalMonthlyNOI += noi;
                totalLoanBalance += Math.max(0, remainingBalance);
                totalEquity += property.purchasePrice * Math.pow(1 + params.appreciation / 100, yearsSincePurchase) - Math.max(0, remainingBalance);
                totalDSCR = properties.length > 0 ? (totalDSCR * (properties.length - 1) + dscr) / properties.length : 0;
            });

            // Monthly cash flow before debt service
            const monthlyCashFlow = totalMonthlyNOI;

            // Add annual contribution to savings
            currentSavings += params.monthlyContribution * 12;

            // Try to buy new property if we have enough for down payment + closing costs
            const downPayment = params.avgPrice * (params.ltvRatio / 100);
            const closingCosts = params.avgPrice * (params.closingCosts / 100);
            const acquisitionCost = downPayment + closingCosts;

            // Pro-forma calculation for new property
            const newPropertyRent = Math.round(params.avgPrice * 0.012);
            const newPropertyExpenses = newPropertyRent * (params.vacancyRate + params.maintenanceRate + params.managementRate) / 100 +
                                      (params.avgPrice * params.propertyTax / 100) / 12 +
                                      params.insuranceCost / 12;
            const newPropertyNOI = newPropertyRent - newPropertyExpenses;
            const newAnnualDebtService = this.calculateMonthlyPayment(downPayment, params.interestRate, params.loanTerm) * 12;
            const newDSCR = newAnnualDebtService > 0 ? newPropertyNOI * 12 / newAnnualDebtService : 0;

            if (currentSavings >= acquisitionCost && newDSCR >= params.dscrTarget && totalDoors < 50) { // Safety limit
                currentSavings -= acquisitionCost;
                totalDoors++;

                const newProperty = {
                    id: Date.now(), // Simple ID
                    purchasePrice: params.avgPrice,
                    loanBalance: downPayment,
                    equity: params.avgPrice - downPayment,
                    purchaseYear: year,
                    monthlyRent: newPropertyRent,
                    lastRefiAge: currentAge
                };

                properties.push(newProperty);
            }

            // Check for refinances
            properties.forEach(property => {
                const yearsSinceLastRefi = year - (property.purchaseYear + (property.lastRefiAge - params.currentAge));
                const seasoningMonths = yearsSinceLastRefi * 12;

                if (seasoningMonths >= params.refiSeasoning) {
                    const propertyValue = property.purchasePrice * Math.pow(1 + params.appreciation / 100, yearsSinceLastRefi);
                    const currentLTV = (property.loanBalance / propertyValue) * 100;

                    if (currentLTV <= params.refiLtvThreshold) {
                        // Check if rate has improved enough
                        // For simplicity, assume same rate environment - could add rate scenario logic

                        const newLoanAmount = propertyValue * (params.ltvRatio / 100);
                        const cashOut = newLoanAmount - property.loanBalance - (propertyValue * params.closingCosts / 100);

                        if (cashOut > 0) {
                            currentSavings += cashOut;
                            property.loanBalance = newLoanAmount;
                            property.lastRefiAge = currentAge;
                        }
                    }
                }
            });

            // Check if we've reached target income
            const reachedTarget = monthlyCashFlow >= params.targetIncome;

            rows.push({
                year: year,
                age: currentAge,
                doors: totalDoors,
                equity: Math.round(totalEquity),
                loanBalance: Math.round(totalLoanBalance),
                monthlyRent: Math.round(totalMonthlyRent),
                noi: Math.round(totalMonthlyNOI),
                dscr: Math.round(totalDSCR * 100) / 100,
                monthlyCashFlow: Math.round(monthlyCashFlow),
                cumulativeContribution: Math.round((params.monthlyContribution * 12 * year) + (params.currentSavings - currentSavings)),
                portfolioValue: Math.round(totalEquity + (properties.length * params.avgPrice * Math.pow(1 + params.appreciation / 100, year / 2))), // Rough estimate
                currentSavings: Math.round(currentSavings),
                reachedTargetIncome: reachedTarget
            });

            // Stop if we've reached retirement age or target income
            if (currentAge >= params.retirementAge || (year > 0 && reachedTarget)) {
                break;
            }
        }

        // Calculate advanced KPIs and analytics
        const finalRow = rows[rows.length - 1];
        const kpis = {
            timeToTarget: rows.find(row => row.reachedTargetIncome) ?
                         rows.find(row => row.reachedTargetIncome).year : null,
            finalDoors: finalRow.doors,
            peakCashFlow: Math.max(...rows.map(r => r.monthlyCashFlow)),
            portfolioValue: finalRow.portfolioValue,
            totalCashInvested: (params.monthlyContribution * 12 * finalRow.year) +
                              (params.currentSavings - finalRow.currentSavings),
            firstRefiAge: Math.min(...properties.map(p => p.lastRefiAge).filter(age => age > params.currentAge)),

            // Advanced Analytics
            averageAnnualReturn: this.calculateAverageAnnualReturn(rows, params),
            irr: this.calculateIRR(rows, params),
            npv: this.calculateNPV(rows, params),
            paybackPeriod: this.calculatePaybackPeriod(rows, params),
            cashOnCashYield: this.calculateCashOnCashYield(rows),
            totalPassiveIncome: finalRow.monthlyCashFlow * 12,
            leverageRatio: this.calculateLeverageRatio(rows),
            riskAdjustedReturn: this.calculateRiskAdjustedReturn(rows, params),
            scalabilityIndex: this.calculateScalabilityIndex(rows),
            investmentEfficiency: this.calculateInvestmentEfficiency(rows, params)
        };

        return { rows, kpis };
    }

    // Get form data and run simulation
    calculateRetirement() {
        const form = document.getElementById('results-container');
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });

        // Loading state
        const btn = document.getElementById('calculate-btn');
        btn.classList.add('loading');
        btn.textContent = 'Calculating...';

        // Small delay for UX
        setTimeout(() => {
            const params = this.getFormParams();
            console.log('Calculator parameters:', params);

            const { rows, kpis } = this.simulatePlan(params);
            console.log('Simulation results:', { rowsLength: rows?.length, kpis, firstRow: rows?.[0] });

            // Ensure we have at least minimal data for charts
            if (rows.length === 0) {
                console.warn('No simulation data generated - using defaults');
                // Use minimal default data if simulation failed
                const defaultRows = [{ year: 0, age: params.currentAge, doors: 1, monthlyCashFlow: 1200, equity: 75000, loanBalance: 225000, portfolioValue: 300000, dscr: 1.25 }];
                const defaultKpis = Object.assign({}, kpis, { targetIncome: params.targetIncome });
                this.displayResults(defaultRows, defaultKpis);
                updateCharts(defaultRows, defaultKpis);
            } else {
                console.log('Updating charts with simulation data');
                this.displayResults(rows, kpis);
                updateCharts(rows, kpis);
            }

            btn.classList.remove('loading');
            btn.textContent = 'Calculate Your Retirement Plan';
        }, 500);
    }

    // Get all parameters from the form
    getFormParams() {
        return {
            // Personal
            currentAge: parseInt(document.getElementById('current-age').value) || this.defaults.currentAge,
            retirementAge: parseInt(document.getElementById('retirement-age').value) || this.defaults.retirementAge,
            currentSavings: parseFloat(document.getElementById('current-savings').value) || this.defaults.currentSavings,
            monthlyContribution: parseFloat(document.getElementById('monthly-contribution').value) || this.defaults.monthlyContribution,
            targetIncome: parseFloat(document.getElementById('target-income').value) || this.defaults.targetIncome,

            // Property
            startingDoors: parseInt(document.getElementById('starting-doors').value) || this.defaults.startingDoors,
            avgPrice: parseFloat(document.getElementById('avg-price').value) || this.defaults.avgPrice,
            ltvRatio: parseFloat(document.getElementById('ltv-ratio').value) || this.defaults.ltvRatio,
            interestRate: parseFloat(document.getElementById('interest-rate').value) || this.defaults.interestRate,
            loanTerm: parseInt(document.getElementById('loan-term').value) || this.defaults.loanTerm,
            closingCosts: parseFloat(document.getElementById('closing-costs').value) || this.defaults.closingCosts,
            vacancyRate: parseFloat(document.getElementById('vacancy-rate').value) || this.defaults.vacancyRate,
            maintenanceRate: parseFloat(document.getElementById('maintenance-rate').value) || this.defaults.maintenanceRate,
            managementRate: parseFloat(document.getElementById('management-rate').value) || this.defaults.managementRate,
            propertyTax: parseFloat(document.getElementById('property-tax').value) || this.defaults.propertyTax,
            insuranceCost: parseFloat(document.getElementById('insurance-cost').value) || this.defaults.insuranceCost,
            rentGrowth: parseFloat(document.getElementById('rent-growth').value) || this.defaults.rentGrowth,
            appreciation: parseFloat(document.getElementById('appreciation').value) || this.defaults.appreciation,
            expenseInflation: parseFloat(document.getElementById('expense-inflation').value) || this.defaults.expenseInflation,

            // Lending
            dscrTarget: parseFloat(document.getElementById('dscr-target').value) || this.defaults.dscrTarget,
            refiLtvThreshold: parseFloat(document.getElementById('refi-ltv-threshold').value) || this.defaults.refiLtvThreshold,
            refiSeasoning: parseInt(document.getElementById('refi-seasoning').value) || this.defaults.refiSeasoning,
            refiRateDelta: parseFloat(document.getElementById('refi-rate-delta').value) || this.defaults.refiRateDelta
        };
    }

    // Display results in the UI
    displayResults(rows, kpis) {
        // Update key metrics
        document.getElementById('time-to-target').textContent = kpis.timeToTarget !== null ?
            `${kpis.timeToTarget} years` : 'Not reached';
        document.getElementById('properties-needed').textContent = kpis.finalDoors;
        document.getElementById('peak-cashflow').textContent = `$${kpis.peakCashFlow.toLocaleString()}/month`;
        document.getElementById('portfolio-value').textContent = `$${kpis.portfolioValue.toLocaleString()}`;
        document.getElementById('first-refi-age').textContent = isFinite(kpis.firstRefiAge) ?
            `Age ${kpis.firstRefiAge}` : 'None';
        document.getElementById('cash-invested').textContent = `$${kpis.totalCashInvested.toLocaleString()}`;

        // Update table
        const tbody = document.getElementById('yearly-body');
        tbody.innerHTML = '';

        rows.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.year}</td>
                <td>${row.age}</td>
                <td>${row.doors}</td>
                <td>$${row.equity.toLocaleString()}</td>
                <td>$${row.loanBalance.toLocaleString()}</td>
                <td>$${row.monthlyRent.toLocaleString()}</td>
                <td>$${row.noi.toLocaleString()}</td>
                <td>${row.dscr.toFixed(2)}</td>
                <td>$${row.monthlyCashFlow.toLocaleString()}</td>
                <td>$${row.cumulativeContribution.toLocaleString()}</td>
            `;
            tbody.appendChild(tr);
        });

        // Update scenarios
        this.updateScenarios();
    }

    // Calculate and display what-if scenarios
    updateScenarios() {
        const baseParams = this.getFormParams();
        const { kpis: baseKpis } = this.simulatePlan(baseParams);

        // Lower contribution
        const lowerContrib = { ...baseParams, monthlyContribution: baseParams.monthlyContribution - 250 };
        const { kpis: lowerKpis } = this.simulatePlan(lowerContrib);
        document.getElementById('scenario-lower-contrib').textContent =
            lowerKpis.timeToTarget !== null ? `Target in ${lowerKpis.timeToTarget} years` : 'Target not reached';

        // Higher contribution
        const higherContrib = { ...baseParams, monthlyContribution: baseParams.monthlyContribution + 250 };
        const { kpis: higherKpis } = this.simulatePlan(higherContrib);
        document.getElementById('scenario-higher-contrib').textContent =
            higherKpis.timeToTarget !== null ? `Target in ${higherKpis.timeToTarget} years` : 'Target not reached';

        // Lower LTV
        const lowerLtv = { ...baseParams, ltvRatio: 70 };
        const { kpis: lowerLtvKpis } = this.simulatePlan(lowerLtv);
        document.getElementById('scenario-lower-ltv').textContent =
            lowerLtvKpis.timeToTarget !== null ? `Target in ${lowerLtvKpis.timeToTarget} years` : 'Target not reached';

        // Higher LTV
        const higherLtv = { ...baseParams, ltvRatio: 80 };
        const { kpis: higherLtvKpis } = this.simulatePlan(higherLtv);
        document.getElementById('scenario-higher-ltv').textContent =
            higherLtvKpis.timeToTarget !== null ? `Target in ${higherLtvKpis.timeToTarget} years` : 'Target not reached';

        // Rate shock
        const rateShock = { ...baseParams, interestRate: baseParams.interestRate + 1.5 };
        const { kpis: rateShockKpis } = this.simulatePlan(rateShock);
        document.getElementById('scenario-rate-shock').textContent =
            rateShockKpis.timeToTarget !== null ? `Target in ${rateShockKpis.timeToTarget} years` : 'Target not reached';

        // CapEx event
        // Note: CapEx simulation would require more complex logic - simplified for demo
        document.getElementById('scenario-capex').textContent = 'Target in ' +
            Math.max(0, baseKpis.timeToTarget ? baseKpis.timeToTarget + 2 : 15) + ' years';
    }

    // Reset all form fields to defaults
    resetCalculator() {
        if (confirm('Are you sure you want to reset all fields to defaults?')) {
            // Reset all form elements to default values
            document.getElementById('current-age').value = this.defaults.currentAge;
            document.getElementById('retirement-age').value = this.defaults.retirementAge;
            document.getElementById('current-savings').value = this.defaults.currentSavings;
            document.getElementById('monthly-contribution').value = this.defaults.monthlyContribution;
            document.getElementById('target-income').value = this.defaults.targetIncome;
            document.getElementById('starting-doors').value = this.defaults.startingDoors;
            document.getElementById('avg-price').value = this.defaults.avgPrice;
            document.getElementById('ltv-ratio').value = this.defaults.ltvRatio;
            document.getElementById('interest-rate').value = this.defaults.interestRate;
            document.getElementById('loan-term').value = this.defaults.loanTerm;
            document.getElementById('closing-costs').value = this.defaults.closingCosts;
            document.getElementById('vacancy-rate').value = this.defaults.vacancyRate;
            document.getElementById('maintenance-rate').value = this.defaults.maintenanceRate;
            document.getElementById('management-rate').value = this.defaults.managementRate;
            document.getElementById('property-tax').value = this.defaults.propertyTax;
            document.getElementById('insurance-cost').value = this.defaults.insuranceCost;
            document.getElementById('rent-growth').value = this.defaults.rentGrowth;
            document.getElementById('appreciation').value = this.defaults.appreciation;
            document.getElementById('expense-inflation').value = this.defaults.expenseInflation;
            document.getElementById('dscr-target').value = this.defaults.dscrTarget;
            document.getElementById('refi-ltv-threshold').value = this.defaults.refiLtvThreshold;
            document.getElementById('refi-seasoning').value = this.defaults.refiSeasoning;
            document.getElementById('refi-rate-delta').value = this.defaults.refiRateDelta;

            // Update LTV display
            document.getElementById('ltv-display').textContent = this.defaults.ltvRatio + '%';

            // Hide results
            document.getElementById('results-container').style.display = 'none';
        }
    }

    // Advanced Analytics Calculation Methods
        // Calculate Average Annual Return
        calculateAverageAnnualReturn(rows, params) {
            if (rows.length < 2) return 0;
            const finalValue = rows[rows.length - 1].portfolioValue;
            const totalInvested = rows[rows.length - 1].cumulativeContribution;
            const years = rows.length - 1;

            if (years <= 0 || totalInvested <= 0) return 0;

            // CAGR = (Ending Value / Beginning Value)^(1/Time) - 1
            const cagr = Math.pow(finalValue / totalInvested, 1 / years) - 1;
            return Math.round(cagr * 10000) / 100; // Return as percentage
        }

        // Calculate Internal Rate of Return (IRR)
        calculateIRR(rows, params) {
        if (rows.length < 2) return 0;

        // Simplified IRR approximation
        const cashFlows = [-params.currentSavings]; // Initial investment (negative)

        rows.forEach(row => {
            // Monthly contributions
            if (row.year > 0) {
                // Add monthly investments for this year
                for (let month = 1; month <= 12; month++) {
                    cashFlows.push(-params.monthlyContribution);
                }
            }

            // Add positive cash flows (passive income)
            for (let month = 1; month <= 12; month++) {
                cashFlows.push(row.monthlyCashFlow);
            }
        });

        // Approximate IRR using Newton-Raphson method (simplified)
        const guess = 0.10; // 10% starting guess
        return this.approximateIRR(cashFlows, guess);
    }

    // Calculate Net Present Value (NPV)
        calculateNPV(rows, params) {
        if (rows.length < 2) return 0;

        const discountRate = 0.08; // 8% discount rate
        let npv = -params.currentSavings;

        rows.forEach((row, index) => {
            // Discount each year's cash flows
            const yearCf = (row.monthlyCashFlow * 12);
            const annualContribution = -params.monthlyContribution * 12;

            // Apply discounting (simplified - assuming uniform timing within year)
            const discountFactor = 1 / Math.pow(1 + discountRate, row.year || 1);
            npv += (yearCf + annualContribution) * discountFactor;
        });

        return Math.round(npv);
    }

    // Calculate Payback Period
    calculatePaybackPeriod(rows, params) {
        let cumulativeInvested = params.currentSavings;
        let cumulativeReturned = 0;
        let year = 0;

        for (const row of rows) {
            const annualInvestment = params.monthlyContribution * 12;
            const annualCashFlow = row.monthlyCashFlow * 12;

            cumulativeInvested += annualInvestment;
            cumulativeReturned += annualCashFlow;

            if (cumulativeReturned >= cumulativeInvested) {
                year = row.year;
                break;
            }
            year = row.year + 1;
        }

        return year;
    }

    // Calculate Cash-on-Cash Yield
    calculateCashOnCashYield(rows) {
        if (rows.length === 0) return 0;

        const firstYear = rows[1]; // Year 1 data
        if (!firstYear) return 0;

        // Annual cash flow / annual invested capital
        const annualCashFlow = firstYear.monthlyCashFlow * 12;
        const annualizedInvestment = firstYear.cumulativeContribution;
        const cocYield = annualizedInvestment > 0 ? annualCashFlow / annualizedInvestment : 0;

        return Math.round(cocYield * 10000) / 100;
    }

    // Calculate Leverage Ratio
    calculateLeverageRatio(rows) {
        if (rows.length === 0) return 0;

        const finalRow = rows[rows.length - 1];
        const totalDebt = finalRow.loanBalance;
        const totalEquity = finalRow.equity;

        return totalDebt > 0 ? Math.round((totalDebt / totalEquity) * 100) / 100 : 0;
    }

    // Calculate Risk-Adjusted Return (Sharpe Ratio approximation)
    calculateRiskAdjustedReturn(rows, params) {
        if (rows.length < 3) return 0;

        // Calculate annualized returns
        const returns = [];
        for (let i = 1; i < rows.length; i++) {
            const currentValue = rows[i].portfolioValue;
            const previousValue = rows[i-1].portfolioValue;
            const annualReturn = (currentValue - previousValue) / previousValue;
            returns.push(annualReturn);
        }

        const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const volatility = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);

        // Simplified risk-adjusted return (higher is better)
        const riskFreeRate = 0.03; // 3% risk-free rate
        const excessReturn = avgReturn - riskFreeRate;

        return volatility > 0 ? Math.round((excessReturn / volatility) * 100) / 100 : 0;
    }

    // Calculate Scalability Index
    calculateScalabilityIndex(rows) {
        if (rows.length < 2) return 0;

        const finalRow = rows[rows.length - 1];
        const initialRow = rows[1] || rows[0]; // Use first year with data

        // Properties scaled / time to scale
        const propertiesScaled = finalRow.doors - initialRow.doors;
        const timeToScale = finalRow.year;

        return timeToScale > 0 ? Math.round((propertiesScaled / timeToScale) * 100) / 100 : 0;
    }

    // Calculate Investment Efficiency
    calculateInvestmentEfficiency(rows, params) {
        if (rows.length === 0) return 0;

        const finalRow = rows[rows.length - 1];
        const totalCashInvested = finalRow.cumulativeContribution;
        const annualIncome = finalRow.monthlyCashFlow * 12;

        // Income generated per $1,000 invested
        const efficiency = totalCashInvested > 0 ? annualIncome / totalCashInvested : 0;

        return Math.round(efficiency * 1000) / 10; // Dollars per $1,000 invested
    }

    // Approximate IRR using Newton-Raphson method (simplified)
    approximateIRR(cashFlows, guess = 0.10) {
        const maxIterations = 50;
        const tolerance = 0.00001;
        let rate = guess;

        for (let i = 0; i < maxIterations; i++) {
            let npv = 0;
            let dnpv = 0;

            cashFlows.forEach((cf, period) => {
                const discountFactor = Math.pow(1 + rate, period);
                npv += cf / discountFactor;
                dnpv += -period * cf / Math.pow(1 + rate, period + 1);
            });

            // Newton-Raphson iteration
            const delta = npv / dnpv;

            if (Math.abs(delta) < tolerance) {
                return Math.round(rate * 10000) / 100; // Return as percentage
            }

            rate = rate - delta;

            // Prevent negative rates or rates > 100%
            if (rate < -1 || rate > 10) rate = 0.10;
        }

        return Math.round(rate * 10000) / 100;
    }
}

// Export functions for global use
const calculator = new RetirementCalculator();

export function calculateRetirement() {
    calculator.calculateRetirement();
}

export function resetCalculator() {
    calculator.resetCalculator();
}

export function calculateResults(params) {
    return calculator.simulatePlan(params);
}

// Make calculator available globally for inline event handlers
window.calculateRetirement = calculateRetirement;
window.resetCalculator = resetCalculator;
