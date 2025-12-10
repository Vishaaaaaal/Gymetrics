/**
 * Gymetrics Dynamic Pricing Calculator
 * Features tier-based pricing, monthly/yearly billing, and coupon discounts
 */

// Feature definitions with BASE costs
const FEATURES = {
    adminApp: {
        name: 'Admin App',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>`,
        description: 'Gym management dashboard',
        multipliesWithUsers: false,
        features: [
            { id: 'member-management', name: 'Basic Member Management', type: 'Standard', status: 'Done', basePrice: 300 },
            { id: 'push-notifications', name: 'Push Notifications', type: 'Standard', status: 'Done', basePrice: 100 },
            { id: 'occupancy-tracking', name: 'Occupancy Tracking', type: 'MVP', status: 'Done', basePrice: 500, aiTag: true },
            { id: 'membership-hold', name: 'Membership Hold-on Feature', type: 'MVP', status: 'Done', basePrice: 50 },
            { id: 'usage-heatmaps', name: 'Usage Heatmaps', type: 'MVP', status: 'Coming', basePrice: 300 },
            { id: 'payments-analytics', name: 'Payments Analytics', type: 'Add-on', status: 'Coming', basePrice: 200 },
            { id: 'attendance-tracking', name: 'Attendance Tracking', type: 'Add-on', status: 'Coming', basePrice: 0 },
            { id: 'facial-attendance', name: 'Facial Attendance Systems', type: 'On-Demand', status: 'Coming', basePrice: 750 },
            { id: 'equipment-tracking', name: 'Equipment Tracking', type: 'On-Demand', status: 'Coming', basePrice: 750 },
            { id: 'equipment-usage', name: 'Equipment Usage Analytics', type: 'On-Demand', status: 'Coming', basePrice: 750 }
        ]
    },
    userApp: {
        name: 'User App',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>`,
        description: 'Member mobile experience',
        multipliesWithUsers: true,
        features: [
            { id: 'membership-tracking', name: 'Membership Tracking', type: 'Standard', status: 'Done', basePrice: 1.00 },
            { id: 'membership-hold-expiry', name: 'Membership Hold-on Expiry', type: 'Standard', status: 'Done', basePrice: 0.50 },
            { id: 'gym-occupancy', name: 'Gym Occupancy', type: 'MVP', status: 'Done', basePrice: 5.00, aiTag: true },
            { id: 'workout-scheduling', name: 'Workout Scheduling & Logging', type: 'Add-on', status: 'Coming', basePrice: 1.00 },
            { id: 'workout-tracking', name: 'Workout Tracking', type: 'Add-on', status: 'Coming', basePrice: 1.50 },
            { id: 'ai-workout', name: 'AI Workout Generator', type: 'Add-on', status: 'Coming', basePrice: 3.50 },
            { id: 'nutrition-services', name: 'Nutrition Services', type: 'On-Demand', status: 'Coming', basePrice: 0 },
            { id: 'in-app-payments', name: 'In-App Payments & Billings', type: 'On-Demand', status: 'Coming', basePrice: 0 }
        ]
    }
};

// Plan configuration with tier multipliers
const PLAN_RANGES = [
    { name: 'small', min: 0, max: 50, label: 'Small Gym', multiplier: 1.0 },
    { name: 'growing', min: 50, max: 150, label: 'Growing Gym', multiplier: 1.2 },
    { name: 'big', min: 150, max: 250, label: 'Big Gym', multiplier: 1.5 },
    { name: 'large', min: 250, max: Infinity, label: 'Large Gym', multiplier: 2.25 }
];

// State
const state = {
    memberCount: 100,
    activePlan: 'growing',
    isYearly: false,
    yearlyDiscount: 0.25,
    couponApplied: false,
    couponDiscount: 0.25,
    userAppEnabled: false,
    adminAppEnabled: false,
    prices: {
        small: { monthly: 0, yearly: 0 },
        growing: { monthly: 0, yearly: 0 },
        big: { monthly: 0, yearly: 0 },
        large: { monthly: 0, yearly: 0 }
    }
};

