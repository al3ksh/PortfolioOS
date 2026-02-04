/**
 * Storage Manager - Privacy compliant storage wrapper
 */

export const StorageManager = {
    // Consent status
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
        
        const consent = this._originalGetItem ? 
            this._originalGetItem.call(localStorage, 'storagePrefs') :
            localStorage.getItem('storagePrefs');
        this._consentGiven = consent === 'yes';
        return this._consentGiven;
    },
    
    /**
     * Check if consent decision has been made (either way)
     */
    hasDecided() {
        const consent = this._originalGetItem ?
            this._originalGetItem.call(localStorage, 'storagePrefs') :
            localStorage.getItem('storagePrefs');
        return consent === 'yes' || consent === 'no';
    },
    
    /**
     * Accept storage
     */
    accept() {
        if (this._originalSetItem) {
            this._originalSetItem.call(localStorage, 'storagePrefs', 'yes');
        } else {
            localStorage.setItem('storagePrefs', 'yes');
        }
        this._consentGiven = true;
    },
    
    /**
     * Decline storage
     */
    decline() {
        this.clearNonEssentialData();
        if (this._originalSetItem) {
            this._originalSetItem.call(localStorage, 'storagePrefs', 'no');
        } else {
            localStorage.setItem('storagePrefs', 'no');
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
            if (key !== 'storagePrefs') {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    },
    
    /**
     * Wrap localStorage to respect consent
     */
    wrapLocalStorage() {
        this._originalSetItem = localStorage.setItem.bind(localStorage);
        this._originalGetItem = localStorage.getItem.bind(localStorage);
        
        const self = this;
        
        localStorage.setItem = function(key, value) {
            if (key === 'storagePrefs') {
                return self._originalSetItem(key, value);
            }
            if (self.hasConsent()) {
                return self._originalSetItem(key, value);
            }
            return undefined;
        };
        
        localStorage.getItem = function(key) {
            if (key === 'storagePrefs') {
                return self._originalGetItem(key);
            }
            if (self.hasConsent()) {
                return self._originalGetItem(key);
            }
            return null;
        };
    },
    
    /**
     * Show the consent modal
     */
    showModal() {
        const modal = document.getElementById('privacyModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },
    
    /**
     * Hide the consent modal
     */
    hideModal() {
        const modal = document.getElementById('privacyModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },
    
    /**
     * Initialize event listeners
     */
    init(onComplete) {
        const acceptBtn = document.getElementById('privacyAccept');
        const declineBtn = document.getElementById('privacyDecline');
        
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                this.accept();
                this.hideModal();
                if (onComplete) onComplete(true);
            });
        }
        
        if (declineBtn) {
            declineBtn.addEventListener('click', () => {
                this.decline();
                this.hideModal();
                if (onComplete) onComplete(false);
            });
        }
    }
};

export default StorageManager;
