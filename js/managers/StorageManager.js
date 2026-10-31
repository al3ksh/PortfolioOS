/**
 * Storage Manager - keeps localStorage writes behind the visitor's choice.
 *
 * Saving settings, window positions and scores in the browser is part of the
 * service the visitor asked for, so it is on by default. Turning it off on the
 * Cookies page (cookies.html) stores storagePrefs = 'no': from then on nothing
 * else is read from or written to localStorage.
 */

export const StorageManager = {
    _originalSetItem: null,
    _originalGetItem: null,

    _prefs() {
        return this._originalGetItem
            ? this._originalGetItem('storagePrefs')
            : localStorage.getItem('storagePrefs');
    },

    /**
     * Saving is allowed unless the visitor switched it off
     */
    hasConsent() {
        return this._prefs() !== 'no';
    },

    /**
     * Wrap localStorage to respect the choice. The methods are replaced on
     * Storage.prototype: assigning localStorage.setItem = fn would only save an
     * item called "setItem" and leave the real method untouched.
     */
    wrapLocalStorage() {
        try {
            void localStorage;
        } catch {
            return; // storage blocked by the browser: nothing gets saved anyway
        }
        const proto = Storage.prototype;
        const setItem = proto.setItem;
        const getItem = proto.getItem;
        this._originalSetItem = (key, value) => setItem.call(localStorage, key, value);
        this._originalGetItem = key => getItem.call(localStorage, key);

        // Older versions left those junk items behind
        ['setItem', 'getItem'].forEach(key => {
            if (String(getItem.call(localStorage, key)).startsWith('function')) localStorage.removeItem(key);
        });

        const self = this;
        const allowed = (storage, key) => storage !== localStorage || key === 'storagePrefs' || self.hasConsent();

        proto.setItem = function(key, value) {
            return allowed(this, key) ? setItem.call(this, key, value) : undefined;
        };

        proto.getItem = function(key) {
            return allowed(this, key) ? getItem.call(this, key) : null;
        };
    }
};

export default StorageManager;