// DOM elements
const elements = {
    memberCount: document.getElementById('memberCount'),
    recommendedPlan: document.getElementById('recommendedPlan'),
    rangeMarker: document.getElementById('rangeMarker'),
    billingToggle: document.getElementById('billingToggle'),
    billingToggleSecondary: document.getElementById('billingToggleSecondary'),
    couponInput: document.getElementById('couponInput'),
    couponApplyBtn: document.getElementById('applyCoupon'),
    couponMessage: document.getElementById('couponMessage'),
    toast: document.getElementById('toast'),
    discountToggle: document.getElementById('discountToggle'),
    couponDrawer: document.getElementById('couponDrawer'),
    couponClose: document.getElementById('couponClose'),
    summary: document.getElementById('billingSummary'),
    summaryPlanName: document.getElementById('summaryPlanName'),
    summaryMode: document.getElementById('summaryMode'),
    summaryBase: document.getElementById('summaryBase'),
    summaryDiscount: document.getElementById('summaryDiscount'),
    summaryTotal: document.getElementById('summaryTotal'),
    summaryTotalPeriod: document.getElementById('summaryTotalPeriod'),
    summaryCTA: document.getElementById('summaryCTA'),
    summaryPerMonth: document.getElementById('summaryPerMonth'),
    summaryPerYear: document.getElementById('summaryPerYear'),
    summarySavings: document.getElementById('summarySavings'),
    summaryRowStandard: document.getElementById('summaryRowStandard'),
    summaryRowYearlyDiscount: document.getElementById('summaryRowYearlyDiscount'),
    summaryRowCoupon: document.getElementById('summaryRowCoupon'),
    summaryRowTotal: document.getElementById('summaryRowTotal'),
    summaryRowPerMonth: document.getElementById('summaryRowPerMonth'),
    summaryRowPerYear: document.getElementById('summaryRowPerYear'),
    summaryRowSavings: document.getElementById('summaryRowSavings'),
    summaryCoupon: document.getElementById('summaryCoupon'),
    summaryCouponLabel: document.getElementById('summaryCouponLabel'),
    summaryTotalLabel: document.getElementById('summaryTotalLabel'),
    summaryPerYearLabel: document.getElementById('summaryPerYearLabel'),
    summarySavingsLabel: document.getElementById('summarySavingsLabel'),
    modal: document.getElementById('contactModal'),
    modalClose: document.getElementById('modalClose'),
    modalForm: document.getElementById('contactForm'),
    modalPlanMeta: document.getElementById('modalPlanMeta'),
    modalName: document.getElementById('modalName'),
    modalEmail: document.getElementById('modalEmail'),
    modalPhone: document.getElementById('modalPhone'),
    modalCity: document.getElementById('modalCity')
};

function init() {
    renderFeatures();
    setupEventListeners();
    updatePlanSelection(state.memberCount);
    updatePriceBreakdownDisplay();
    toggleCouponDrawer(false); // ensure drawer starts closed
}

