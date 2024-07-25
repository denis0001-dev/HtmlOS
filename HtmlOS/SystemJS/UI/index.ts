namespace UI {
    import CSSImportURL = utils.CSSImportURL;
    import delay = utils.delay;



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
    export class UWPSpinner extends HTMLElement {
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
                    this.spinner.element.style.fontSize = newValue ? `${newValue}px` : "";
                    break;
                default:
                    console.warn("Unknown attribute ", name);
                    break;
            }
        }
    }

    export class ContextMenu extends HTMLElement {
        // static observedAttributes = ["bind"];

        constructor() {
            super();

            /* const shadow: ShadowRoot = this.attachShadow({mode: "open"});

            shadow.innerHTML = `
                <div class="context-menu" style="display: none;">
                    <style>
                        @import url("HtmlOS/SystemJS/UI/context-menu.css");
                    </style>
                    <slot></slot>
                </div>
            `; */
        }

        // noinspection JSUnusedGlobalSymbols
        /* attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
            if (name === "bind") {
                const item = this.parentElement.querySelectorAll(newValue);

                item.forEach((element: HTMLElement) => {
                    element.addEventListener("contextmenu", (event: MouseEvent) => {
                        console.log(event);
                        event.preventDefault();

                        // const relativeCoords = getRelativeCoordinates(element, event.screenX, event.screenY);

                        document.body.appendChild(this);
                        this.style.display = "block";
                        this.style.position = "absolute";
                        this.style.top = `${event.clientY}px`;
                        this.style.left = `${event.clientX}px`;
                    });
                });
            }
        } */
    }

    export class MenuItem extends HTMLElement {
        constructor() {
            super();

            /* const shadow: ShadowRoot = this.attachShadow({mode: "open"});

            shadow.innerHTML = `
                <style>
                    @import url("HtmlOS/SystemJS/UI/menu-item.css");
                </style>
                <div class="icon">
                    <slot name="icon"></slot>
                </div>
                <div class="label">
                    <slot></slot>
                </div>
            `; */
        }
    }

    export class CascadingMenu extends HTMLElement {
        private readonly arrow: HTMLDivElement;
        private readonly menuItem: MenuItem;
        private readonly contextmenu: HTMLSlotElement;

        constructor() {
            super();
            const shadow = this.attachShadow({mode: "open"});
            shadow.innerHTML = `
                <!--suppress CssUnknownTarget -->
                <style>
                    @import url("HtmlOS/SystemJS/UI/cascading-menu.css");
                    @import url("HtmlOS/SystemJS/UI/context-menu.css");
                </style>
                <menu-item>
                    <slot></slot>
                    <div class="arrow"></div>
                </menu-item>
                <slot name="contextmenu"></slot>
            `;
            this.arrow = this.shadowRoot.querySelector("div.arrow");
            this.menuItem = this.shadowRoot.querySelector("menu-item");
            this.contextmenu = this.shadowRoot.querySelector("slot[name='contextmenu']");

            this.menuItem.addEventListener("mouseenter", () => {
                const menuContent: ContextMenu = this.contextmenu.assignedElements()[0] as ContextMenu;
                menuContent.removeEventListener("mouseleave", handler);
                menuContent.addEventListener("mouseleave", handler);
                menuContent.style.display = "block";
                this.contextmenu.style.display = "block";
                this.menuItem.classList.add("active");
                // menuContent.style.position = "absolute";
            });


            const _this: CascadingMenu = this;

            function handler() {
                const menuContent: ContextMenu = _this.contextmenu.assignedElements()[0] as ContextMenu;
                if (menuContent.matches(":hover")) {
                    return;
                }

                menuContent.style.display = "none";
                _this.contextmenu.style.display = "none";
                _this.menuItem.classList.remove("active");
            }

            this.menuItem.addEventListener("mouseleave", handler);
        }
    }

    export class MenuSeparator extends HTMLElement {
        constructor() {
            super();

           /*  const shadow: ShadowRoot = this.attachShadow({mode: "open"});

            shadow.innerHTML = `
                <style>
                    @import url("HtmlOS/SystemJS/UI/menu-separator.css");
                </style>
                <div class="separator"></div>
            `; */
        }
    }

    interface MenuBuilderItem {
        element: HTMLElement;
        type: string;
    }

    export class MenuBuilderNormalItem implements MenuBuilderItem {
        public readonly element: MenuItem;
        public readonly type: string = "";

        get label(): string {
            return this.element.querySelector("span").textContent;
        }

        get icon(): string {
            return (this.element.querySelector("div.icon_img[data-type]") as HTMLDivElement).dataset.type;
        }

        set label(label: string) {
            const span: HTMLSpanElement = this.element.querySelector("span");
            span.textContent = label;
        }

        set icon(icon: string) {
            (this.element.querySelector("div.icon_img[data-type]") as HTMLDivElement).dataset.type = icon;
        }

        constructor(label: string, icon: string, callback?: (e?: MouseEvent) => void) {
            this.element = document.createElement("menu-item");
            this.element.innerHTML = `
                <div class="icon_img" data-type="${icon}"></div>
                <span>${label}</span>
            `;
            if (callback) {
                this.element.addEventListener("click", callback);
            }
        }
    }

    export class MenuBuilderSeparator implements MenuBuilderItem {
        public readonly element: MenuSeparator;
        public readonly type: string = "separator";
        constructor() {
            this.element = document.createElement("menu-separator");
        }
    }

    export class MenuBuilderCascadingMenu implements MenuBuilderItem {
        public readonly element: CascadingMenu;
        public readonly type: string = "cascading-menu";
        constructor(label: string, menu: ContextMenu | ContextMenuBuilder, icon?: string) {
            this.element = document.createElement("cascading-menu") as CascadingMenu;
            this.element.innerHTML = `
            <div class="icon_img" data-type="${icon || "none"}"></div>
            <span>${label}</span>
            `
            const contextmenu: ContextMenu = menu instanceof ContextMenu ? menu : menu.build();
            contextmenu.slot = "contextmenu";
            this.element.appendChild(contextmenu);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    export class ContextMenuBuilder {
        // TODO finish this
        private readonly items: MenuBuilderItem[];

        constructor(...items: MenuBuilderItem[]) {
            this.items = items;
        }

        addNormalItem(icon: string, label: string, callback?: (e?: MouseEvent) => void) {
            this.addItem(new MenuBuilderNormalItem(label, icon, callback));
        }

        addSeparator() {
            this.addItem(new MenuBuilderSeparator());
        }

        addCascadingMenu(icon: string, label: string, menu: ContextMenu | ContextMenuBuilder) {
            this.addItem(new MenuBuilderCascadingMenu(label, menu, icon));
        }

        addItem(item: MenuBuilderItem) {
            this.items.push(item);
        }

        addItems(...items: MenuBuilderItem[]) {
            this.items.push(...items);
        }

        build(): ContextMenu {
            const contextMenu: ContextMenu = document.createElement("context-menu");
            this.items.forEach((item: MenuBuilderItem) => {
                contextMenu.appendChild(item.element);
            });
            return contextMenu;
        }
    }

    export function attachContextMenu(item: HTMLElement, contextMenu: ContextMenu | ContextMenuBuilder) {
        if (contextMenu instanceof ContextMenuBuilder) {
            contextMenu = contextMenu.build();
        }
        if (item instanceof HTMLIFrameElement) {
            item = item.contentDocument.body || item;
        }

        item.dataset.menuAttached = "";

        const element: ContextMenu = contextMenu;

        /* Array.from(element.children).forEach((el: HTMLElement) => {
            if (el instanceof MenuItem) {
                const addEvListener = el.addEventListener;
                el.addEventListener = (type: string, listener: (e: Event) => void, options?: EventListenerOptions) => {
                    addEvListener.call(this.element, type, (e: Event) => {
                        if (e instanceof MouseEvent) {
                            e.stopPropagation();
                        }
                        listener(e);
                    });
                }
            }
        }); */
        /* element.addEventListener("click", (e) => {e.stopPropagation()});
        element.addEventListener("contextmenu", (e) => {e.stopPropagation()}); */

        function handler(event: MouseEvent) {
            if (item.dataset.menuAttached === undefined) {
                item.removeEventListener("contextmenu", handler);
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            document.body.appendChild(element);
            element.style.display = "block";
            element.style.position = "absolute";
            element.style.top = `${event.clientY}px`;
            element.style.left = `${event.clientX}px`;

            document.addEventListener("contextmenu", removeContextMenu);
            document.addEventListener("click", removeContextMenu);
        }

        item.addEventListener("contextmenu", handler);

        function removeContextMenu() {
            element.remove();
            document.removeEventListener("contextmenu", removeContextMenu);
            document.removeEventListener("mousedown", removeContextMenu);
        }
    }

    export function removeContextMenu(item: HTMLElement) {
        item.dataset.menuAttached = undefined;
    }

    customElements.define("uwp-spinner", UWPSpinner)
    // Context menu
    customElements.define("context-menu", ContextMenu);
    customElements.define("menu-item", MenuItem);
    customElements.define("menu-separator", MenuSeparator);
    customElements.define("cascading-menu", CascadingMenu);
}