class Spinner {
    public static readonly chars: string[] = [
        'E052', 'E053', 'E054', 'E055', 'E056', 'E057', 'E058', 'E059', 'E060', 'E061', 'E062', 'E063', 'E064', 'E065',
        'E066', 'E067', 'E068', 'E069', 'E070', 'E071', 'E072', 'E073', 'E074', 'E075', 'E076', 'E077', 'E078', 'E079',
        'E07a', 'E07b', 'E07c', 'E07d', 'E07e', 'E07f', 'E080', 'E081', 'E082', 'E083', 'E084', 'E085', 'E086', 'E087',
        'E088', 'E089', 'E08a', 'E08b', 'E08c', 'E08d', 'E08e', 'E08f', 'E090', 'E091', 'E092', 'E093', 'E094', 'E095',
        'E096', 'E097', 'E098', 'E099', 'E09a', 'E09b', 'E09c', 'E09d', 'E09e', 'E09f', 'E0A0', 'E0A1', 'E0A2', 'E0A3',
        'E0A4', 'E0A5', 'E0A6', 'E0A7', 'E0A8', 'E0A9', 'E0Aa', 'E0Ab', 'E0Ac', 'E0Ad', 'E0Ae', 'E0Af', 'E0B0', 'E0B1',
        'E0B2', 'E0B3', 'E0B4', 'E0B5', 'E0B6', 'E0B7', 'E0B8', 'E0B9', 'E0Ba', 'E0Bb', 'E0Bc', 'E0Bd', 'E0Be', 'E0Bf',
        'E0C0', 'E0C1', 'E0C2', 'E0C3', 'E0C4', 'E0C5', 'E0C6', 'E0C7', 'E0C8', 'E0C9', 'E0Ca', 'E0Cb'
    ];

    public readonly element: HTMLSpanElement;
    private running: boolean;

    constructor(element: HTMLSpanElement) {
        this.element = element;
        element.style.opacity = "0";
    }

    async start(): Promise<void> {
        this.element.style.opacity = "1";
        this.running = true;

        while (this.running && this.element.style.display !== "none") {
            for (let i = 0; i < Spinner.chars.length; i++) {
                this.element.innerHTML = '&#x' + Spinner.chars[i];
                await delay(25);
            }
        }
    }

    stop(): void {
        this.element.style.opacity = "0";
        this.running = false;
    }
}

// noinspection JSUnusedGlobalSymbols
class UWPSpinner extends HTMLElement {
    private readonly spinner: Spinner;

    static observedAttributes: string[] = ["running", "size"];

    constructor() {
        super();
        const shadow: ShadowRoot = this.attachShadow({mode: "open"});

        const style: HTMLStyleElement = document.createElement("style");
        style.textContent = CSSImportURL("HtmlOS/SystemJS/UI/spinner.css");
        shadow.appendChild(style);

        const spinner: HTMLSpanElement = document.createElement("span");
        spinner.innerHTML = Spinner.chars[0];
        shadow.appendChild(spinner);

        this.spinner = new Spinner(spinner);
    }

    get running(): boolean {
        const value: string = this.getAttribute("running");
        return value && (value === "true" || value === "");
    }

    set running(value: boolean) {
        if (value) {
            this.setAttribute("running", "");
        } else {
            this.removeAttribute("running");
        }
    }

    get size() {
        return Number(this.getAttribute("size"));
    }

    set size(value: number | null | undefined) {
        if (value) {
            this.setAttribute("size", value.toString());
            // this.spinner.element.style.fontSize = `${value}px`;
        } else {
            this.removeAttribute("size");
            // this.spinner.element.style.fontSize = "";
        }
    }

    start(): void {
        this.running = true;
    }
    stop(): void {
        this.running = false;
    }

    // connectedCallback() {}
    disconnectedCallback() {
        this.stop();
    }
    // adoptedCallback() {}
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        console.log(name, oldValue, newValue);
        switch (name) {
            case ("running"):
                if (newValue === "true" || newValue === "") {
                    if (!this.running) {
                        this.spinner.start();
                    }
                } else {
                    this.spinner.stop();
                }
                break;
            case ("size"):
                this.spinner.element.style.fontSize = newValue ? `${newValue}px`: "";
                break;
            default:
                console.warn("Unknown attribute ", name);
                break;
        }
    }
}

class ContextMenu extends HTMLElement {
    
}

customElements.define("uwp-spinner", UWPSpinner);
customElements.define("context-menu", ContextMenu);