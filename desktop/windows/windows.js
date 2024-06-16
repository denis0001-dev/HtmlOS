const windows = new Map();
const tasks = new Map();

function getWindow(taskID) {
    if (taskID instanceof String) {
        return windows.get(taskID);
    } else if (taskID instanceof HTMLElement) {
        return windows.get(taskID.id.replace("window_", ""));
    } else {
        return null;
    }
}


function getTask(taskID) {
    if (taskID instanceof String || typeof taskID == "string") {
        return tasks.get(taskID);
    } else if (taskID instanceof HTMLElement) {
        return tasks.get(taskID.id.replace("task-", ""));
    } else {
        return null;
    }
}

class Task {
    #window;
    #taskbarIcon;

    #func;

    #taskID;

    constructor(window, taskbarIcon, func) {
        this.#func = func;
        this.#window = window;
        this.#taskbarIcon = taskbarIcon;

        this.#taskID = generateRandomString(8);

        tasks.set(this.#taskID, this);

        this.execute();
    }

    get window() {
        return this.#window;
    }

    set window(window) {
        this.#window = window;
    }

    get taskbarIcon() {
        return this.#taskbarIcon;
    }

    set taskbarIcon(taskbarIcon) {
        this.#taskbarIcon = taskbarIcon;
    }

    get func() {
        return this.#func;
    }

    set func(_func) {
        throw new Error("Function is final");
    }

    get taskID() {
        return this.#taskID;
    }

    async execute() {
        this.func();
    }

    finish() {
        tasks.delete(this.#taskID);
    }
}

class DesktopWindow {
    element;
    #width;
    #height;
    title;

    // Window maximizing & restoring
    #prevWidth;
    #prevHeight;
    #prevTop;
    #prevLeft;

    #maximized = false;
    
    constructor(title, initialWidth, initialHeight, closeButton, maximizeButton, minimizeButton, icon) {
        this.title = title;

        this.#width = initialWidth;
        this.#height = initialHeight;

        this.element = document.createElement("div");
        this.element.classList.add("window");

        this.element.style.width = this.#width + "px";
        this.element.style.height = this.#height + "px";

        // Fallback icon
        if ([undefined, null, ""].includes(icon)) {
            icon = "application";
        }

        // Create an icon on the taskbar for the window
        const task = new Task(this, null, () => {});
        
        this.element.id = "window_" + task.taskID;

        const taskIcon = document.createElement("div");
        taskIcon.classList.add("task");
        taskIcon.id = "task-" + task.taskID;

        taskIcon.innerHTML = `
        <div class="icon_img" data-type="${icon}"></div>
        <div class="underline"></div>
        `

        taskIcon.addEventListener('click', () => {
            this.maximize();
        });

        task.taskbarIcon = taskIcon;

        taskIcon.style.display = 'none';

        document.getElementById("tasks").appendChild(taskIcon);

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
        `

        // Hide buttons that don't need to be shown
        if (!closeButton) this.closeButton.style.display = 'none';
        if (!maximizeButton) this.maximizeButton.style.display = 'none';
        if (!minimizeButton) this.minimizeButton.style.display = 'none';

        // Button actions
        this.closeButton.addEventListener('click', () => {
            this.close();
        })

        this.maximizeButton.addEventListener('click', () => {
            this.toggleMaximize();
        })

        this.minimizeButton.addEventListener('click', () => {
            this.minimize();
        })

        this.element.style.display = 'none';

        // Center the window
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        this.element.style.top = `${(screenHeight - this.#height) / 2}px`
        this.element.style.left = `${(screenWidth - this.#width) / 2}px`

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

    get element() {
        return this.element;
    }

    get width() {
        this.#updateBounds();
        return this.#width;
    }

    get height() {
        this.#updateBounds();
        return this.#height;
    }

    get title() {
        return this.title;
    }

    set title(title) {
        this.title = title;
        this.element.querySelector(".frame > .left > .title").innerHTML = title;
    }

    get icon() {
        return this.element.querySelector(".frame > .left > .icon_img").dataset.type;
    }

    set icon(icon) {
        this.element.querySelector(".frame > .left > .icon_img").dataset.type = icon;
    }

    get taskbarIcon() {
        return getTask(this.taskID).taskbarIcon;
    }

    #updateBounds() {
        this.#width = Number(window.getComputedStyle(this.element).width.replace("px", ""));
        this.#height = Number(window.getComputedStyle(this.element).height.replace("px",""));
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

    close() {
        this.element.classList.add("closing");
        this.taskbarIcon.classList.add("disappear");
        setTimeout(() => {
            this.element.remove();
            this.taskbarIcon.remove();
            windows.delete(this.taskID);
            getTask(this.taskID).finish();
        }, 250);
    }

    async maximize() {
        this.#updateBounds();
        if (this.#maximized) {
            return;
        }

        this.#prevWidth = this.#width;
        this.#prevHeight = this.#height;

        this.#prevTop = this.element.style.top;
        this.#prevLeft = this.element.style.left;

        this.element.style.transition = "all 0.25s ease-in-out";

        this.element.style.width = "100%";
        this.element.style.height = "calc(100vh - 40px)";
        this.element.style.top = "0";
        this.element.style.left = "0";

        await delay(250)
        this.element.style.transition = "";

        this.maximizeButton.style.display = "none";
        this.restoreButton.style.display = "block";
        this.#updateBounds();

        this.#maximized = true;
    }

    async restore() {
        this.#updateBounds();
        if (!this.#maximized) {
            return;
        }

        this.#height = this.#prevHeight;
        this.#width = this.#prevWidth;

        this.element.style.transition = "all 0.25s ease-in-out";
    
        this.element.style.width = this.#width + "px";
        this.element.style.height = this.#height + "px";
        this.element.style.top = this.#prevTop;
        this.element.style.left = this.#prevLeft;

        await delay(250);
        this.element.style.transition = "";

        this.#prevHeight = undefined;
        this.#prevWidth = undefined;
        this.#prevTop = undefined;
        this.#prevLeft = undefined;

        this.maximizeButton.style.display = "block";
        this.restoreButton.style.display = "none";
        this.#updateBounds();

        this.#maximized = false;
    }

    toggleMaximize() {
        if (this.#maximized) {
            this.restore();
        } else {
            this.maximize();
        }
    }

    async minimize() {
        
    }

    // Task ID
    get taskID() {
        return this.element.id.replace("window_", "");
    }

    set taskID(_taskID) {
        throw new Error("Task ID is final, cannot be changed");
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
            frame.style.cursor = "var(--cur-move)";
            e = e || window.event;
            e.preventDefault();

            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
            e = e || window.event;
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
        var pos1, pos2, pos3, pos4 = 0;

        const obj = this;

        obj.resizer_up.addEventListener("mousedown", (e) => {
            dragMouseDown(e);
        });


        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
        
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
        
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            const prevTop = obj.element.style.top.replace("px", "");
        
            // Update the top and height positions of the element based on the mouse movement
            obj.element.style.top = (obj.element.offsetTop - pos2) + "px";

            const val = Number(prevTop - obj.element.style.top.replace("px", ""));
            obj.element.style.height = (obj.element.clientHeight + val) + "px";
        }
    }

    #resizer_right() {
        var pos1, pos2, pos3, pos4 = 0;

        const obj = this;

        obj.resizer_right.addEventListener("mousedown", (e) => {
            dragMouseDown(e);
        });


        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
        
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
            e = e || window.event;
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
        var pos1, pos2, pos3, pos4 = 0;

        const obj = this;

        obj.resizer_bottom.addEventListener("mousedown", (e) => {
            dragMouseDown(e);
        });


        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
        
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
            e = e || window.event;
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
        var pos1, pos2, pos3, pos4 = 0;

        const obj = this;

        obj.resizer_bottom_right.addEventListener("mousedown", (e) => {
            dragMouseDown(e);
        });


        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
        
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
            e = e || window.event;
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
        var pos1, pos2, pos3, pos4 = 0;

        const obj = this;

        obj.resizer_left.addEventListener("mousedown", (e) => {
            dragMouseDown(e);
        });


        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
        
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
            e = e || window.event;
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
        var pos1, pos2, pos3, pos4 = 0;

        const obj = this;

        obj.resizer_bottom_left.addEventListener("mousedown", (e) => {
            dragMouseDown(e);
        });


        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
        
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
            e = e || window.event;
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
        var pos1, pos2, pos3, pos4 = 0;

        const obj = this;

        obj.resizer_up_left.addEventListener("mousedown", (e) => {
            dragMouseDown(e);
        });


        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
        
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
            e = e || window.event;
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
        var pos1, pos2, pos3, pos4 = 0;

        const obj = this;

        obj.resizer_up_right.addEventListener("mousedown", (e) => {
            dragMouseDown(e);
        });


        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
        
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
            e = e || window.event;
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