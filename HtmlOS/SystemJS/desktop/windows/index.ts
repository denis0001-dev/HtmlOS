// noinspection DuplicatedCode,JSUnusedGlobalSymbols
/// <reference path="../index.ts" />


namespace system {
    import generateRandomString = utils.generateRandomString;

    /**
     * @deprecated
     * @param taskID
     */
    export function getTask(taskID: string | HTMLElement): Task | null {
        return Task.get(taskID);
    }

    export class Task {
        private static readonly tasks: Map<string, Task> = new Map();

        public readonly func: Function;
        public readonly taskID: string;

        constructor(func: Function) {
            this.func = func;
            this.taskID = generateRandomString(8);

            Task.tasks.set(this.taskID, this);
            this.execute();
        }

        async execute(): Promise<any> {
            return await this.func();
        }

        finish(): void {
            Task.tasks.delete(this.taskID);
        }

        /* static get(taskID: string): Task | null;
        static get(taskID: HTMLElement): Task | null; */

        static get(taskID: string | HTMLElement): Task | null {
            if (taskID instanceof String || typeof taskID == "string") {
                return Task.tasks.get(taskID as string) || null;
            } else if (taskID instanceof HTMLElement) {
                return Task.tasks.get(taskID.id.replace("task-", "")) || null;
            } else {
                return null;
            }
        }
    }

    export class EmptyTask extends Task {
        constructor() {
            super(() => {
            });
        }
    }
}

namespace desktop {
    import EmptyTask = system.EmptyTask;
    import empty = utils.empty;
    import delay = utils.delay;
    import closeDragElement = utils.html.closeDragElement;
    export var OKAction: Action[];
    document.addEventListener("DOMContentLoaded", () => {
        OKAction = [new Action("OK", empty)];
    });

    /**
     * @deprecated
     * @param taskID
     */
    export function getWindow(taskID: string | HTMLElement): Window | null {
        return Window.get(taskID);
    }

    // Focus
    export const lowestWindowZIndex: number = 2;

    class WindowTask extends EmptyTask {
        public readonly window: Window;
        public /* readonly */ taskbarIcon: HTMLDivElement;

        constructor(window: Window, taskbarIcon: HTMLDivElement) {
            super();
            this.window = window;
            this.taskbarIcon = taskbarIcon;
        }
    }

    interface WindowConfig {
        width: number;
        height: number;
        title?: string;

        closeButton?: boolean;
        maximizeButton?: boolean;
        minimizeButton?: boolean;

        closeEnabled?: boolean;
        maximizeEnabled?: boolean;
        minimizeEnabled?: boolean;

        resizable?: boolean;
        frameless?: boolean;
        transparency?: number;
        taskbarIcon?: boolean;

        icon?: string;
        content?: HTMLElement | HTMLCollection | string;

        minWidth?: number;
        minHeight?: number;
        maxWidth?: number;
        maxHeight?: number;
    }


    // noinspection JSUnusedGlobalSymbols
    export class Window {
        private static readonly windows: Map<string, Window> = new Map();
        static #focusedWindow: Window = null;

        static get focusedWindow(): Window {
            return Window.#focusedWindow;
        }

        #config: WindowConfig;

        public readonly element: HTMLDivElement;
        #width: number;
        #height: number;
        #title: string;

        // Window maximizing & restoring
        private prevWidth: number;
        private prevHeight: number;
        private prevTop: number;
        private prevLeft: number;

        private maximized: boolean = false;

        // Task
        public readonly task: WindowTask;