function formatPrice(value) {
    return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function renderFeatures() {
    const container = document.getElementById('featureCategories');
    const plans = ['small', 'growing', 'big', 'large'];

    Object.keys(FEATURES).forEach(categoryKey => {
        const category = FEATURES[categoryKey];
        const categoryClass = categoryKey === 'adminApp' ? 'admin-icon' : 'user-icon';
        const isEnabled = categoryKey === 'userApp' ? state.userAppEnabled : categoryKey === 'adminApp' ? state.adminAppEnabled : true;

        // Add toggle for User App
        let toggleHTML = '';
        if (categoryKey === 'userApp') {
            toggleHTML = `
                <div class="category-toggle" onclick="event.stopPropagation()">
                    <label class="switch">
                        <input type="checkbox" id="userAppToggle" ${isEnabled ? 'checked' : ''} onchange="toggleUserApp(this)">
                        <span class="slider round"></span>
                    </label>
                    <span class="toggle-label">Add User-based App</span>
                </div>
            `;
        }

        if (categoryKey === 'adminApp') {
            toggleHTML = `
                <div class="category-toggle" onclick="event.stopPropagation()">
                    <label class="switch">
                        <input type="checkbox" id="adminAppToggle" ${isEnabled ? 'checked' : ''} onchange="toggleAdminApp(this)">
                        <span class="slider round"></span>
                    </label>
                    <span class="toggle-label">Add Admin App</span>
                </div>
            `;
        }

        const categoryHTML = `
            <div class="feature-category ${isEnabled ? '' : 'is-disabled'}" id="category-${categoryKey}">
                <div class="category-header ${isEnabled ? '' : 'collapsed'}" onclick="toggleCategory(this)">
                    <div class="header-left">
                        <span class="category-icon ${categoryClass}">${category.icon}</span>
                        <h4>${category.name}</h4>
                        ${toggleHTML}
                    </div>
                    <span class="expand-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6,9 12,15 18,9"></polyline>
                        </svg>
                    </span>
                </div>
                <div class="category-content ${isEnabled ? 'expanded' : 'disabled-category'}">
                    ${category.features.map(feature => {
            const isComingSoon = feature.status === 'Coming';
            const isStandard = feature.type === 'Standard';
            const rowClass = isComingSoon ? 'feature-row coming-soon' : 'feature-row';

            return `
                        <div class="${rowClass}" data-feature="${feature.id}">
                            <div class="feature-info">
                                <label class="feature-name">
                                    ${feature.name}
                                    ${feature.aiTag ? `<span class="badge-ai">
                                        <svg class="ai-sparkle" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M12 2l1.2 4.8L18 8l-4.8 1.2L12 14l-1.2-4.8L6 8l4.8-1.2L12 2zM5 12.5l0.8 3.2L9 16.5l-3.2 0.8L5 20.5l-0.8-3.2L1 16.5l3.2-0.8L5 12.5zm14 0l0.8 3.2L23 16.5l-3.2 0.8L19 20.5l-0.8-3.2L15 16.5l3.2-0.8L19 12.5z"/>
                                        </svg>
                                        AI
                                    </span>` : ''}
                                    ${isComingSoon ? '<span class="badge-coming">Coming Soon</span>' : ''}
                                    ${isStandard ? '<span class="badge-standard">Standard</span>' : ''}
                                </label>
                            </div>
                            <div class="plan-cells">
                                ${plans.map(plan => `
                                    <div class="plan-cell" data-plan="${plan}">
                                        <label class="custom-checkbox ${isComingSoon ? 'disabled' : ''} ${isStandard ? 'locked' : ''}">
                                            <input type="checkbox" 
                                                data-feature="${feature.id}" 
                                                data-plan="${plan}" 
                                                data-base-price="${feature.basePrice}"
                                                data-multiplies="${category.multipliesWithUsers}"
                                                data-category="${categoryKey}"
                                                data-standard="${isStandard}"
                                                ${isStandard ? 'checked disabled' : ''}
                                                ${isComingSoon ? 'disabled' : ''}>
                                            <span class="checkmark"></span>
                                        </label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `}).join('')}
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', categoryHTML);
    });
}

function toggleUserApp(checkbox) {
    state.userAppEnabled = checkbox.checked;
    setCategoryState('userApp', state.userAppEnabled);
    enforceStandardFeatures('userApp', state.userAppEnabled);
    showToast(state.userAppEnabled ? 'User app added' : 'User app removed');
    calculateAllPrices();
}

function toggleAdminApp(checkbox) {
    state.adminAppEnabled = checkbox.checked;
    setCategoryState('adminApp', state.adminAppEnabled);
    enforceStandardFeatures('adminApp', state.adminAppEnabled);
    showToast(state.adminAppEnabled ? 'Admin app added' : 'Admin app removed');
    calculateAllPrices();
}

function setCategoryState(categoryKey, enabled) {
    const categoryEl = document.getElementById(`category-${categoryKey}`);
    if (!categoryEl) return;

    const content = categoryEl.querySelector('.category-content');
    const header = categoryEl.querySelector('.category-header');
    const toggleInput = categoryEl.querySelector('input[type="checkbox"]');

    if (toggleInput) {
        toggleInput.checked = enabled;
    }

    if (enabled) {
        content.classList.remove('disabled-category');
        content.classList.add('expanded');
        header.classList.remove('collapsed');
        categoryEl.classList.remove('is-disabled');
        enforceStandardFeatures(categoryKey, true);
    } else {
        content.classList.remove('expanded');
        content.classList.add('disabled-category');
        header.classList.add('collapsed');
        categoryEl.classList.add('is-disabled');
        enforceStandardFeatures(categoryKey, false);
    }
}

