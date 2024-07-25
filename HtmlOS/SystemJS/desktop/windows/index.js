// noinspection DuplicatedCode,JSUnusedGlobalSymbols
/// <reference path="../index.ts" />
var system;
(function (system) {
    var generateRandomString = utils.generateRandomString;
    /**
     * @deprecated
     * @param taskID
     */
    function getTask(taskID) {
        return Task.get(taskID);
    }
    system.getTask = getTask;
    class Task {
        static tasks = new Map();
        func;
        taskID;
        constructor(func) {
            this.func = func;
            this.taskID = generateRandomString(8);
            Task.tasks.set(this.taskID, this);
            this.execute();
        }
        async execute() {
            return await this.func();
        }
        finish() {
            Task.tasks.delete(this.taskID);
        }
        /* static get(taskID: string): Task | null;
        static get(taskID: HTMLElement): Task | null; */
        static get(taskID) {
            if (taskID instanceof String || typeof taskID == "string") {
                return Task.tasks.get(taskID) || null;
            }
            else if (taskID instanceof HTMLElement) {
                return Task.tasks.get(taskID.id.replace("task-", "")) || null;
            }
            else {
                return null;
            }
        }
    }
    system.Task = Task;
    class EmptyTask extends Task {
        constructor() {
            super(() => {
            });
        }
    }
    system.EmptyTask = EmptyTask;
})(system || (system = {}));
var desktop;
(function (desktop) {
    var EmptyTask = system.EmptyTask;
    var empty = utils.empty;
    var delay = utils.delay;
    var closeDragElement = utils.html.closeDragElement;
    document.addEventListener("DOMContentLoaded", () => {
        desktop.OKAction = [new desktop.Action("OK", empty)];
    });
    /**
     * @deprecated
     * @param taskID
     */
    function getWindow(taskID) {
        return Window.get(taskID);
    }
    desktop.getWindow = getWindow;
    // Focus
    desktop.lowestWindowZIndex = 2;
    class WindowTask extends EmptyTask {
        window;
        taskbarIcon;
        constructor(window, taskbarIcon) {
            super();
            this.window = window;
            this.taskbarIcon = taskbarIcon;
        }
    }
    // noinspection JSUnusedGlobalSymbols
    class Window {
        static windows = new Map();
        static #focusedWindow = null;
        static get focusedWindow() {
            return Window.#focusedWindow;
        }
        #config;
        element;
        #width;
        #height;
        #title;
        // Window maximizing & restoring
        prevWidth;
        prevHeight;
        prevTop;
        prevLeft;
        maximized = false;
        // Task
        task;
        constructor(config) {
            let title = config.title || "";
            let initialWidth = config.width;
            let initialHeight = config.height;
            let closeButton = [true, undefined, null].includes(config.closeButton);
            let maximizeButton = [true, undefined, null].includes(config.maximizeButton);
            let minimizeButton = [true, undefined, null].includes(config.minimizeButton);
            let icon = config.icon;
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
            const task = new WindowTask(this, null);
            this.element.id = "window_" + task.taskID;
            const taskIcon = document.createElement("div");
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
            }
            else if (content instanceof HTMLElement) {
                this.content = content;
            }
            else if (content instanceof HTMLCollection) {
                this.content = document.createElement("div");
                this.content.classList.add("content");
                this.content.append(...content);
            }
            else if (typeof content === "string") {
                this.content = document.createElement("div");
                this.content.classList.add("content");
                this.content.innerHTML = content;
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
            if (!closeButton)
                this.closeButton.style.display = 'none';
            if (!maximizeButton)
                this.maximizeButton.style.display = 'none';
            if (!minimizeButton)
                this.minimizeButton.style.display = 'none';
            // Button actions
            this.closeButton.addEventListener('click', () => {
                this.close();
            });
            this.maximizeButton.addEventListener('click', () => {
                this.toggleMaximize();
            });
            this.minimizeButton.addEventListener('click', () => {
                this.minimize();
            });
            this.element.style.display = 'none';
            // Center the window
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            this.element.style.top = `${(screenHeight - this.height) / 2}px`;
            this.element.style.left = `${(screenWidth - this.width) / 2}px`;
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
        get width() {
            this.updateBounds();
            return this.#width;
        }
        get height() {
            this.updateBounds();
            return this.#height;
        }
        updateIframes() {
            this.element.querySelectorAll("iframe").forEach(async (item) => {
                console.log(item);
                item.contentWindow.addEventListener("click", () => {
                    this.focus();
                });
                const style = document.createElement("style");
                // noinspection CssUnknownTarget
                style.textContent = `
                @import url("${(await fetch("HtmlOS/Fonts/Segoe%20UI/stylesheet.css")).url}");
                @import url("${(await fetch("HtmlOS/Cursors/cursors.css")).url}");
                body {
                    cursor: var(--cur-default);
                }
                `;
                item.contentDocument.head.appendChild(style);
                item.contentWindow.console = window.console;
                let iframeRect = item.getBoundingClientRect();
                console.debug(iframeRect);
                item.contentWindow.addEventListener("click", (e) => {
                    iframeRect = item.getBoundingClientRect();
                    const x = Math.round(iframeRect.x) + e.clientX;
                    const y = Math.round(iframeRect.y) + e.clientY;
                    console.debug(x, y);
                    const event = new MouseEvent("click", {
                        button: e.button,
                        buttons: e.buttons,
                        clientX: x,
                        clientY: y,
                        screenX: e.screenX,
                        screenY: e.screenY
                    });
                    item.dispatchEvent(event);
                });
                item.contentWindow.addEventListener("contextmenu", (e) => {
                    item.getBoundingClientRect();
                    const x = Math.round(iframeRect.x) + e.clientX;
                    const y = Math.round(iframeRect.y) + e.clientY;
                    console.debug(x, y);
                    const event = new MouseEvent("contextmenu", {
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
        get title() {
            return this.#title;
        }
        set title(title) {
            this.#title = title;
            this.element.querySelector(".frame > .left > .title").innerHTML = title;
        }
        get config() {
            return this.#config;
        }
        set config(config) {
            this.#config = config;
        }
        get icon() {
            return this.element.querySelector(".frame > .left > .icon_img").dataset.type;
        }
        set icon(icon) {
            this.element.querySelector(".frame > .left > .icon_img").dataset.type = icon;
        }
        get taskbarIcon() {
            return this.task.taskbarIcon;
        }
        get content() {
            return this.element.getElementsByClassName("content")[0];
        }
        set content(content) {
            this.content.remove();
            this.element.appendChild(content);
        }
        get minWidth() {
            return Number(window.getComputedStyle(this.element).minWidth.replace("px", ""));
        }
        set minWidth(minWidth) {
            this.element.style.minWidth = minWidth + "px";
        }
        get minHeight() {
            return Number(window.getComputedStyle(this.element).minHeight.replace("px", ""));
        }
        set minHeight(minHeight) {
            this.element.style.minHeight = minHeight + "px";
        }
        get maxWidth() {
            const value = getComputedStyle(this.element).maxWidth.replace("px", "");
            return value === "none" ? -1 : Number(value);
        }
        set maxWidth(maxWidth) {
            this.element.style.maxWidth = maxWidth !== -1 ? maxWidth + "px" : "none";
        }
        get maxHeight() {
            const value = getComputedStyle(this.element).maxHeight.replace("px", "");
            return value === "none" ? -1 : Number(value);
        }
        set maxHeight(maxHeight) {
            this.element.style.maxHeight = maxHeight !== -1 ? maxHeight + "px" : "none";
        }
        get zIndex() {
            return Number(this.element.style.zIndex);
        }
        set zIndex(zIndex) {
            this.element.style.zIndex = zIndex.toString();
        }
        updateBounds() {
            this.#width = Number(window.getComputedStyle(this.element).width.replace("px", ""));
            this.#height = Number(window.getComputedStyle(this.element).height.replace("px", ""));
        }
        static get(taskID) {
            if (taskID instanceof String || typeof taskID === "string") {
                return Window.windows.get(taskID) || null;
            }
            else if (taskID instanceof HTMLElement) {
                return Window.windows.get(taskID.id.replace("window_", "")) || null;
            }
            else {
                return null;
            }
        }
        static updateWindowZIndexes() {
            let i = 0;
            // noinspection JSUnusedLocalSymbols
            for (const [key, value] of Window.windows.entries()) {
                value.zIndex = desktop.lowestWindowZIndex + i;
                Window.#focusedWindow = value;
                Window.focusedWindow.element.classList.remove("focused");
                i++;
            }
            Window.focusedWindow.element.classList.add("focused");
        }
        async focus() {
            const w = Window;
            w.windows.delete(this.taskID);
            w.windows.set(this.taskID, this);
            w.updateWindowZIndexes();
        }
        async show() {
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
        async hide() {
            this.element.classList.add("closing");
            this.taskbarIcon.classList.add("disappear");
            await delay(250);
            this.element.style.display = "none";
            this.taskbarIcon.style.display = "none";
            this.element.classList.remove("closing");
            this.taskbarIcon.classList.remove("disappear");
        }
        set height(height) {
            this.#height = height;
            this.element.style.height = height + "px";
        }
        set width(width) {
            this.#width = width;
            this.element.style.width = width + "px";
        }
        async close() {
            this.element.classList.add("closing");
            this.taskbarIcon.classList.add("disappear");
            await delay(250);
            this.taskbarIcon.remove();
            this.element.remove();
            Window.windows.delete(this.taskID);
        }
        async maximize() {
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
            await delay(250);
            this.element.style.transition = "";
            this.maximizeButton.style.display = "none";
            this.restoreButton.style.display = "block";
            this.updateBounds();
            this.maximized = true;
        }
        async restore() {
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
        toggleMaximize() {
            if (this.maximized) {
                this.restore();
            }
            else {
                this.maximize();
            }
        }
        // Not implemented yet
        async minimize() {
        }
        // Task ID
        get taskID() {
            return this.element.id.replace("window_", "");
        }
        // Getters for window buttons
        get minimizeButton() {
            return this.element.querySelector(".frame > .right > .minimize");
        }
        get maximizeButton() {
            return this.element.querySelector(".frame > .right > .maximize");
        }
        get restoreButton() {
            return this.element.querySelector(".frame > .right > .restore");
        }
        get closeButton() {
            return this.element.querySelector(".frame > .right > .close");
        }
        // Make the window draggable
        #draggableWindow() {
            var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            const frame = this.element.querySelector(".frame");
            const obj = this;
            frame.addEventListener("mousedown", (e) => {
                dragMouseDown(e);
            });
            function dragMouseDown(e) {
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
            function elementDrag(e) {
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
        get resizer_up() {
            return this.element.querySelector(".resizer_up");
        }
        get resizer_right() {
            return this.element.querySelector(".resizer_right");
        }
        get resizer_left() {
            return this.element.querySelector(".resizer_left");
        }
        get resizer_bottom() {
            return this.element.querySelector(".resizer_bottom");
        }
        get resizer_up_left() {
            return this.element.querySelector(".resizer_up_left");
        }
        get resizer_up_right() {
            return this.element.querySelector(".resizer_up_right");
        }
        get resizer_bottom_left() {
            return this.element.querySelector(".resizer_bottom_left");
        }
        get resizer_bottom_right() {
            return this.element.querySelector(".resizer_bottom_right");
        }
        // Resizers
        #resizer_up() {
            let pos1 = 0;
            let pos2 = 0;
            let pos3 = 0;
            let pos4 = 0;
            const obj = this;
            obj.resizer_up.addEventListener("mousedown", (e) => {
                dragMouseDown(e);
            });
            function dragMouseDown(e) {
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }
            function elementDrag(e) {
                e.preventDefault();
                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                const prevTop = Number(obj.element.style.top.replace("px", ""));
                // Update the top and height positions of the element based on the mouse movement
                obj.element.style.top = (obj.element.offsetTop - pos2) + "px";
                const val = Number(prevTop - Number(obj.element.style.top.replace("px", "")));
                obj.element.style.height = (obj.element.clientHeight + val) + "px";
            }
        }
        #resizer_right() {
            let pos1 = 0;
            let pos2 = 0;
            let pos3 = 0;
            let pos4 = 0;
            const obj = this;
            obj.resizer_right.addEventListener("mousedown", (e) => {
                dragMouseDown(e);
            });
            function dragMouseDown(e) {
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }
            function elementDrag(e) {
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
            let pos1 = 0;
            let pos2 = 0;
            let pos3 = 0;
            let pos4 = 0;
            const obj = this;
            obj.resizer_bottom.addEventListener("mousedown", (e) => {
                dragMouseDown(e);
            });
            function dragMouseDown(e) {
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }
            function elementDrag(e) {
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
            let pos1 = 0;
            let pos2 = 0;
            let pos3 = 0;
            let pos4 = 0;
            const obj = this;
            obj.resizer_bottom_right.addEventListener("mousedown", (e) => {
                dragMouseDown(e);
            });
            function dragMouseDown(e) {
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }
            function elementDrag(e) {
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
            let pos1 = 0;
            let pos2 = 0;
            let pos3 = 0;
            let pos4 = 0;
            const obj = this;
            obj.resizer_left.addEventListener("mousedown", (e) => {
                dragMouseDown(e);
            });
            function dragMouseDown(e) {
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }
            function elementDrag(e) {
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
            let pos1 = 0;
            let pos2 = 0;
            let pos3 = 0;
            let pos4 = 0;
            const obj = this;
            obj.resizer_bottom_left.addEventListener("mousedown", (e) => {
                dragMouseDown(e);
            });
            function dragMouseDown(e) {
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }
            function elementDrag(e) {
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
            let pos1 = 0;
            let pos2 = 0;
            let pos3 = 0;
            let pos4 = 0;
            const obj = this;
            obj.resizer_up_left.addEventListener("mousedown", (e) => {
                dragMouseDown(e);
            });
            function dragMouseDown(e) {
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }
            function elementDrag(e) {
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
            let pos1 = 0;
            let pos2 = 0;
            let pos3 = 0;
            let pos4 = 0;
            const obj = this;
            obj.resizer_up_right.addEventListener("mousedown", (e) => {
                dragMouseDown(e);
            });
            function dragMouseDown(e) {
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }
            function elementDrag(e) {
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
    desktop.Window = Window;
    class IconTextDialog extends Window {
        constructor(title, width, height, _message, _icon, _actions) {
            super({ title: title, width: width, height: height, icon: _icon });
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
            const ret = [];
            for (let i = 0; i < this.actions_html.children.length; i++) {
                const element = this.actions_html.children[i];
                const name = element.innerHTML;
                var callback = () => {
                };
                try {
                    // noinspection JSUnresolvedReference
                    // @ts-ignore
                    callback = getEventListeners(element).click[0].listener;
                }
                catch (ignore) {
                    console.warn("Couldn't get event listeners, are you using Chrome?");
                }
                if (!(callback instanceof Function || typeof callback == 'function')) {
                    callback = () => {
                    };
                }
                ret.push(new desktop.Action(name, callback));
            }
            return ret;
        }
        set actions(_actions) {
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
        get icon() {
            return this.element.querySelector('.content > .icon_img').dataset.type;
        }
        set icon(_icon) {
            this.element.querySelector('.content > .icon_img').dataset.type = _icon;
        }
        // noinspection JSUnusedGlobalSymbols
        get message() {
            return this.element.querySelector('.content > .message').innerHTML;
        }
        set message(_message) {
            this.element.querySelector('.content > .message').innerHTML = _message;
        }
    }
    desktop.IconTextDialog = IconTextDialog;
    class WarningDialog extends IconTextDialog {
        constructor(title, width, height, message, actions) {
            actions = actions || [];
            super(title, width, height, message, "warning", actions);
        }
    }
    desktop.WarningDialog = WarningDialog;
    class ErrorDialog extends IconTextDialog {
        constructor(title, width, height, message, actions) {
            actions = actions || desktop.OKAction;
            super(title, width, height, message, "error", actions);
        }
        async show() {
            try {
                new Audio("HtmlOS/Media/error.wav").play();
            }
            catch (ignore) { }
            await super.show();
        }
    }
    desktop.ErrorDialog = ErrorDialog;
    class EmptyWindow extends Window {
        constructor() {
            super({ width: 0, height: 0, closeButton: false, maximizeButton: false, minimizeButton: false });
        }
        async show() { }
        async hide() { }
    }
    desktop.EmptyWindow = EmptyWindow;
})(desktop || (desktop = {}));
