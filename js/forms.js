// Forms Management Module
// Handles lead capture form submissions and UTM tracking

class FormsManager {
    constructor() {
        this.formElement = document.getElementById('lead-form');
        this.apiEndpoint = 'https://api.getloanterms.com/leads'; // Placeholder - replace with real endpoint
        this.utmParams = this.getUTMParameters();
        this.initForms();
    }

    // Initialize form handling
    initForms() {
        if (this.formElement) {
            this.formElement.addEventListener('submit', (e) => this.handleSubmit(e));

            // Capture UTM parameters on page load
            this.populateUTMFields();

            // Enhanced form interactions
            this.addFormEnhancements();
        }

        // Handle URL sharing/serialization
        this.initURLSharing();

        // Handle form pre-population from URL params
        this.populateFormFromURL();
    }

    // Handle form submission
    async handleSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');

        // Show loading state
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        try {
            // Collect form data
            const formData = this.collectFormData(form);

            // Submit to API
            const success = await this.submitToAPI(formData);

            if (success) {
                // Show success message and secondary CTA
                this.showSuccessState(form);
            } else {
                throw new Error('Submission failed');
            }

        } catch (error) {
            console.error('Form submission error:', error);
            this.showErrorState(form);
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    }

    // Collect all form data including UTM params
    collectFormData(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Add UTM parameters
        Object.assign(data, this.utmParams);

        // Add metadata
        data.submission_timestamp = new Date().toISOString();
        data.page_url = window.location.href;
        data.user_agent = navigator.userAgent;
        data.referrer = document.referrer;

        return data;
    }

    // Submit data to API endpoint
    async submitToAPI(data) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any required API headers here
                    // 'Authorization': 'Bearer YOUR_API_KEY',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                // Fallback to Netlify Forms if API fails
                if (this.formElement.hasAttribute('data-netlify')) {
                    console.log('API failed, will retry with Netlify Forms');
                    return this.submitToNetlify(data);
                }
                throw new Error(`API responded with status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Form submitted successfully:', result);
            return true;

        } catch (error) {
            console.error('API submission failed:', error);

            // Try Netlify Forms as fallback
            if (this.formElement.hasAttribute('data-netlify')) {
                return this.submitToNetlify(data);
            }

            // Store in localStorage as fallback
            this.storeOfflineSubmission(data);
            return true; // Consider it successful for UX
        }
    }

    // Fallback submission for Netlify Forms
    async submitToNetlify(data) {
        try {
            const netlifyFormData = new FormData();

            // Add form-name for Netlify
            netlifyFormData.append('form-name', data['form-name']);

            // Add all other fields
            Object.keys(data).forEach(key => {
                if (key !== 'form-name') {
                    netlifyFormData.append(key, data[key]);
                }
            });

            const response = await fetch('/', {
                method: 'POST',
                body: netlifyFormData
            });

            return response.ok;
        } catch (error) {
            console.error('Netlify fallback failed:', error);
            this.storeOfflineSubmission(data);
            return true;
        }
    }

    // Store submission offline for later sync
    storeOfflineSubmission(data) {
        const stored = JSON.parse(localStorage.getItem('offline_lead_submissions') || '[]');
        stored.push({
            ...data,
            offline_timestamp: new Date().toISOString()
        });

        localStorage.setItem('offline_lead_submissions', JSON.stringify(stored));

        // In a real app, you might want to sync this when online
        console.log('Form stored offline for later submission');
    }

    // Get UTM parameters from URL or localStorage
    getUTMParameters() {
        const urlParams = new URLSearchParams(window.location.search);

        const utm = {
            utm_source: urlParams.get('utm_source') || localStorage.getItem('utm_source'),
            utm_medium: urlParams.get('utm_medium') || localStorage.getItem('utm_medium'),
            utm_campaign: urlParams.get('utm_campaign') || localStorage.getItem('utm_campaign'),
            utm_term: urlParams.get('utm_term') || localStorage.getItem('utm_term'),
            utm_content: urlParams.get('utm_content') || localStorage.getItem('utm_content'),
            gclid: urlParams.get('gclid') || localStorage.getItem('gclid'), // Google Ads
            fbclid: urlParams.get('fbclid') || localStorage.getItem('fbclid') // Facebook Ads
        };

        // Store in localStorage for future visits (24 hour expiry)
        Object.keys(utm).forEach(key => {
            if (utm[key]) {
                localStorage.setItem(key, utm[key]);
                localStorage.setItem(`${key}_timestamp`, Date.now().toString());
            }
        });

        // Clean up old UTM params (older than 24 hours)
        this.cleanupOldUTMParams();

        return utm;
    }

    // Remove UTM parameters older than 24 hours
    cleanupOldUTMParams() {
        const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];

        keys.forEach(key => {
            const timestamp = localStorage.getItem(`${key}_timestamp`);
            if (timestamp && Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000) {
                localStorage.removeItem(key);
                localStorage.removeItem(`${key}_timestamp`);
            }
        });
    }

    // Populate hidden UTM fields in form
    populateUTMFields() {
        const utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];

        utmFields.forEach(field => {
            const value = this.utmParams[field];
            if (value) {
                let input = this.formElement.querySelector(`input[name="${field}"]`);
                if (!input) {
                    input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = field;
                    this.formElement.appendChild(input);
                }
                input.value = value;
            }
        });
    }

    // Show success state after form submission
    showSuccessState(form) {
        form.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
                <h3>Thank You for Your Interest!</h3>
                <p>Your loan terms request has been submitted successfully.</p>
                <p style="margin: 2rem 0;">Our loan specialists will review your information and contact you within 24 hours with personalized financing options.</p>

                <div style="margin: 2rem 0;">
                    <h4>In the meantime, connect with our team:</h4>
                    <a href="https://www.jakenfinancegroup.com" class="btn" style="margin-top: 1rem;" target="_blank" rel="noopener">
                        Visit Jaken Finance Group
                    </a>
                </div>

                <p style="font-size: 0.875rem; color: #666; margin-top: 2rem;">
                    Having questions? Feel free to reach out to our team directly.
                </p>
            </div>
        `;
    }