        constructor(config: WindowConfig) {
            let title: string = config.title || "";
            let initialWidth: number = config.width;
            let initialHeight: number = config.height;
            let closeButton: boolean = [true, undefined, null].includes(config.closeButton);
            let maximizeButton: boolean = [true, undefined, null].includes(config.maximizeButton);
            let minimizeButton: boolean = [true, undefined, null].includes(config.minimizeButton);
            let icon: string = config.icon;
            let content = config.content;

            this.config = config;

            this.element = document.createElement("div");
            this.element.classList.add("window");

            this.width = initialWidth;
            this.height = initialHeight;

            this.minWidth = config.minWidth || 150;
            this.minHeight = config.minHeight || 40;

            this.maxHeight = config.maxHeight || -1;
            this.maxWidth = config.maxWidth || -1;

            // Fallback icon
            if ([undefined, null, ""].includes(icon)) {
                icon = "application";
            }

            // Create an icon on the taskbar for the window
            const task: WindowTask = new WindowTask(this, null);
            this.element.id = "window_" + task.taskID;

            const taskIcon: HTMLDivElement = document.createElement("div");
            taskIcon.classList.add("task");
            taskIcon.id = "task-" + task.taskID;

            taskIcon.innerHTML = `
                <div class="icon_img" data-type="${icon}"></div>
                <div class="underline"></div>
            `;

            taskIcon.addEventListener('click', () => {
                this.maximize();
            });
            task.taskbarIcon = taskIcon;
            taskIcon.style.display = 'none';
            document.getElementById("tasks").appendChild(taskIcon);
            this.task = task;

            this.element.innerHTML = `
                <div class="resizer_up"></div>
                <div class="resizer_right"></div>
                <div class="resizer_left"></div>
                <div class="resizer_bottom"></div>
    
                <div class="resizer_up_left"></div>
                <div class="resizer_up_right"></div>
                <div class="resizer_bottom_left"></div>
                <div class="resizer_bottom_right"></div>
    
                <div class="frame">
                    <div class="left">
                        <div class="icon_img" data-type="${icon}"></div>
                        <div class="title">${this.title}</div>
                    </div>
                    <div class="right">
                        <div class="minimize"></div>
                        <div class="restore"></div>
                        <div class="maximize"></div>
                        <div class="close"></div>
                    </div>
                </div>
                <div class="content">
    
                </div>
            `;
            this.title = title;

            // Append the content
            if ([undefined, null].includes(content)) {
            } else if (content instanceof HTMLElement) {
                this.content = content;
            } else if (content instanceof HTMLCollection) {
                this.content = document.createElement("div");
                this.content.classList.add("content");
                this.content.append(...content);
            } else if (typeof content === "string") {
                this.content = document.createElement("div");
                this.content.classList.add("content");
                this.content.innerHTML = content as string;
            } /* else {
                try {
                    this.content = document.createElement("div");
                    this.content.classList.add("content");
                    this.content.innerHTML = content.toString();
                } catch (ignore) {
                    throw new TypeError("Invalid content type");
                }
            } */

            // Focus
            this.element.addEventListener('click', () => {
                this.focus();
            });
            // console.log(this.element.querySelectorAll("iframe"));

            // Hide buttons that don't need to be shown
            if (!closeButton) this.closeButton.style.display = 'none';
            if (!maximizeButton) this.maximizeButton.style.display = 'none';
            if (!minimizeButton) this.minimizeButton.style.display = 'none';

            // Button actions
            this.closeButton.addEventListener('click', () => {
                this.close()
            });
            this.maximizeButton.addEventListener('click', () => {
                this.toggleMaximize()
            });
            this.minimizeButton.addEventListener('click', () => {
                this.minimize()
            });

            this.element.style.display = 'none';

            // Center the window
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            this.element.style.top = `${(screenHeight - this.height) / 2}px`
            this.element.style.left = `${(screenWidth - this.width) / 2}px`

            // Draggable window
            this.#draggableWindow();

            // Resizers
            this.#resizer_up();
            this.#resizer_right();
            this.#resizer_bottom();
            this.#resizer_bottom_right();
            this.#resizer_left();
            this.#resizer_bottom_left();
            this.#resizer_top_left();
            this.#resizer_top_right();

            document.getElementById("windows").appendChild(this.element);

            Window.windows.set(this.taskID, this);
        }

