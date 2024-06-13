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
    
    constructor(title, initialWidth, initialHeight, closeButton, maximizeButton, minimizeButton) {
        this.title = title;

        this.#width = initialWidth;
        this.#height = initialHeight;

        this.element = document.createElement("div");
        this.element.classList.add("window");

        this.element.style.width = this.#width + "px";
        this.element.style.height = this.#height + "px";



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
                    <div class="icon"></div>
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
            // Not implemented yet
        })

        this.hide();

        // Center the window
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        this.element.style.top = `${(screenHeight - this.#height) / 2}px`
        this.element.style.left = `${(screenWidth - this.#width) / 2}px`

        // Draggable window
        this.#draggableWindow();

        document.getElementById("windows").appendChild(this.element);
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
        this.element.querySelector(".title").innerHTML = title;
    }

    #updateBounds() {
        this.#width = Number(this.element.style.width.replace("px", ""));
        this.#height = Number(this.element.style.height.replace("px",""));
    }

    async show() {
        this.element.classList.add("opening");
        this.element.style.display = "flex";
        await delay(250);
        this.element.classList.remove("opening");
    }

    async hide() {
        // TODO make this work
        /* this.element.classList.add("closing");
        await delay(250);
        this.element.classList.remove("closing"); */
        this.element.style.display = "none";
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
        setTimeout(() => {
            this.element.remove();
        }, 250);
    }

    async maximize() {
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

    #draggableWindow() {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        const frame = this.element.querySelector(".frame");

        const obj = this;

        frame.addEventListener("mousedown", (e) => {
            dragMouseDown(e);
        });

        function dragMouseDown(e) {
            obj.restore();
            frame.style.cursor = "move";
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
            frame.style.cursor = "default";
        }
    }
}