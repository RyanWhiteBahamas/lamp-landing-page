/**
 * LAMP Landing Page - Main JavaScript
 * Refactored for production with proper event delegation and accessibility
 */

(function() {
    'use strict';

    // ==========================================================================
    // DOM Elements
    // ==========================================================================

    const nav = document.querySelector('.nav');
    const navLinks = document.querySelector('.nav-links');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const modal = document.getElementById('modal');
    const modalPlanName = document.getElementById('modal-plan-name');
    const planSelect = document.getElementById('plan');
    const enrollmentForm = document.getElementById('enrollment-form');
    const planToggle = document.querySelector('.plan-toggle');
    const faqContent = document.querySelector('.faq-content');

    // Store focusable elements for focus trapping
    let focusableElements = [];
    let firstFocusable = null;
    let lastFocusable = null;

    // ==========================================================================
    // Navigation
    // ==========================================================================

    /**
     * Handle scroll effect on navigation
     */
    function handleNavScroll() {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    /**
     * Toggle mobile menu
     */
    function toggleMobileMenu() {
        const isOpen = navLinks.getAttribute('data-open') === 'true';
        navLinks.setAttribute('data-open', !isOpen);
        mobileMenuBtn.setAttribute('aria-expanded', !isOpen);

        if (!isOpen) {
            // Focus first link when opening
            const firstLink = navLinks.querySelector('a');
            if (firstLink) firstLink.focus();
        }
    }

    /**
     * Close mobile menu
     */
    function closeMobileMenu() {
        navLinks.setAttribute('data-open', 'false');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }

    // ==========================================================================
    // Plan Toggle
    // ==========================================================================

    /**
     * Show individual or family plans
     * @param {string} type - 'individual' or 'family'
     * @param {HTMLElement} clickedBtn - The button that was clicked
     */
    function showPlans(type, clickedBtn) {
        const toggleBtns = document.querySelectorAll('.toggle-btn');
        const individualPlans = document.getElementById('individual-plans');
        const familyPlans = document.getElementById('family-plans');

        // Update button states
        toggleBtns.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        clickedBtn.classList.add('active');
        clickedBtn.setAttribute('aria-pressed', 'true');

        // Show appropriate plans
        if (type === 'individual') {
            individualPlans.classList.add('active');
            familyPlans.classList.remove('active');
        } else {
            individualPlans.classList.remove('active');
            familyPlans.classList.add('active');
        }
    }

    // ==========================================================================
    // FAQ Accordion
    // ==========================================================================

    /**
     * Toggle FAQ item
     * @param {HTMLElement} button - The FAQ question button
     */
    function toggleFaq(button) {
        const faqItem = button.closest('.faq-item');
        const isExpanded = faqItem.getAttribute('data-expanded') === 'true';
        const answer = faqItem.querySelector('.faq-answer');
        const answerId = answer.id;

        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.setAttribute('data-expanded', 'false');
            const btn = item.querySelector('.faq-question');
            btn.setAttribute('aria-expanded', 'false');
        });

        // Open clicked item if it wasn't open
        if (!isExpanded) {
            faqItem.setAttribute('data-expanded', 'true');
            button.setAttribute('aria-expanded', 'true');
        }
    }

    // ==========================================================================
    // Modal
    // ==========================================================================

    /**
     * Open enrollment modal
     * @param {string} planName - Optional plan name to pre-select
     */
    function openModal(planName) {
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        if (planName) {
            planSelect.value = planName;
            modalPlanName.textContent = `Enrolling in ${planName}`;
        } else {
            planSelect.value = '';
            modalPlanName.textContent = 'Complete the form below to enroll';
        }

        // Setup focus trap
        setupFocusTrap();

        // Focus the close button
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
    }

    /**
     * Close enrollment modal
     */
    function closeModal() {
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        // Return focus to trigger element if stored
        const trigger = modal.getAttribute('data-trigger');
        if (trigger) {
            const triggerEl = document.querySelector(`[data-modal-trigger="${trigger}"]`);
            if (triggerEl) triggerEl.focus();
        }
    }

    /**
     * Setup focus trap for modal
     */
    function setupFocusTrap() {
        focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable = focusableElements[0];
        lastFocusable = focusableElements[focusableElements.length - 1];
    }

    /**
     * Handle focus trap in modal
     * @param {KeyboardEvent} e
     */
    function handleModalKeydown(e) {
        if (modal.getAttribute('aria-hidden') === 'true') return;

        if (e.key === 'Escape') {
            closeModal();
            return;
        }

        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    }

    // ==========================================================================
    // Form Handling
    // ==========================================================================

    /**
     * Handle form submission with Formspree
     * @param {Event} e - Submit event
     */
    async function handleFormSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]') ||
                          document.querySelector('.modal-footer .btn');
        const formData = new FormData(form);
        const statusEl = form.querySelector('.form-status') || createStatusElement(form);

        // Show loading state
        submitBtn.classList.add('btn--loading');
        submitBtn.disabled = true;
        statusEl.className = 'form-status';
        statusEl.style.display = 'none';

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Success
                statusEl.textContent = 'Thank you for your enrollment! We will contact you shortly.';
                statusEl.className = 'form-status success';
                form.reset();

                // Close modal after delay
                setTimeout(() => {
                    closeModal();
                    statusEl.style.display = 'none';
                }, 3000);
            } else {
                // Server error
                const data = await response.json();
                throw new Error(data.error || 'Submission failed. Please try again.');
            }
        } catch (error) {
            // Network or other error
            statusEl.textContent = error.message || 'Something went wrong. Please try again.';
            statusEl.className = 'form-status error';
        } finally {
            submitBtn.classList.remove('btn--loading');
            submitBtn.disabled = false;
        }
    }

    /**
     * Create status element for form feedback
     * @param {HTMLFormElement} form
     * @returns {HTMLElement}
     */
    function createStatusElement(form) {
        const statusEl = document.createElement('div');
        statusEl.className = 'form-status';
        statusEl.setAttribute('role', 'alert');
        statusEl.setAttribute('aria-live', 'polite');
        form.insertBefore(statusEl, form.firstChild);
        return statusEl;
    }

    // ==========================================================================
    // Scroll Animations
    // ==========================================================================

    /**
     * Initialize intersection observer for scroll animations
     */
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    // ==========================================================================
    // Event Delegation Setup
    // ==========================================================================

    /**
     * Handle clicks via event delegation
     * @param {MouseEvent} e
     */
    function handleDocumentClick(e) {
        const target = e.target;

        // Modal open buttons (buttons with data-plan attribute or specific classes)
        if (target.matches('[data-open-modal]') || target.closest('[data-open-modal]')) {
            e.preventDefault();
            const btn = target.closest('[data-open-modal]') || target;
            const planName = btn.getAttribute('data-plan') || '';
            openModal(planName);
            return;
        }

        // Modal close button
        if (target.matches('.modal-close') || target.closest('.modal-close')) {
            closeModal();
            return;
        }

        // Modal overlay click (close on backdrop)
        if (target.matches('.modal-overlay')) {
            closeModal();
            return;
        }

        // Mobile menu toggle
        if (target.matches('.mobile-menu-btn') || target.closest('.mobile-menu-btn')) {
            toggleMobileMenu();
            return;
        }

        // Nav links (close mobile menu)
        if (target.matches('.nav-links a')) {
            closeMobileMenu();
            return;
        }

        // Plan toggle buttons
        if (target.matches('.toggle-btn')) {
            const type = target.getAttribute('data-plan-type');
            if (type) {
                showPlans(type, target);
            }
            return;
        }

        // FAQ questions
        if (target.matches('.faq-question') || target.closest('.faq-question')) {
            const btn = target.closest('.faq-question') || target;
            toggleFaq(btn);
            return;
        }
    }

    // ==========================================================================
    // Cookie Banner
    // ==========================================================================

    function initCookieBanner() {
        const banner = document.getElementById('cookie-banner');
        if (!banner || localStorage.getItem('cookie-consent')) return;

        // Show banner after a short delay
        setTimeout(() => {
            banner.setAttribute('aria-hidden', 'false');
        }, 1000);

        document.getElementById('cookie-accept').addEventListener('click', () => {
            localStorage.setItem('cookie-consent', 'accepted');
            banner.setAttribute('aria-hidden', 'true');
        });

        document.getElementById('cookie-decline').addEventListener('click', () => {
            localStorage.setItem('cookie-consent', 'declined');
            banner.setAttribute('aria-hidden', 'true');
        });
    }

    // ==========================================================================
    // Initialization
    // ==========================================================================

    function init() {
        // Scroll events
        window.addEventListener('scroll', handleNavScroll, { passive: true });

        // Global click delegation
        document.addEventListener('click', handleDocumentClick);

        // Keyboard events for modal
        document.addEventListener('keydown', handleModalKeydown);

        // Form submission
        if (enrollmentForm) {
            enrollmentForm.addEventListener('submit', handleFormSubmit);
        }

        // Initialize scroll animations
        initScrollAnimations();

        // Initialize cookie banner
        initCookieBanner();

        // Set initial ARIA states
        if (navLinks) {
            navLinks.setAttribute('data-open', 'false');
        }
        if (mobileMenuBtn) {
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            mobileMenuBtn.setAttribute('aria-controls', 'nav-links');
            mobileMenuBtn.setAttribute('aria-label', 'Toggle navigation menu');
        }
        if (modal) {
            modal.setAttribute('aria-hidden', 'true');
        }

        // Initialize FAQ ARIA attributes
        document.querySelectorAll('.faq-item').forEach((item, index) => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            const answerId = `faq-answer-${index}`;

            item.setAttribute('data-expanded', 'false');
            answer.id = answerId;
            question.setAttribute('aria-expanded', 'false');
            question.setAttribute('aria-controls', answerId);
        });

        // Initialize plan toggle ARIA
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            const isActive = btn.classList.contains('active');
            btn.setAttribute('aria-pressed', isActive.toString());
        });
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose necessary functions globally for any remaining inline handlers during transition
    window.LAMP = {
        openModal,
        closeModal,
        toggleMobileMenu,
        showPlans,
        toggleFaq
    };

})();
