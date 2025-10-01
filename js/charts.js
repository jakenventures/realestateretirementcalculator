// Chart rendering module using vanilla Canvas
// Creates responsive financial charts for the retirement calculator

class ChartManager {
    constructor() {
        this.charts = {};
        this.resizeObserver = null;
        this.initResizeObserver();
    }

    initResizeObserver() {
        this.resizeObserver = new ResizeObserver(entries => {
            entries.forEach(entry => {
                const canvas = entry.target;
                if (canvas.chartId) {
                    this.resizeChart(canvas.chartId);
                }
            });
        });
    }

    resizeChart(chartId) {
        const canvas = document.getElementById(chartId);
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        // Re-render chart
        if (this.charts[chartId]) {
            this.renderChart(chartId, this.charts[chartId].data, this.charts[chartId].type);
        }
    }

    initCharts() {
        const chartIds = ['cashflow-chart', 'portfolio-chart', 'doors-chart', 'dscr-chart'];

        chartIds.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                this.resizeObserver.observe(canvas);
                canvas.chartId = id;
                this.resizeChart(id);
            }
        });
    }

    updateCharts(rows, kpis) {
        if (!rows || rows.length === 0) return;

        // Cash flow vs target chart
        this.renderChart('cashflow-chart', {
            labels: rows.map(r => `Year ${r.year}`),
            datasets: [
                {
                    label: 'Monthly Cash Flow',
                    data: rows.map(r => r.monthlyCashFlow),
                    color: '#FFD300',
                    type: 'line'
                },
                {
                    label: 'Target Income',
                    data: rows.map(r => kpis.targetIncome || 8000), // Get from KPIs or default
                    color: '#333',
                    type: 'line',
                    dashed: true
                }
            ]
        }, 'line');

        // Portfolio equity vs loan balance
        this.renderChart('portfolio-chart', {
            labels: rows.map(r => `Year ${r.year}`),
            datasets: [
                {
                    label: 'Equity',
                    data: rows.map(r => r.equity),
                    color: '#FFD300',
                    type: 'area'
                },
                {
                    label: 'Loan Balance',
                    data: rows.map(r => r.loanBalance),
                    color: '#666',
                    type: 'area'
                }
            ]
        }, 'area');

        // Properties over time
        this.renderChart('doors-chart', {
            labels: rows.map(r => `Year ${r.year}`),
            datasets: [
                {
                    label: 'Properties Owned',
                    data: rows.map(r => r.doors),
                    color: '#FFD300',
                    type: 'bar'
                }
            ]
        }, 'bar');

        // DSCR trend
        this.renderChart('dscr-chart', {
            labels: rows.map(r => `Year ${r.year}`),
            datasets: [
                {
                    label: 'DSCR',
                    data: rows.map(r => r.dscr),
                    color: '#FFD300',
                    type: 'line'
                },
                {
                    label: 'Target DSCR',
                    data: rows.map(r => 1.20), // Default target
                    color: '#333',
                    type: 'line',
                    dashed: true
                }
            ]
        }, 'line');
    }

    renderChart(canvasId, data, chartType) {
        console.log(`Rendering chart ${canvasId} with type ${chartType}:`, data);
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas element ${canvasId} not found`);
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error(`Could not get 2D context for canvas ${canvasId}`);
            return;
        }

        const rect = canvas.getBoundingClientRect();
        console.log(`Canvas ${canvasId} dimensions:`, { width: rect.width, height: rect.height });

        // Store chart data for resizing
        this.charts[canvasId] = { data, type: chartType };

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!data.datasets || data.datasets.length === 0) return;

        const padding = 60;
        const innerWidth = rect.width - padding * 2;
        const innerHeight = rect.height - padding * 2;

        // Calculate scales
        const allValues = data.datasets.flatMap(ds => ds.data);
        const minValue = Math.min(...allValues);
        const maxValue = Math.max(...allValues);
        const valueRange = maxValue - minValue || 1;

        // Draw axes
        ctx.strokeStyle = '#EDEDED';
        ctx.lineWidth = 1;

        // X-axis
        ctx.beginPath();
        ctx.moveTo(padding, rect.height - padding);
        ctx.lineTo(rect.width - padding, rect.height - padding);
        ctx.stroke();

        // Y-axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, rect.height - padding);
        ctx.stroke();

        // Grid lines and labels
        this.drawGridAndLabels(ctx, data, rect, padding, minValue, maxValue, valueRange, innerWidth, innerHeight);

        // Draw datasets
        data.datasets.forEach((dataset, datasetIndex) => {
            this.drawDataset(ctx, dataset, data.labels, rect, padding, minValue, valueRange, innerWidth, innerHeight, chartType, datasetIndex);
        });

        // Draw legend
        this.drawLegend(ctx, data.datasets, rect, padding);
    }

    drawGridAndLabels(ctx, data, rect, padding, minValue, maxValue, valueRange, innerWidth, innerHeight) {
        const numLabels = 5;
        ctx.fillStyle = '#666';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';

        // Y-axis labels
        for (let i = 0; i <= numLabels; i++) {
            const value = minValue + (valueRange * i / numLabels);
            const y = rect.height - padding - (i / numLabels * innerHeight);

            // Grid line
            ctx.strokeStyle = '#F5F5F5';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(rect.width - padding, y);
            ctx.stroke();

            // Label
            ctx.fillStyle = '#666';
            ctx.textAlign = 'right';
            const displayValue = value >= 1000 ? `$${(value / 1000).toFixed(0)}k` :
                               value >= 100 ? `$${value.toFixed(0)}` : value.toFixed(1);
            ctx.fillText(displayValue, padding - 10, y + 4);
        }

        // X-axis labels
        const labelStep = Math.max(1, Math.floor(data.labels.length / 8));
        ctx.textAlign = 'center';
        for (let i = 0; i < data.labels.length; i += labelStep) {
            const x = padding + (i / (data.labels.length - 1) * innerWidth);
            ctx.fillText(data.labels[i], x, rect.height - padding + 20);
        }
    }

    drawDataset(ctx, dataset, labels, rect, padding, minValue, valueRange, innerWidth, innerHeight, chartType, datasetIndex) {
        const points = dataset.data.map((value, index) => {
            const x = padding + (index / (labels.length - 1) * innerWidth);
            const y = rect.height - padding - ((value - minValue) / valueRange * innerHeight);
            return { x, y, value };
        });

        ctx.strokeStyle = dataset.color;
        ctx.lineWidth = 2;

        if (chartType === 'area' || chartType === 'line') {
            // Fill area for area charts
            if (chartType === 'area') {
                ctx.fillStyle = this.hexToRgba(dataset.color, 0.3);
                ctx.beginPath();
                ctx.moveTo(points[0].x, rect.height - padding);
                points.forEach(point => ctx.lineTo(point.x, point.y));
                ctx.lineTo(points[points.length - 1].x, rect.height - padding);
                ctx.closePath();
                ctx.fill();
            }

            // Draw line
            ctx.strokeStyle = dataset.color;
            ctx.setLineDash(dataset.dashed ? [5, 5] : []);
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach(point => ctx.lineTo(point.x, point.y));
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw points
            points.forEach(point => {
                ctx.fillStyle = dataset.color;
                ctx.beginPath();
                ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
                ctx.fill();

                // White border
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.lineWidth = 2;
            });
        } else if (chartType === 'bar') {
            const barWidth = innerWidth / points.length * 0.8;
            points.forEach((point, index) => {
                const x = padding + (index / points.length * innerWidth) - barWidth / 2;
                const barHeight = (point.value - minValue) / valueRange * innerHeight;

                ctx.fillStyle = dataset.color;
                ctx.fillRect(x, point.y, barWidth, rect.height - padding - point.y);

                // Bar border
                ctx.strokeStyle = this.darkenColor(dataset.color, 0.2);
                ctx.lineWidth = 1;
                ctx.strokeRect(x, point.y, barWidth, rect.height - padding - point.y);
            });
        }
    }

    drawLegend(ctx, datasets, rect, padding) {
        const legendY = padding - 20;
        let legendX = padding;

        ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'left';

        datasets.forEach((dataset, index) => {
            // Legend color box
            ctx.fillStyle = dataset.color;
            ctx.fillRect(legendX, legendY - 10, 12, 12);

            // Legend border
            ctx.strokeStyle = this.darkenColor(dataset.color, 0.2);
            ctx.lineWidth = 1;
            ctx.strokeRect(legendX, legendY - 10, 12, 12);

            // Legend text
            ctx.fillStyle = '#333';
            ctx.fillText(dataset.label, legendX + 18, legendY);

            legendX += 120; // Space between legend items
        });
    }

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    darkenColor(hex, percent) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        const darken = (val) => Math.max(0, Math.floor(val * (1 - percent)));
        return `rgb(${darken(r)}, ${darken(g)}, ${darken(b)})`;
    }

    exportChartAsImage(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        return canvas.toDataURL('image/png');
    }

    // Utility: Format number for display
    formatNumber(num) {
        if (num >= 1000000) {
            return `$${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `$${(num / 1000).toFixed(1)}k`;
        }
        return `$${num.toFixed(0)}`;
    }
}