        get width(): number {
            this.updateBounds();
            return this.#width;
        }

        get height(): number {
            this.updateBounds();
            return this.#height;
        }

        private updateIframes(): void {
            this.element.querySelectorAll("iframe").forEach(async (item: HTMLIFrameElement) => {
                console.log(item);
                item.contentWindow.addEventListener("click", () => {
                    this.focus();
                });
                const style: HTMLStyleElement = document.createElement("style");
                // noinspection CssUnknownTarget
                style.textContent = `
                @import url("${(await fetch("HtmlOS/Fonts/Segoe%20UI/stylesheet.css")).url}");
                @import url("${(await fetch("HtmlOS/Cursors/cursors.css")).url}");
                body {
                    cursor: var(--cur-default);
                }
                `;

                item.contentDocument.head.appendChild(style);
                (item.contentWindow as any).console = window.console;

                let iframeRect: DOMRect = item.getBoundingClientRect();
                console.debug(iframeRect);

                item.contentWindow.addEventListener("click", (e: MouseEvent) => {
                    iframeRect = item.getBoundingClientRect();
                    const x: number = Math.round(iframeRect.x) + e.clientX;
                    const y: number = Math.round(iframeRect.y) + e.clientY;

                    console.debug(x, y);

                    const event: MouseEvent = new MouseEvent("click", {
                        button: e.button,
                        buttons: e.buttons,
                        clientX: x,
                        clientY: y,
                        screenX: e.screenX,
                        screenY: e.screenY
                    });
                    item.dispatchEvent(event);
                });

                item.contentWindow.addEventListener("contextmenu", (e: MouseEvent) => {
                    item.getBoundingClientRect();
                    const x: number = Math.round(iframeRect.x) + e.clientX;
                    const y: number = Math.round(iframeRect.y) + e.clientY;
                    console.debug(x, y);

                    const event: MouseEvent = new MouseEvent("contextmenu", {
                        button: e.button,
                        buttons: e.buttons,
                        clientX: x,
                        clientY: y,
                        screenX: e.screenX,
                        screenY: e.screenY
                    });
                    item.dispatchEvent(event);
                });
            });
        }

        get title(): string {
            return this.#title;
        }

        set title(title: string) {
            this.#title = title;
            this.element.querySelector(".frame > .left > .title").innerHTML = title;
        }

        get config(): WindowConfig {
            return this.#config;
        }

        set config(config: WindowConfig) {
            this.#config = config;
        }

        get icon(): string {
            return (this.element.querySelector(".frame > .left > .icon_img") as HTMLElement).dataset.type;
        }

        set icon(icon: string) {
            (this.element.querySelector(".frame > .left > .icon_img") as HTMLElement).dataset.type = icon;
        }

        get taskbarIcon(): HTMLDivElement {
            return this.task.taskbarIcon;
        }

        get content(): HTMLElement {
            return this.element.getElementsByClassName("content")[0] as HTMLElement;
        }

        set content(content: HTMLElement) {
            this.content.remove();
            this.element.appendChild(content);
        }

        get minWidth(): number {
            return Number(window.getComputedStyle(this.element).minWidth.replace("px", ""));
        }

        set minWidth(minWidth: number) {
            this.element.style.minWidth = minWidth + "px";
        }

        get minHeight(): number {
            return Number(window.getComputedStyle(this.element).minHeight.replace("px", ""));
        }

        set minHeight(minHeight: number) {
            this.element.style.minHeight = minHeight + "px";
        }

        get maxWidth(): number {
            const value = getComputedStyle(this.element).maxWidth.replace("px", "")

            return value === "none" ? -1 : Number(value);
        }

        set maxWidth(maxWidth: number) {
            this.element.style.maxWidth = maxWidth !== -1 ? maxWidth + "px": "none";
        }

        get maxHeight(): number {
            const value = getComputedStyle(this.element).maxHeight.replace("px", "");

            return value === "none" ? -1 : Number(value);
        }

