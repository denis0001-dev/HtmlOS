// noinspection DuplicatedCode,JSUnusedGlobalSymbols
const windows = new Map();
const tasks = new Map();
// noinspection JSUnusedGlobalSymbols
function getWindow(taskID) {
    if (taskID instanceof String || typeof taskID === "string") {
        return windows.get(taskID) || null;
    }
    else if (taskID instanceof HTMLElement) {
        return windows.get(taskID.id.replace("window_", "")) || null;
    }
    else {
        return null;
    }
}
function getTask(taskID) {
    if (taskID instanceof String || typeof taskID == "string") {
        return tasks.get(taskID) || null;
    }
    else if (taskID instanceof HTMLElement) {
        return tasks.get(taskID.id.replace("task-", "")) || null;
    }
    else {
        return null;
    }
}
class Task {
    func;
    taskID;
    constructor(func) {
        this.func = func;
        this.taskID = generateRandomString(8);
        tasks.set(this.taskID, this);
        this.execute();
    }
    async execute() {
        return await this.func();
    }
    finish() {
        tasks.delete(this.taskID);
    }
}
class EmptyTask extends Task {
    constructor() {
        super(() => { });
    }
}
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
class DesktopWindow {
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
    constructor(title, initialWidth, initialHeight, closeButton, maximizeButton, minimizeButton, icon, content = undefined) {
        this.element = document.createElement("div");
        this.element.classList.add("window");
        this.width = initialWidth;
        this.height = initialHeight;
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
        else if (content instanceof String || typeof content == "string") {
            this.content = document.createElement("div");
            this.content.classList.add("content");
            this.content.innerHTML = content;
        }
        else {
            try {
                this.content = document.createElement("div");
                this.content.classList.add("content");
                this.content.innerHTML = content.toString();
            }
            catch (ignore) {
                throw new TypeError("Invalid content type");
            }
        }
        // Focus
        this.element.addEventListener('click', () => {
            // const target = e.target;
            // console.log(target);
            // TODO click after focus
            this.focus();
            // if (target === this.element) return;
            // target.dispatchEvent(new Event("click"));
        });
        // Hide buttons that don't need to be shown
        if (!closeButton)
            this.closeButton.style.display = 'none';
        if (!maximizeButton)
            this.maximizeButton.style.display = 'none';
        if (!minimizeButton)
            this.minimizeButton.style.display = 'none';
        // Button actions
        this.closeButton.addEventListener('click', () => { this.close(); });
        this.maximizeButton.addEventListener('click', () => { this.toggleMaximize(); });
        this.minimizeButton.addEventListener('click', () => { this.minimize(); });
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
        windows.set(this.taskID, this);
    }
    get width() {
        this.updateBounds();
        return this.#width;
    }
    get height() {
        this.updateBounds();
        return this.#height;
    }
    get title() {
        return this.#title;
    }
    set title(title) {
        this.#title = title;
        this.element.querySelector(".frame > .left > .title").innerHTML = title;
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
    updateBounds() {
        this.#width = Number(window.getComputedStyle(this.element).width.replace("px", ""));
        this.#height = Number(window.getComputedStyle(this.element).height.replace("px", ""));
    }
    async focus() {
        const windows = document.querySelector("#windows");
        if (windows.childNodes[windows.childNodes.length - 1] === this.element)
            return;
        await delay(1);
        windows.appendChild(this.element);
    }
    async show() {
        this.element.classList.add("opening");
        this.taskbarIcon.classList.add("appear");
        this.taskbarIcon.style.display = "flex";
        this.element.style.display = "flex";
        await delay(250);
        this.element.classList.remove("opening");
        this.taskbarIcon.classList.remove("appear");
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
        windows.delete(this.taskID);
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
    async minimize() { }
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
class IconTextDialog extends DesktopWindow {
    constructor(title, width, height, _message, _actions, _icon) {
        super(title, width, height, true, false, false, _icon, null);
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
            var callback = () => { };
            try {
                // noinspection JSUnresolvedReference
                // @ts-ignore
                callback = getEventListeners(element).click[0].listener;
            }
            catch (ignore) {
                console.warn("Couldn't get event listeners, are you using Chrome?");
            }
            if (!(callback instanceof Function || typeof callback == 'function')) {
                callback = () => { };
            }
            ret.push(new Action(name, callback));
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
class WarningDialog extends IconTextDialog {
    constructor(title, width, height, message, actions) {
        actions = actions || [];
        super(title, width, height, message, actions, "warning");
    }
}
class ErrorDialog extends IconTextDialog {
    constructor(title, width, height, message, actions) {
        actions = actions || [];
        super(title, width, height, message, actions, "error");
        new Audio("HtmlOS/Media/error.wav").play();
    }
}
class EmptyWindow extends DesktopWindow {
    constructor() {
        super("", 0, 0, false, false, false, "none");
    }
    async show() { }
    async hide() { }
}