function enforceStandardFeatures(categoryKey, enabled) {
    const checkboxes = document.querySelectorAll(`input[type="checkbox"][data-category="${categoryKey}"][data-standard="true"]`);
    checkboxes.forEach(cb => {
        cb.disabled = true; // keep locked
        cb.checked = enabled; // on when category enabled, off when disabled
    });
}

function setupEventListeners() {
    elements.memberCount.addEventListener('input', (e) => {
        const count = parseInt(e.target.value) || 0;
        updatePlanSelection(count);
    });

    if (elements.billingToggle) {
        elements.billingToggle.addEventListener('change', (e) => setBilling(e.target.checked));
    }

    if (elements.billingToggleSecondary) {
        elements.billingToggleSecondary.addEventListener('change', (e) => setBilling(e.target.checked));
    }

    syncBillingToggles(elements.billingToggle?.checked || false);

    if (elements.couponApplyBtn) {
        elements.couponApplyBtn.addEventListener('click', applyCoupon);
    }

    if (elements.discountToggle) {
        elements.discountToggle.addEventListener('click', () => toggleCouponDrawer());
    }

    if (elements.couponClose) {
        elements.couponClose.addEventListener('click', () => toggleCouponDrawer(false));
    }

    if (elements.summaryCTA) {
        elements.summaryCTA.addEventListener('click', openContactModal);
    }

    if (elements.modalClose) {
        elements.modalClose.addEventListener('click', closeContactModal);
    }

    if (elements.modal) {
        elements.modal.addEventListener('click', (e) => {
            if (e.target === elements.modal) {
                closeContactModal();
            }
        });
    }

    if (elements.modalForm) {
        elements.modalForm.addEventListener('submit', handleContactSubmit);
    }

    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox' && e.target.dataset.plan) {
            handleCheckboxChange(e.target);
        }
    });

    updateToggleLabels();
}

function setBilling(isYearly) {
    state.isYearly = isYearly;
    syncBillingToggles(state.isYearly);
    updateToggleLabels();
    updatePriceBreakdownDisplay();
    calculateAllPrices();
    showToast(state.isYearly ? 'Switched to yearly billing (25% off!)' : 'Switched to monthly billing');
}

function updatePriceBreakdownDisplay() {
    const plans = ['small', 'growing', 'big', 'large'];

    plans.forEach(plan => {
        const header = document.querySelector(`.plan-header[data-plan="${plan}"]`);
        if (!header) return;

        const priceBreakdown = header.querySelector('.price-breakdown');
        if (!priceBreakdown) return;

        const priceRows = priceBreakdown.querySelectorAll('.price-row');
        const monthlyRow = priceRows[0];
        const yearlyRow = priceRows[1];
        const yearlyPerMonthRow = priceRows[2];

        if (state.isYearly) {
            monthlyRow.classList.add('strikethrough');
            yearlyRow.classList.add('yearly-selected');
            yearlyPerMonthRow.classList.add('yearly-selected');
            yearlyPerMonthRow.style.display = 'flex';
        } else {
            monthlyRow.classList.remove('strikethrough');
            yearlyRow.classList.remove('yearly-selected');
            yearlyPerMonthRow.classList.remove('yearly-selected');
            yearlyPerMonthRow.style.display = 'none';
        }
    });
}

function updateToggleLabels() {
    const labels = document.querySelectorAll('.toggle-label');
    labels.forEach(label => {
        const billingType = label.dataset.billing;
        if ((billingType === 'yearly' && state.isYearly) ||
            (billingType === 'monthly' && !state.isYearly)) {
            label.classList.add('active');
        } else {
            label.classList.remove('active');
        }
    });
}