        set maxHeight(maxHeight: number) {
            this.element.style.maxHeight = maxHeight !== -1 ? maxHeight + "px": "none";
        }

        get zIndex(): number {
            return Number(this.element.style.zIndex);
        }

        set zIndex(zIndex: number) {
            this.element.style.zIndex = zIndex.toString();
        }

        private updateBounds(): void {
            this.#width = Number(window.getComputedStyle(this.element).width.replace("px", ""));
            this.#height = Number(window.getComputedStyle(this.element).height.replace("px", ""));
        }

        static get(taskID: string | HTMLElement): Window | null {
            if (taskID instanceof String || typeof taskID === "string") {
                return Window.windows.get(taskID as string) || null;
            } else if (taskID instanceof HTMLElement) {
                return Window.windows.get(taskID.id.replace("window_", "")) || null;
            } else {
                return null;
            }
        }

        private static updateWindowZIndexes(): void {
            let i = 0;
            // noinspection JSUnusedLocalSymbols
            for (const [key, value] of Window.windows.entries()) {
                value.zIndex = lowestWindowZIndex + i;
                Window.#focusedWindow = value;
                Window.focusedWindow.element.classList.remove("focused");

                i++;
            }
            Window.focusedWindow.element.classList.add("focused");
        }

        async focus(): Promise<void> {
            const w = Window;
            w.windows.delete(this.taskID);
            w.windows.set(this.taskID, this);
            w.updateWindowZIndexes();
        }

        async show(): Promise<void> {
            this.element.classList.add("opening");
            this.taskbarIcon.classList.add("appear");
            this.taskbarIcon.style.display = "flex";
            this.element.style.display = "flex";
            await delay(250);
            this.element.classList.remove("opening");
            this.taskbarIcon.classList.remove("appear");
            setTimeout(() => {
                this.updateIframes();
            }, 100);
        }

        async hide(): Promise<void> {
            this.element.classList.add("closing");
            this.taskbarIcon.classList.add("disappear");
            await delay(250);
            this.element.style.display = "none";
            this.taskbarIcon.style.display = "none";
            this.element.classList.remove("closing");
            this.taskbarIcon.classList.remove("disappear");
        }

        set height(height: number) {
            this.#height = height;
            this.element.style.height = height + "px";
        }

        set width(width: number) {
            this.#width = width;
            this.element.style.width = width + "px";
        }

        async close(): Promise<void> {
            this.element.classList.add("closing");
            this.taskbarIcon.classList.add("disappear");
            await delay(250);
            this.taskbarIcon.remove();
            this.element.remove();
            Window.windows.delete(this.taskID);
        }

        async maximize(): Promise<void> {
            this.updateBounds();
            if (this.maximized) {
                return;
            }

            this.prevWidth = this.#width;
            this.prevHeight = this.#height;

            this.prevTop = Number(this.element.style.top);
            this.prevLeft = Number(this.element.style.left);

            this.element.style.transition = "all 0.25s ease-in-out";

            this.element.style.width = "100%";
            this.element.style.height = "calc(100vh - 40px)";
            this.element.style.top = "0";
            this.element.style.left = "0";

            await delay(250)
            this.element.style.transition = "";

            this.maximizeButton.style.display = "none";
            this.restoreButton.style.display = "block";
            this.updateBounds();

            this.maximized = true;
        }

        async restore(): Promise<void> {
            this.updateBounds();
            if (!this.maximized) {
                return;
            }

            this.#height = this.prevHeight;
            this.#width = this.prevWidth;

            this.element.style.transition = "all 0.25s ease-in-out";

            this.element.style.width = this.#width + "px";
            this.element.style.height = this.#height + "px";
            this.element.style.top = String(this.prevTop);
            this.element.style.left = String(this.prevLeft);

            await delay(250);
            this.element.style.transition = "";

            this.prevHeight = undefined;
            this.prevWidth = undefined;
            this.prevTop = undefined;
            this.prevLeft = undefined;

            this.maximizeButton.style.display = "block";
            this.restoreButton.style.display = "none";
            this.updateBounds();

            this.maximized = false;
        }