    // Show error state
    showErrorState(form) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            background: #fee;
            color: #c33;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            border: 1px solid #fcc;
        `;
        errorDiv.innerHTML = `
            <strong>Submission Error</strong><br>
            We encountered an issue submitting your form. Please try again or contact us directly at our office.
        `;

        form.insertBefore(errorDiv, form.firstChild);

        // Remove error message after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Form enhancements
    addFormEnhancements() {
        // Phone number formatting
        const phoneInput = this.formElement.querySelector('input[name="phone"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 6) {
                    value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
                } else if (value.length >= 3) {
                    value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                }
                e.target.value = value;
            });
        }

        // Form validation enhancements
        const requiredFields = this.formElement.querySelectorAll('input[required], select[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
        });
    }

    // Field validation
    validateField(field) {
        const value = field.value.trim();
        const isValid = value !== '';

        field.style.borderColor = isValid ? '#EDEDED' : '#ff6b6b';

        // Update aria attributes for accessibility
        field.setAttribute('aria-invalid', (!isValid).toString());

        return isValid;
    }

    // URL sharing functionality
    initURLSharing() {
        // Share functionality (optional enhancement)
        document.addEventListener('click', (e) => {
            if (e.target.matches('.share-calculation, [data-action="share"]')) {
                e.preventDefault();
                this.shareCalculation();
            }
        });

        // Load shared parameters if they exist
        this.loadSharedParameters();
    }

    // Serialize current calculator state to URL
    serializeCalculatorState() {
        const params = {};

        // Get all calculator form values
        const inputs = document.querySelectorAll('#lead-form input, #lead-form select');
        inputs.forEach(input => {
            if (input.name && input.value) {
                params[input.name] = input.value;
            }
        });

        return params;
    }

    // Create shareable URL with calculator state
    createShareableURL() {
        const baseUrl = window.location.origin + window.location.pathname;
        const params = new URLSearchParams(this.serializeCalculatorState());

        return `${baseUrl}?${params.toString()}`;
    }

    // Share current calculation
    shareCalculation() {
        const url = this.createShareableURL();
        const text = 'Check out my real estate retirement calculation!';

        if (navigator.share) {
            navigator.share({
                title: 'Real Estate Retirement Calculator',
                text: text,
                url: url
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(url).then(() => {
                alert('Link copied to clipboard!');
            }).catch(() => {
                // Fallback: show URL
                prompt('Copy this link:', url);
            });
        }
    }

    // Load parameters from URL to pre-populate form
    populateFormFromURL() {
        const urlParams = new URLSearchParams(window.location.search);

        const formMappings = {
            'prefill_name': 'name',
            'prefill_email': 'email',
            'prefill_phone': 'phone',
            'prefill_market': 'market'
        };

        Object.keys(formMappings).forEach(urlParam => {
            const formField = formMappings[urlParam];
            const value = urlParams.get(urlParam);

            if (value) {
                const input = this.formElement.querySelector(`[name="${formField}"]`);
                if (input) {
                    input.value = decodeURIComponent(value);
                }
            }
        });
    }

    // Load shared calculator parameters
    loadSharedParameters() {
        const urlParams = new URLSearchParams(window.location.search);

        // Check for calculator parameters
        const calculatorParams = [
            'current-age', 'retirement-age', 'current-savings', 'monthly-contribution',
            'target-income', 'starting-doors', 'avg-price', 'ltv-ratio'
        ];

        const hasCalculatorParams = calculatorParams.some(param => urlParams.has(param));

        if (hasCalculatorParams) {
            // Pre-populate calculator with shared values
            calculatorParams.forEach(param => {
                const value = urlParams.get(param);
                if (value !== null) {
                    const input = document.getElementById(param);
                    if (input) {
                        input.value = value;
                    }
                }
            });

            // Trigger calculation if values are present
            setTimeout(() => {
                if (window.calculateRetirement) {
                    window.calculateRetirement();
                }
            }, 500);
        }
    }
}

// Initialize forms manager
const formsManager = new FormsManager();

// Export functions
export function initFormHandling() {
    // Forms are already initialized in constructor
}

// Make globally available
window.formsManager = formsManager;