function applyCoupon() {
    const couponCode = elements.couponInput.value.trim().toUpperCase();

    if (state.couponApplied) {
        state.couponApplied = false;
        elements.couponMessage.textContent = 'Offer removed';
        elements.couponMessage.className = 'coupon-message info';
        elements.couponApplyBtn.textContent = 'Apply';
        elements.couponInput.disabled = false;
        elements.couponInput.value = '';
        calculateAllPrices();
        showToast('Offer removed');
        return;
    }

    // Match EARLY## between 10 and 30
    const match = couponCode.match(/^EARLY(\d{2})$/);
    if (!match) {
        elements.couponMessage.textContent = 'Invalid code.';
        elements.couponMessage.className = 'coupon-message error';
        return;
    }

    const percent = parseInt(match[1], 10);
    if (percent < 10 || percent > 30) {
        elements.couponMessage.textContent = 'Invalid code.';
        elements.couponMessage.className = 'coupon-message error';
        return;
    }

    state.couponApplied = true;
    state.couponDiscount = percent / 100;
    elements.couponMessage.textContent = `✓ Launch offer applied: ${percent}% off your totals`;
    elements.couponMessage.className = 'coupon-message success';
    elements.couponApplyBtn.textContent = 'Remove';
    elements.couponInput.disabled = true;
    calculateAllPrices();
    showToast(`🎉 ${percent}% launch offer applied`);
}

function toggleCouponDrawer(forceOpen) {
    const drawer = elements.couponDrawer;
    const toggle = elements.discountToggle;
    if (!drawer || !toggle) return;

    const shouldOpen = forceOpen !== undefined ? forceOpen : !drawer.classList.contains('open');

    drawer.classList.toggle('open', shouldOpen);
    drawer.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
    toggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
}

function getPlanLabel(planName) {
    const labels = {
        small: 'Starter Gym',
        growing: 'Growing Gym',
        big: 'Professional Gym',
        large: 'Enterprise / Multi-facility Gym'
    };
    return labels[planName] || 'Gym Plan';
}

function syncBillingToggles(isYearlyChecked) {
    if (elements.billingToggle && elements.billingToggle.checked !== isYearlyChecked) {
        elements.billingToggle.checked = isYearlyChecked;
    }
    if (elements.billingToggleSecondary && elements.billingToggleSecondary.checked !== isYearlyChecked) {
        elements.billingToggleSecondary.checked = isYearlyChecked;
    }
}

function updatePlanSelection(memberCount) {
    state.memberCount = memberCount;
    const activePlan = PLAN_RANGES.find(p => memberCount >= p.min && memberCount < p.max) || PLAN_RANGES[3];
    state.activePlan = activePlan.name;
    if (elements.recommendedPlan) {
        elements.recommendedPlan.textContent = activePlan.label;
    }
    updateRangeMarker(memberCount);
    updatePlanStates();
    calculateAllPrices();
}

function updateRangeMarker(count) {
    const maxDisplay = 500;
    const clampedCount = Math.min(count, maxDisplay);
    const percentage = (clampedCount / maxDisplay) * 100;
    elements.rangeMarker.style.left = `${percentage}%`;

    document.querySelectorAll('.range-segment').forEach(segment => {
        segment.classList.remove('active');
    });
    const activeSegment = document.querySelector(`.range-segment[data-plan="${state.activePlan}"]`);
    if (activeSegment) activeSegment.classList.add('active');
}

function updatePlanStates() {
    const plans = ['small', 'growing', 'big', 'large'];

    plans.forEach(plan => {
        const isActive = plan === state.activePlan;

        const header = document.querySelector(`.plan-header[data-plan="${plan}"]`);
        if (header) {
            if (isActive) {
                header.classList.add('active');
                header.classList.remove('disabled');
                const btn = header.querySelector('.cta-btn');
                if (btn) {
                    btn.classList.remove('secondary');
                    btn.classList.add('primary');
                }
            } else {
                header.classList.remove('active');
                header.classList.add('disabled');
                const btn = header.querySelector('.cta-btn');
                if (btn) {
                    btn.classList.remove('primary');
                    btn.classList.add('secondary');
                }
            }
        }

        const cells = document.querySelectorAll(`.plan-cell[data-plan="${plan}"]`);
        cells.forEach(cell => {
            const checkbox = cell.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.disabled = !isActive;
                if (!isActive) {
                    checkbox.checked = false;
                }
            }
            cell.classList.toggle('disabled', !isActive);
        });

        const summaryItem = document.querySelector(`.summary-item[data-plan="${plan}"]`);
        if (summaryItem) {
            summaryItem.classList.toggle('active', isActive);
            summaryItem.classList.toggle('disabled', !isActive);
        }
    });
}