        toggleMaximize(): void {
            if (this.maximized) {
                this.restore();
            } else {
                this.maximize();
            }
        }

        // Not implemented yet
        async minimize() {
        }

        // Task ID
        get taskID(): string {
            return this.element.id.replace("window_", "");
        }

        // Getters for window buttons
        get minimizeButton(): HTMLDivElement {
            return this.element.querySelector(".frame > .right > .minimize");
        }

        get maximizeButton(): HTMLDivElement {
            return this.element.querySelector(".frame > .right > .maximize");
        }

        get restoreButton(): HTMLDivElement {
            return this.element.querySelector(".frame > .right > .restore");
        }

        get closeButton(): HTMLDivElement {
            return this.element.querySelector(".frame > .right > .close");
        }

        // Make the window draggable
        #draggableWindow() {
            var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

            const frame: HTMLDivElement = this.element.querySelector(".frame");

            const obj = this;

            frame.addEventListener("mousedown", (e) => {
                dragMouseDown(e);
            });

            function dragMouseDown(e: MouseEvent) {
                obj.restore();
                obj.focus();
                frame.style.cursor = "var(--cur-move)";

                e.preventDefault();

                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }

            function elementDrag(e: MouseEvent) {
                e.preventDefault();
                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                // set the element's new position:
                obj.element.style.top = (obj.element.offsetTop - pos2) + "px";
                obj.element.style.left = (obj.element.offsetLeft - pos1) + "px";
            }

            function closeDragElement() {
                /* stop moving when mouse button is released:*/
                document.onmouseup = null;
                document.onmousemove = null;
                frame.style.cursor = "var(--cur-default)";
            }
        }

        // Getters for resizers
        get resizer_up(): HTMLDivElement {
            return this.element.querySelector(".resizer_up");
        }

        get resizer_right(): HTMLDivElement {
            return this.element.querySelector(".resizer_right");
        }

        get resizer_left(): HTMLDivElement {
            return this.element.querySelector(".resizer_left");
        }

        get resizer_bottom(): HTMLDivElement {
            return this.element.querySelector(".resizer_bottom");
        }

        get resizer_up_left(): HTMLDivElement {
            return this.element.querySelector(".resizer_up_left");
        }

        get resizer_up_right(): HTMLDivElement {
            return this.element.querySelector(".resizer_up_right");
        }

        get resizer_bottom_left(): HTMLDivElement {
            return this.element.querySelector(".resizer_bottom_left");
        }

        get resizer_bottom_right(): HTMLDivElement {
            return this.element.querySelector(".resizer_bottom_right");
        }

        // Resizers
        #resizer_up() {
            let pos1: number = 0;
            let pos2: number = 0;
            let pos3: number = 0;
            let pos4: number = 0;

            const obj = this;

            obj.resizer_up.addEventListener("mousedown", (e: MouseEvent) => {
                dragMouseDown(e);
            });


            function dragMouseDown(e: MouseEvent) {
                e.preventDefault();

                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }

