// noinspection JSUnusedGlobalSymbols
var utils;
(function (utils) {
    let html;
    (function (html) {
        function getChildByClass(child, className) {
            return Array.from(child.children).find(item => item.classList.contains(className));
        }
        html.getChildByClass = getChildByClass;
        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
        html.closeDragElement = closeDragElement;
        /**
         * Returns an HTML-safe version of the provided string.
         * @param str The source string.
         * @returns {string} The string, with <code>&</code>,
         * <code><</code>,
         * <code>&gt;</code>
         * and <code>"</code>
         * escaped.
         */
        function safeHTMLString(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }
        html.safeHTMLString = safeHTMLString;
        function hasParent(child, ...parents) {
            return parents.some((parent) => parent.contains(child));
        }
        html.hasParent = hasParent;
        function getRelativeCoordinates(element, x, y) {
            let rect = element.getBoundingClientRect();
            let viewportRect = (window.parent || window).document.documentElement.getBoundingClientRect();
            let relativeX = x + rect.left - viewportRect.left;
            let relativeY = y + rect.top - viewportRect.top;
            return {
                x: relativeX,
                y: relativeY
            };
        }
        html.getRelativeCoordinates = getRelativeCoordinates;
    })(html = utils.html || (utils.html = {}));
    let cookies;
    (function (cookies_1) {
        /**
         * Gets the value stored in document cookies.
         * Returns null if the cookie doesn't exist.
         * @param name The cookie name.
         * @returns {boolean|number|any|Element|null}
         */
        function get(name) {
            const parts = document.cookie.split(";");
            for (let part of parts) {
                const trimmedPart = part.trim();
                if (trimmedPart.startsWith(name + "=")) {
                    const value = decodeURIComponent(trimmedPart.substring(name.length + 1));
                    return parseString(value);
                }
            }
            return null;
        }
        cookies_1.get = get;
        /**
         * Sets a cookie to the given value.
         * If the value is <code>undefined</code> or <code>null</code>,
         * the cookie will be erased.
         * @param name The cookie name.
         * @param value The value. Can be anything.
         */
        function set(name, value) {
            if ([undefined, null].includes(value)) {
                document.cookie = `${name}=; Max-Age=-99999999;`;
                return;
            }
            if (value instanceof HTMLElement) {
                value = value.outerHTML;
            }
            else if (typeof value === "object") {
                value = JSON.stringify(value);
            }
            const newValue = value.toString();
            document.cookie = `${name}=${encodeURIComponent(newValue)}`;
        }
        cookies_1.set = set;
        /**
         * Returns an object containing all cookies present in the document.
         * The properties names are the cookie names.
         * @returns {{}}
         */
        function getAll() {
            const cookies = {};
            const parts = document.cookie.split(";");
            for (let part of parts) {
                const trimmedPart = part.trim();
                if (trimmedPart) {
                    const [name, value] = trimmedPart.split("=");
                    cookies[name] = parseString(decodeURIComponent(value));
                }
            }
            return cookies;
        }
        cookies_1.getAll = getAll;
        /**
         * Clears all cookies present in the document.
         */
        function clear() {
            document.cookie.split(";")
                .forEach(function (c) {
                document.cookie = c
                    .replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" +
                    new Date().toUTCString()
                    + ";path=/");
            });
        }
        cookies_1.clear = clear;
    })(cookies = utils.cookies || (utils.cookies = {}));
    utils.empty = () => { };
    function delay(milis) {
        return new Promise(resolve => setTimeout(resolve, milis));
    }
    utils.delay = delay;
    function urlExists(url) {
        var request;
        if (window.XMLHttpRequest) {
            request = new XMLHttpRequest();
        }
        else {
            request = new ActiveXObject("Microsoft.XMLHTTP");
        }
        request.open('GET', url, false);
        request.send();
        return request.status === 200;
    }
    utils.urlExists = urlExists;
    function generateRandomString(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }
    utils.generateRandomString = generateRandomString;
    function midScreenX() {
        return (Number(window.getComputedStyle(document.body).width) / 2);
    }
    utils.midScreenX = midScreenX;
    function midScreenY() {
        return (Number(window.getComputedStyle(document.body).height) / 2);
    }
    utils.midScreenY = midScreenY;
    /* function changeStylesheetRule(stylesheet: CSSStyleSheet, selector: string, property: string, value: string) {
        // Make the strings lowercase
        selector = selector.toLowerCase();
        property = property.toLowerCase();
        value = value.toLowerCase();

        // Change it if it exists
        for(var i = 0; i < stylesheet.cssRules.length; i++) {
            var rule = stylesheet.cssRules[i];
            if(rule.selectorText === selector) {
                rule.style[property] = value;
                return;
            }
        }

        // Add it if it does not
        stylesheet.insertRule(selector + " { " + property + ": " + value + "; }", 0);
    } */
    function nextElement(array, element) {
        return array.indexOf(nextElementIndex(array, element));
    }
    utils.nextElement = nextElement;
    function nextElementIndex(array, element) {
        return array.indexOf(element) + 1;
    }
    utils.nextElementIndex = nextElementIndex;
    /**
     * Parses a string to an object type.
     * <br/>
     * <code>"true"</code> or <code>"false"</code> - boolean value
     * <br/>
     * Any number that is not <code>NaN</code> - number
     * <br/>
     * Starts and ends with <code>{}</code> or <code>[]</code> - JSON parsed into an object
     * <br/>
     * Any valid HTML string - parsed HTML node
     * <br/>
     * If any of the conditions above don't match, returns <code>value</code>.
     * @param value The string to parse
     * @returns {Element|*|number|boolean}
     */
    function parseString(value) {
        // Boolean
        if (value === "true") {
            return true;
        }
        else if (value === "false") {
            return false;
        }
        // Numbers
        const number = Number(value);
        if (!isNaN(number)) {
            return number;
        }
        // JSON/array
        if ((value.startsWith("{") && value.endsWith("}"))
            ||
                (value.startsWith("[") && value.endsWith("]"))) {
            try {
                return JSON.parse(value);
            }
            catch (e) {
                console.warn("Error parsing JSON: ", e);
            }
        }
        // HTML
        const regex = /<[\w-]+( [\w-]+=".*")*(\s*\/>|\s*>(.|\n)*<\/[\w-]+>)/gm;
        if (regex.exec(value)) {
            const parse = Range.prototype.createContextualFragment.bind(document.createRange());
            return parse(value).children[0];
        }
        // String fallback
        return value;
    }
    utils.parseString = parseString;
    function CSSImportURL(url) {
        return `@import url("${url}");`;
    }
    utils.CSSImportURL = CSSImportURL;
})(utils || (utils = {}));