function handleCheckboxChange(checkbox) {
    const plan = checkbox.dataset.plan;
    if (checkbox.dataset.standard === 'true') {
        checkbox.checked = true; // lock standard features when category is enabled
        return;
    }

    if (plan !== state.activePlan) {
        checkbox.checked = false;
        return;
    }

    calculateAllPrices();
    showToast(checkbox.checked ? 'Feature added!' : 'Feature removed');
}

function calculateFeaturePrice(basePrice, plan, multipliesWithUsers) {
    const planData = PLAN_RANGES.find(p => p.name === plan);
    const tierMultiplier = planData.multiplier;

    let price = basePrice * tierMultiplier;

    if (multipliesWithUsers) {
        price *= state.memberCount;
    }

    return price;
}

function calculateAllPrices() {
    const plans = ['small', 'growing', 'big', 'large'];

    plans.forEach(plan => {
        let monthlyTotal = 0;

        // Get all checked checkboxes for this plan
        const checkboxes = document.querySelectorAll(`input[type="checkbox"][data-plan="${plan}"]:checked`);

        checkboxes.forEach(checkbox => {
            // Check if this feature belongs to User App and if User App is disabled
            const category = checkbox.dataset.category;
            if ((category === 'userApp' && !state.userAppEnabled) || (category === 'adminApp' && !state.adminAppEnabled)) {
                return; // Skip this feature
            }

            const basePrice = parseFloat(checkbox.dataset.basePrice) || 0;
            const multipliesWithUsers = checkbox.dataset.multiplies === 'true';

            const featurePrice = calculateFeaturePrice(basePrice, plan, multipliesWithUsers);
            monthlyTotal += featurePrice;
        });

        // Store original monthly total before coupon
        const originalMonthlyTotal = monthlyTotal;
        const baseYearlyTotal = originalMonthlyTotal * 12;

        // Apply coupon discount if active
        const monthlyAfterCoupon = state.couponApplied ? monthlyTotal * (1 - state.couponDiscount) : monthlyTotal;

        // Calculate yearly price based on current billing selection
        const yearlyBeforeYearlyDiscount = monthlyAfterCoupon * 12;
        const yearlyAfterYearlyDiscount = state.isYearly
            ? yearlyBeforeYearlyDiscount * (1 - state.yearlyDiscount)
            : yearlyBeforeYearlyDiscount;

        const finalYearly = yearlyAfterYearlyDiscount;
        const yearlyBillingDiscountAmount = state.isYearly ? Math.max(0, baseYearlyTotal - (originalMonthlyTotal * 12 * (1 - state.yearlyDiscount))) : 0;
        const couponDiscountAmount = state.couponApplied ? Math.max(0, (baseYearlyTotal - yearlyBillingDiscountAmount) - finalYearly) : 0;

        state.prices[plan] = {
            monthly: Math.round(monthlyAfterCoupon),
            yearly: Math.round(finalYearly),
            originalMonthly: Math.round(originalMonthlyTotal),
            originalYearly: Math.round(baseYearlyTotal),
            yearlyAfterYearlyDiscount: Math.round(state.isYearly ? baseYearlyTotal * (1 - state.yearlyDiscount) : baseYearlyTotal),
            couponDiscountAmount: Math.round(couponDiscountAmount)
        };
    });

    updatePriceDisplays();
}

