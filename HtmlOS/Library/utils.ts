function delay(milis: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milis));
}

function urlExists(url: string): boolean {
    var request: any;
    if (window.XMLHttpRequest) {
        request = new XMLHttpRequest();
    } else {
        request = new ActiveXObject("Microsoft.XMLHTTP");
    }
    request.open('GET', url, false);
    request.send();

    return request.status === 200;
}

function getChildByClass(child: HTMLElement, className: string): HTMLElement {
    return Array.from(child.children).find(item => item.classList.contains(className)) as HTMLElement;
}

function generateRandomString(length: number): string {
    let result: string = '';
    const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength: number = characters.length;
    let counter: number = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

function midScreenX(): number {
    return (Number(window.getComputedStyle(document.body).width) / 2)
}

function midScreenY(): number {
    return (Number(window.getComputedStyle(document.body).height) / 2)
}

function closeDragElement(): void {
    document.onmouseup = null;
    document.onmousemove = null;
}

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

function nextElement(array: any[], element: any): number {
    return array.indexOf(nextElementIndex(array, element));
}

function nextElementIndex(array: any[], element: any): number {
    return array.indexOf(element) + 1;
}

/**
 * Returns an HTML-safe version of the provided string.
 * @param str The source string.
 * @returns {string} The string, with <code>&</code>,
 * <code><</code>,
 * <code>&gt;</code>
 * and <code>"</code>
 * escaped.
 */
function safeHTMLString(str: string): string {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Gets the value stored in document cookies.
 * Returns null if the cookie doesn't exist.
 * @param name The cookie name.
 * @returns {boolean|number|any|Element|null}
 */
function getCookie(name: string): boolean | number | {} | [] | HTMLElement | string {
    const parts: string[] = document.cookie.split(";");

    for (let part of parts) {
        const trimmedPart = part.trim();
        if (trimmedPart.startsWith(name + "=")) {
            const value = decodeURIComponent(trimmedPart.substring(name.length + 1));
            return parseString(value);
        }
    }
    return null;
}

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
function parseString(value: string): boolean | number | {} | [] | HTMLElement | string {
    // Boolean
    if (value === "true") {
        return true;
    } else if (value === "false") {
        return false;
    }
    // Numbers
    const number: number = Number(value);
    if (!isNaN(number)) {
        return number;
    }
    // JSON/array
    if (
        (value.startsWith("{") && value.endsWith("}"))
        ||
        (value.startsWith("[") && value.endsWith("]"))
    ) {
        try {
            return JSON.parse(value);
        } catch (e) {
            console.warn("Error parsing JSON: ",e);
        }
    }
    // HTML
    const regex: RegExp = /<[\w-]+( [\w-]+=".*")*(\s*\/>|\s*>(.|\n)*<\/[\w-]+>)/gm;
    if (regex.exec(value)) {
        const parse = Range.prototype.createContextualFragment.bind(document.createRange());

        return parse(value).children[0];
    }
    // String fallback
    return value;
}

/**
 * Sets a cookie to the given value.
 * If the value is <code>undefined</code> or <code>null</code>,
 * the cookie will be erased.
 * @param name The cookie name.
 * @param value The value. Can be anything.
 */
function setCookie(name: string, value: boolean | number | {} | [] | HTMLElement | string): void {
    if ([undefined, null].includes(value)) {
        document.cookie = `${name}=; Max-Age=-99999999;`
        return;
    }

    if (value instanceof HTMLElement) {
        value = value.outerHTML;
    } else if (typeof value === "object") {
        value = JSON.stringify(value);
    }

    const newValue: string = value.toString();

    document.cookie = `${name}=${encodeURIComponent(newValue)}`;
}

/**
 * Returns an object containing all cookies present in the document.
 * The properties names are the cookie names.
 * @returns {{}}
 */
function getCookies(): {[x: string]: string | boolean | number | {} | [] | HTMLElement} {
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

/**
 * Clears all cookies present in the document.
 */
function clearCookies(): void {
    document.cookie.split(";")
        .forEach(function(c) {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" +
                    new Date().toUTCString()
                    + ";path=/");
        });
}