            function elementDrag(e: MouseEvent) {
                e.preventDefault();

                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;

                const prevTop: number = Number(obj.element.style.top.replace("px", ""));

                // Update the top and height positions of the element based on the mouse movement
                obj.element.style.top = (obj.element.offsetTop - pos2) + "px";

                const val: number = Number(prevTop - Number(obj.element.style.top.replace("px", "")));
                obj.element.style.height = (obj.element.clientHeight + val) + "px";
            }
        }

        #resizer_right() {
            let pos1: number = 0;
            let pos2: number = 0;
            let pos3: number = 0;
            let pos4: number = 0;

            const obj = this;

            obj.resizer_right.addEventListener("mousedown", (e: MouseEvent) => {
                dragMouseDown(e);
            });


            function dragMouseDown(e: MouseEvent) {
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }

            function elementDrag(e: MouseEvent) {
                e.preventDefault();

                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;

                obj.element.style.width = (obj.element.offsetWidth - pos1) + "px";
            }
        }

        #resizer_bottom() {
            let pos1: number = 0;
            let pos2: number = 0;
            let pos3: number = 0;
            let pos4: number = 0;

            const obj = this;

            obj.resizer_bottom.addEventListener("mousedown", (e: MouseEvent) => {
                dragMouseDown(e);
            });


            function dragMouseDown(e: MouseEvent) {
                e.preventDefault();

                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }

            function elementDrag(e: MouseEvent) {
                e.preventDefault();

                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;

                obj.element.style.height = (obj.element.offsetHeight - pos2) + "px";
            }
        }

        #resizer_bottom_right() {
            let pos1: number = 0;
            let pos2: number = 0;
            let pos3: number = 0;
            let pos4: number = 0;

            const obj = this;

            obj.resizer_bottom_right.addEventListener("mousedown", (e: MouseEvent) => {
                dragMouseDown(e);
            });


            function dragMouseDown(e: MouseEvent) {
                e.preventDefault();

                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }

            function elementDrag(e: MouseEvent) {
                e.preventDefault();

                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;

                obj.element.style.height = (obj.element.offsetHeight - pos2) + "px";
                obj.element.style.width = (obj.element.offsetWidth - pos1) + "px";
            }
        }

        #resizer_left() {
            let pos1: number = 0;
            let pos2: number = 0;
            let pos3: number = 0;
            let pos4: number = 0;

            const obj = this;

            obj.resizer_left.addEventListener("mousedown", (e: MouseEvent) => {
                dragMouseDown(e);
            });


            function dragMouseDown(e: MouseEvent) {
                e.preventDefault();

                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }

            function elementDrag(e: MouseEvent) {
                e.preventDefault();

                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;

                obj.element.style.left = (obj.element.offsetLeft - pos1) + "px";
                obj.element.style.width = (obj.element.offsetWidth + pos1) + "px";
            }
        }

        #resizer_bottom_left() {
            let pos1: number = 0;
            let pos2: number = 0;
            let pos3: number = 0;
            let pos4: number = 0;

            const obj = this;

            obj.resizer_bottom_left.addEventListener("mousedown", (e: MouseEvent) => {
                dragMouseDown(e);
            });


            function dragMouseDown(e: MouseEvent) {
                e.preventDefault();

                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }

            function elementDrag(e: MouseEvent) {
                e.preventDefault();

                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;

                obj.element.style.left = (obj.element.offsetLeft - pos1) + "px";
                obj.element.style.width = (obj.element.offsetWidth + pos1) + "px";
                obj.element.style.height = (obj.element.offsetHeight - pos2) + "px";
            }
        }

        #resizer_top_left() {
            let pos1: number = 0;
            let pos2: number = 0;
            let pos3: number = 0;
            let pos4: number = 0;

            const obj = this;

            obj.resizer_up_left.addEventListener("mousedown", (e: MouseEvent) => {
                dragMouseDown(e);
            });


            function dragMouseDown(e: MouseEvent) {
                e.preventDefault();

                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }

            function elementDrag(e: MouseEvent) {
                e.preventDefault();

                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;

                obj.element.style.height = (obj.element.offsetHeight + pos2) + "px";
                obj.element.style.top = (obj.element.offsetTop - pos2) + "px";
                obj.element.style.left = (obj.element.offsetLeft - pos1) + "px";
                obj.element.style.width = (obj.element.offsetWidth + pos1) + "px";
            }
        }

        #resizer_top_right() {
            let pos1: number = 0;
            let pos2: number = 0;
            let pos3: number = 0;
            let pos4: number = 0;

            const obj = this;

            obj.resizer_up_right.addEventListener("mousedown", (e: MouseEvent) => {
                dragMouseDown(e);
            });


            function dragMouseDown(e: MouseEvent) {
                e.preventDefault();

                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }

            function elementDrag(e: MouseEvent) {
                e.preventDefault();

                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;

                obj.element.style.height = (obj.element.offsetHeight + pos2) + "px";
                obj.element.style.top = (obj.element.offsetTop - pos2) + "px";
                obj.element.style.width = (obj.element.offsetWidth - pos1) + "px";
            }
        }
    }

    export class IconTextDialog extends Window {
        constructor(
            title: string,
            width: number,
            height: number,
            _message: string,
            _icon?: string,
            _actions?: Action[],
        ) {
            super({title: title, width: width, height: height, icon: _icon});

            this.minHeight = 130;
            this.minWidth = 315;

            const content = this.content;
            content.classList.add("icon_text_dialog");

            const icon = document.createElement("div");
            icon.classList.add("icon_img");
            content.appendChild(icon);
            this.icon = _icon;

            const message = document.createElement('div');
            message.classList.add("message");
            content.appendChild(message);
            this.message = _message;

            const actions_html = document.createElement("div");
            actions_html.classList.add("actions");
            content.appendChild(actions_html);
            this.actions = _actions;

            this.content = content;
        }

        get actions() {
            const ret: Action[] = [];

            for (let i = 0; i < this.actions_html.children.length; i++) {
                const element = this.actions_html.children[i];

                const name = element.innerHTML;

                var callback: Function = () => {
                };

                try {
                    // noinspection JSUnresolvedReference
                    // @ts-ignore
                    callback = getEventListeners(element).click[0].listener;
                } catch (ignore) {
                    console.warn("Couldn't get event listeners, are you using Chrome?");
                }

                if (!(callback instanceof Function || typeof callback == 'function')) {
                    callback = () => {
                    };
                }

                ret.push(new Action(name, callback));
            }

            return ret;
        }

        set actions(_actions: Action[]) {
            this.actions_html.innerHTML = "";

            this.actions_html.classList.add("actions");
            _actions.forEach(element => {
                let el = document.createElement("button");
                el.classList.add("action");

                el.innerHTML = element.name;
                el.addEventListener('click', () => {
                    element.callback();
                    this.close();
                });

                this.actions_html.appendChild(el);
            });
        }

        get actions_html() {
            return this.element.querySelector('.content > .actions');
        }

        get icon(): string {
            return (this.element.querySelector('.content > .icon_img') as HTMLElement).dataset.type;
        }

        set icon(_icon: string) {
            (this.element.querySelector('.content > .icon_img') as HTMLElement).dataset.type = _icon;
        }

        // noinspection JSUnusedGlobalSymbols
        get message(): string {
            return this.element.querySelector('.content > .message').innerHTML;
        }

        set message(_message: string) {
            this.element.querySelector('.content > .message').innerHTML = _message;
        }
    }

    export class WarningDialog extends IconTextDialog {
        constructor(
            title: string,
            width: number,
            height: number,
            message: string,
            actions: Action[]
        ) {
            actions = actions || [];

            super(title, width, height, message, "warning", actions);
        }
    }

    export class ErrorDialog extends IconTextDialog {
        constructor(
            title: string,
            width: number,
            height: number,
            message: string,
            actions?: Action[]
        ) {
            actions = actions || OKAction;
            super(title, width, height, message, "error", actions);
        }

        async show(): Promise<void> {
            try {
                new Audio("HtmlOS/Media/error.wav").play();
            } catch (ignore) {}
            await super.show();
        }
    }

    export class EmptyWindow extends Window {
        constructor() {
            super({width: 0, height: 0, closeButton: false, maximizeButton: false, minimizeButton: false});
        }

        async show(): Promise<void> {}
        async hide(): Promise<void> {}
    }
}