function updatePriceDisplays() {
    const plans = ['small', 'growing', 'big', 'large'];

    plans.forEach(plan => {
        const prices = state.prices[plan];
        const monthlyPrice = prices.monthly;
        const yearlyPrice = prices.yearly;
        const yearlyPerMonth = Math.round(yearlyPrice / 12);

        const originalMonthly = prices.originalMonthly;
        const originalYearly = prices.originalYearly;
        const originalYearlyPerMonth = Math.round(originalYearly / 12);

        // Helper to update element content and handle static currency symbol
        const updateElement = (element, value, original) => {
            if (!element) return;

            // Find and handle static currency symbol in previous sibling text node
            const parent = element.parentElement;
            if (parent && parent.classList.contains('price-value')) {
                Array.from(parent.childNodes).forEach(node => {
                    if (node.nodeType === 3 && node.textContent.includes('₹')) {
                        if (state.couponApplied && value < original) {
                            node.textContent = node.textContent.replace('₹', '');
                        } else if (!node.textContent.includes('₹')) {
                            node.textContent = '₹' + node.textContent;
                        }
                    }
                });
            }

            if (state.couponApplied && value < original) {
                element.innerHTML = `<span class="original-price-strike">₹${original.toLocaleString('en-IN')}</span> ₹${value.toLocaleString('en-IN')}`;
            } else {
                element.textContent = value.toLocaleString('en-IN');
            }
        };

        // Update header prices
        const priceMonthly = document.getElementById(`price-${plan}-monthly`);
        const priceYearly = document.getElementById(`price-${plan}-yearly`);
        const priceYearlyPerMonth = document.getElementById(`price-${plan}-yearly-per-month`);

        if (priceMonthly) {
            if (state.isYearly) {
                priceMonthly.textContent = monthlyPrice.toLocaleString('en-IN');
            } else {
                updateElement(priceMonthly, monthlyPrice, originalMonthly);
            }
        }

        if (priceYearly) updateElement(priceYearly, yearlyPrice, originalYearly);
        if (priceYearlyPerMonth) updateElement(priceYearlyPerMonth, yearlyPerMonth, originalYearlyPerMonth);

        // Update summary
        const summaryMonthly = document.getElementById(`total-${plan}-monthly`);
        const summaryYearly = document.getElementById(`total-${plan}-yearly`);

        if (summaryMonthly) {
            if (state.isYearly) {
                // When yearly is selected, summary monthly should show the effective monthly cost (Yearly / 12)
                // This matches the "Yearly (per mo)" display in the main card
                updateElement(summaryMonthly, yearlyPerMonth, originalYearlyPerMonth);
            } else {
                updateElement(summaryMonthly, monthlyPrice, originalMonthly);
            }
        }

        if (summaryYearly) updateElement(summaryYearly, yearlyPrice, originalYearly);
    });

    updateBillingSummary();
}

function toggleCategory(header) {
    const content = header.nextElementSibling;
    if (content.classList.contains('disabled-category')) return;
    const isExpanded = content.classList.contains('expanded');

    if (isExpanded) {
        content.classList.remove('expanded');
        header.classList.add('collapsed');
    } else {
        content.classList.add('expanded');
        header.classList.remove('collapsed');
    }
}

function showToast(message) {
    const toastMessage = elements.toast.querySelector('.toast-message');
    toastMessage.textContent = message;
    elements.toast.classList.add('show');
    setTimeout(() => { elements.toast.classList.remove('show'); }, 2000);
}

function selectPlan(plan) {
    if (plan !== state.activePlan) {
        showToast('Please adjust member count to select this plan');
        return;
    }

    const planData = PLAN_RANGES.find(p => p.name === plan);
    showToast(`${planData.label} selected!`);
}

