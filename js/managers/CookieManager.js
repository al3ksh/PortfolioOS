/**
 * Cookie Consent Manager - GDPR compliant storage wrapper
 */

export const CookieManager = {
    // Cookie consent status
    _consentGiven: null,
    
    // Original localStorage methods
    _originalSetItem: null,
    _originalGetItem: null,
    
    /**
     * Check if user has made a consent decision
     */
    hasConsent() {
        if (this._consentGiven !== null) {
            return this._consentGiven;
        }
        
        // Check if consent was previously given (this is allowed as "strictly necessary")
        const consent = this._originalGetItem ? 
            this._originalGetItem.call(localStorage, 'ciasteczkoZgody') :
            localStorage.getItem('ciasteczkoZgody');
        this._consentGiven = consent === 'accepted';
        return this._consentGiven;
    },
    
    /**
     * Check if consent decision has been made (either way)
     */
    hasDecided() {
        const consent = this._originalGetItem ?
            this._originalGetItem.call(localStorage, 'ciasteczkoZgody') :
            localStorage.getItem('ciasteczkoZgody');
        return consent === 'accepted' || consent === 'declined';
    },
    
    /**
     * Accept cookies
     */
    accept() {
        if (this._originalSetItem) {
            this._originalSetItem.call(localStorage, 'ciasteczkoZgody', 'accepted');
        } else {
            localStorage.setItem('ciasteczkoZgody', 'accepted');
        }
        this._consentGiven = true;
    },
    
    /**
     * Decline cookies
     */
    decline() {
        // Clear any existing data first
        this.clearNonEssentialData();
        if (this._originalSetItem) {
            this._originalSetItem.call(localStorage, 'ciasteczkoZgody', 'declined');
        } else {
            localStorage.setItem('ciasteczkoZgody', 'declined');
        }
        this._consentGiven = false;
    },
    
    /**
     * Clear non-essential stored data
     */
    clearNonEssentialData() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Keep only the consent decision
            if (key !== 'ciasteczkoZgody') {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    },
    
    /**
     * Wrap localStorage to respect consent
     */
    wrapLocalStorage() {
        // Store original methods
        this._originalSetItem = localStorage.setItem.bind(localStorage);
        this._originalGetItem = localStorage.getItem.bind(localStorage);
        
        const self = this;
        
        // Override setItem
        localStorage.setItem = function(key, value) {
            // Always allow saving consent decision
            if (key === 'ciasteczkoZgody') {
                return self._originalSetItem(key, value);
            }
            // Only save other data if consent given
            if (self.hasConsent()) {
                return self._originalSetItem(key, value);
            }
            // Silently ignore if no consent
            return undefined;
        };
        
        // Override getItem
        localStorage.getItem = function(key) {
            // Always allow reading consent decision
            if (key === 'ciasteczkoZgody') {
                return self._originalGetItem(key);
            }
            // Only read other data if consent given
            if (self.hasConsent()) {
                return self._originalGetItem(key);
            }
            return null;
        };
    },
    
    /**
     * Show the consent modal
     */
    showConsentModal() {
        const modal = document.getElementById('cookieConsent');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },
    
    /**
     * Hide the consent modal
     */
    hideConsentModal() {
        const modal = document.getElementById('cookieConsent');
        if (modal) {
            modal.classList.add('hidden');
        }
    },
    
    /**
     * Initialize consent modal event listeners
     */
    init(onComplete) {
        const acceptBtn = document.getElementById('cookieAccept');
        const declineBtn = document.getElementById('cookieDecline');
        
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                this.accept();
                this.hideConsentModal();
                if (onComplete) onComplete(true);
            });
        }
        
        if (declineBtn) {
            declineBtn.addEventListener('click', () => {
                this.decline();
                this.hideConsentModal();
                if (onComplete) onComplete(false);
            });
        }
    }
};

export default CookieManager;
