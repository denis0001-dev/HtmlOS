class DesktopWindow {
    element;
    #width;
    #height;
    title;

    // Window position
    x;
    y;
    newX;
    newY;
    
    constructor(title, initialWidth, initialHeight, closeButton, maximizeButton, minimizeButton) {
        this.title = title;

        this.#width = initialWidth;
        this.#height = initialHeight;

        this.element = document.createElement("div");
        this.element.classList.add("window");

        this.element.style.width = this.#width + "px";
        this.element.style.height = this.#height + "px";

        this.element.innerHTML = `
            <div class="frame">
                <div class="left">
                    <div class="icon"></div>
                    <div class="title">${this.title}</div>
                </div>
                <div class="right">
                    <div class="minimize"></div>
                    <div class="maximize"></div>
                    <div class="close"></div>
                </div>
            </div>
            <div class="content">

            </div>
        `
        this.element.querySelector('.close').addEventListener('click', () => {
            this.close();
        })

        this.hide();


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

    show() {
        this.element.style.display = "block";
    }

    hide() {
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

    #draggableWindow() {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        const frame = this.element.querySelector(".frame");

        const obj = this;

        frame.addEventListener("mousedown", (e) => {
            dragMouseDown(e);
        });

        function dragMouseDown(e) {
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