// Initialize chart manager
const chartManager = new ChartManager();

// Default example data for initial chart display
const exampleData = {
    rows: [
        { year: 0, age: 35, doors: 1, monthlyCashFlow: 1200, equity: 75000, loanBalance: 225000, portfolioValue: 300000, dscr: 1.25 },
        { year: 2, age: 37, doors: 2, monthlyCashFlow: 2100, equity: 145000, loanBalance: 400000, portfolioValue: 565000, dscr: 1.35 },
        { year: 5, age: 40, doors: 3, monthlyCashFlow: 3200, equity: 250000, loanBalance: 550000, portfolioValue: 800000, dscr: 1.28 },
        { year: 8, age: 43, doors: 4, monthlyCashFlow: 4300, equity: 380000, loanBalance: 620000, portfolioValue: 1050000, dscr: 1.22 },
        { year: 12, age: 47, doors: 6, monthlyCashFlow: 5800, equity: 550000, loanBalance: 850000, portfolioValue: 1400000, dscr: 1.18 },
        { year: 15, age: 50, doors: 8, monthlyCashFlow: 7300, equity: 750000, loanBalance: 950000, portfolioValue: 1750000, dscr: 1.25 },
        { year: 18, age: 53, doors: 10, monthlyCashFlow: 8900, equity: 980000, loanBalance: 1050000, portfolioValue: 2100000, dscr: 1.32 }
    ],
    kpis: {
        targetIncome: 8000,
        irr: 12.5,
        npv: 450000
    }
};

// Export functions
export function initCharts() {
    console.log('Initializing charts...');
    chartManager.initCharts();

    // Show example charts with default data
    setTimeout(() => {
        console.log('Showing initial example charts...');
        updateCharts(exampleData.rows, exampleData.kpis);
    }, 100); // Small delay to ensure DOM is ready
}

export function updateCharts(rows, kpis) {
    console.log('updateCharts called with:', { rowsLength: rows?.length, kpis });
    if (!rows || rows.length === 0) {
        console.warn('No rows data provided to updateCharts');
        return;
    }
    chartManager.updateCharts(rows, kpis);
}

export function exportChartAsImage(canvasId) {
    return chartManager.exportChartAsImage(canvasId);
}

// Make available globally
window.updateCharts = updateCharts;