function updateBillingSummary() {
    if (!elements.summary) return;

    const planLabel = getPlanLabel(state.activePlan);
    const priceInfo = state.prices[state.activePlan];
    if (!priceInfo) return;

    const standardYearly = priceInfo.originalYearly; // no discounts
    const finalYearly = priceInfo.yearly; // fully discounted yearly
    const perMonth = Math.round(finalYearly / 12);
    const perYear = state.isYearly ? finalYearly : Math.round(priceInfo.monthly * 12);
    const totalSavingsYear = Math.max(0, standardYearly - finalYearly);
    const yearlyBillingDiscount = state.isYearly
        ? Math.max(0, priceInfo.originalYearly - priceInfo.yearlyAfterYearlyDiscount)
        : 0;
    const couponAmountYearly = priceInfo.couponDiscountAmount || 0;

    if (elements.summaryPlanName) elements.summaryPlanName.textContent = planLabel;
    if (elements.summaryMode) elements.summaryMode.textContent = state.isYearly ? 'Yearly billing' : 'Monthly billing';

    const showRow = (rowEl, show) => {
        if (!rowEl) return;
        rowEl.style.display = show ? 'flex' : 'none';
    };

    // Standard yearly price (struck through)
    if (elements.summaryBase) {
        elements.summaryBase.innerHTML = `<span class="original-price-strike">${formatPrice(standardYearly)}</span>`;
    }

    if (elements.summaryTotal) elements.summaryTotal.textContent = formatPrice(finalYearly);
    if (elements.summaryTotalPeriod) elements.summaryTotalPeriod.textContent = state.isYearly ? '/yr' : '/mo';

    if (elements.summaryPerMonth) elements.summaryPerMonth.textContent = `${formatPrice(perMonth)} /mo`;
    if (elements.summaryPerYear) elements.summaryPerYear.textContent = formatPrice(perYear);

    // Labels that change
    if (elements.summaryTotalLabel) elements.summaryTotalLabel.textContent = state.isYearly ? ' ' : 'Monthly price';
    if (elements.summaryPerYearLabel) elements.summaryPerYearLabel.textContent = state.isYearly ? ' ' : 'Equivalent yearly total';
    if (elements.summarySavingsLabel) elements.summarySavingsLabel.textContent = 'Total savings this year';

    // Yearly discount row
    if (elements.summaryDiscount) {
        elements.summaryDiscount.textContent = yearlyBillingDiscount > 0 ? `- ${formatPrice(yearlyBillingDiscount)}` : '—';
    }

    // Coupon row
    const couponCode = (elements.couponInput?.value || '').trim().toUpperCase();
    const couponLabelText = couponCode ? `Launch offer ${couponCode}` : 'Launch offer';
    if (elements.summaryCouponLabel) elements.summaryCouponLabel.textContent = couponLabelText;
    if (elements.summaryCoupon) elements.summaryCoupon.textContent = couponAmountYearly > 0 ? `- ${formatPrice(couponAmountYearly)}` : '—';

    if (elements.summarySavings) {
        elements.summarySavings.textContent = totalSavingsYear > 0 ? `- ${formatPrice(totalSavingsYear)}` : '—';
    }

    // Row visibility rules
    showRow(elements.summaryRowStandard, state.isYearly);
    showRow(elements.summaryRowYearlyDiscount, state.isYearly && yearlyBillingDiscount > 0);
    showRow(elements.summaryRowCoupon, state.couponApplied);
    showRow(elements.summaryRowTotal, false);
    showRow(elements.summaryRowPerMonth, true);
    // Only show "Equivalent yearly total" when in monthly billing
    showRow(elements.summaryRowPerYear, !state.isYearly);
    showRow(elements.summaryRowSavings, true);
}

function openContactModal() {
    if (!elements.modal) return;
    const planLabel = getPlanLabel(state.activePlan);
    const billing = state.isYearly ? 'Yearly billing' : 'Monthly billing';
    const total = state.isYearly ? state.prices[state.activePlan].yearly : state.prices[state.activePlan].monthly;
    if (elements.modalPlanMeta) {
        elements.modalPlanMeta.textContent = `${planLabel} · ${billing} · ${formatPrice(total)}`;
    }
    elements.modal.classList.remove('hidden');
    if (elements.modalName) elements.modalName.focus();
}

function closeContactModal() {
    if (!elements.modal) return;
    elements.modal.classList.add('hidden');
}

function handleContactSubmit(e) {
    e.preventDefault();
    const planLabel = getPlanLabel(state.activePlan);
    const billing = state.isYearly ? 'Yearly billing' : 'Monthly billing';
    const total = state.isYearly ? state.prices[state.activePlan].yearly : state.prices[state.activePlan].monthly;

    const name = elements.modalName?.value || '';
    const gym = elements.modalGym?.value || '';
    const email = elements.modalEmail?.value || '';
    const phone = elements.modalPhone?.value || '';
    const city = elements.modalCity?.value || '';

    const subject = encodeURIComponent(`Gymetrics ${planLabel} plan inquiry`);
    const body = encodeURIComponent(
        `Hi Gymetrics team,\n\nI'd like to discuss the ${planLabel} (${billing}).\nTotal: ${formatPrice(total)}\nMembers: ${state.memberCount}\n\nDetails:\nName: ${name}\nGym: ${gym}\nEmail: ${email}\nPhone: ${phone}\nCity: ${city}\n\nThanks!`
    );

    window.location.href = `mailto:vishalrajeevvr@gmail.com?subject=${subject}&body=${body}`;
    showToast('Launching your email app with the plan details');
    closeContactModal();
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);
