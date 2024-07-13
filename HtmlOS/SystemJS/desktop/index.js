/* function desktop(element) {
    element.style.visibility = "visible";

    const wallpaper = element.querySelector("#desktop > #wallpaper");
    const icon_grid = element.querySelector("#desktop > #icons")

    wallpaper.style.backgroundImage = 'url("desktop/windows10_dark.png")';

    // Create blank desktop icons
    const rows = window.getComputedStyle(icon_grid).gridTemplateRows.split(" ");
    const cols = window.getComputedStyle(icon_grid).gridTemplateColumns.split(" ");

    for (let col = 0; col < cols.length; col++) {
        for (let row = 0; row < rows.length; row++) {
            var icon = document.createElement("div");
            icon.classList.add("icon");
            icon.id = "icon_r"+row+"c"+col;
            icon.dataset.type = "none";
            var iconImg = document.createElement("div");
            iconImg.classList.add("icon_img");
            iconImg.classList.add("hidden");
            iconImg.dataset.type = "none";
            var iconName = document.createElement("div");
            iconName.classList.add("icon_name");
            iconName.innerHTML = "None";
            icon.appendChild(iconImg);
            icon.appendChild(iconName);

            icon_grid.appendChild(icon);
        }
    }
} */

class Desktop {
    element;

    constructor(element) {
        this.element = element;
        element.style.visibility = "visible";

        window.addEventListener('resize', () => {
            console.log("Resizing...");
            this.createBlankIcons();
        })

        this.element.querySelector("#taskbar > .left > #start").addEventListener("click", () => {
            this.toggle_startmenu();
        })
        this.#startmenu_drag_top();
        this.#startmenu_drag_top_right();
        this.#startmenu_drag_right();

        this.wallpaper_path = "HtmlOS/Resources/Wallpapers/windows10_dark.png";

        this.createBlankIcons();
    }

    get element() {return this.element}

    get #wallpaper() {
        return this.element.querySelector("#desktop > #wallpaper");
    }

    get #icon_grid() {
        return this.element.querySelector("#desktop > #icons");
    }

    get wallpaper_path() {
        const regex = /url\("(.*)"\)/
        
        return this.#wallpaper.style.backgroundImage.replace(regex, "$1");
    }

    set wallpaper_path(path) {
        this.#wallpaper.style.backgroundImage = 'url("' + path + '")';
    }
    
    createBlankIcons() {
        const rows = getComputedStyle(this.#icon_grid).gridTemplateRows.split(" ");
        const cols = getComputedStyle(this.#icon_grid).gridTemplateColumns.split(" ");

        const icons = Array.from(this.#icon_grid.children);

        icons.forEach(item => {
            if (item.dataset.type === "none") {
                item.remove();
            }
        })



        for (let col = 0; col < cols.length; col++) {
            for (let row = 0; row < rows.length; row++) {
                if (this.getIcon(row, col) !== null) {
                    continue;
                }

                var icon = document.createElement("div");
                icon.classList.add("icon");
                icon.id = "icon_r"+row+"c"+col;
                icon.dataset.type = "none";
                var iconImg = document.createElement("div");
                iconImg.classList.add("icon_img");
                iconImg.classList.add("hidden");
                iconImg.dataset.type = "none";
                var iconName = document.createElement("div");
                iconName.classList.add("icon_name");
                iconName.innerHTML = "None";
                icon.appendChild(iconImg);
                icon.appendChild(iconName);

                this.#icon_grid.appendChild(icon);
            }
        }
    }

    getIcon(row, col) {
        return this.#icon_grid.querySelector("#icon_r"+row+"c"+col);
    }

    placeIcon(_icon, row, col) {
        const icon = document.createElement("div");
        icon.classList.add("icon");
        icon.id = "icon_r"+row+"c"+col;
        icon.dataset.type = _icon.dataset.type || "none";

        const iconName = document.createElement("div");
        iconName.classList.add("icon_name");
        iconName.innerHTML = getChildByClass(_icon, "icon_name").innerHTML;

        const iconImg = document.createElement("div");
        iconImg.classList.add("icon_img");
        iconImg.dataset.type = _icon.dataset.type || "none";
        iconImg.style.backgroundImage = getChildByClass(_icon, "icon_img").style.backgroundImage;

        const icon_pos = this.getIcon(row, col);

        icon.appendChild(iconImg);
        icon.appendChild(iconName);

        var nextElIndex = nextElementIndex(Array.from(this.#icon_grid.children), icon_pos);

        icon_pos.remove();

        if (nextElIndex === this.#icon_grid.children.length - 1) {
            this.#icon_grid.appendChild(icon);
        } else {
            this.#icon_grid.insertBefore(icon, this.#icon_grid.children[nextElIndex - 1]);
        }
    }

    get start_menu() {
        return this.element.querySelector("#start_menu");
    }

    minimize_startmenu() {
        if (this.start_menu.style.transform === "") return;
        const height = this.start_menu.clientHeight + 45;

        this.start_menu.style.transform = `translateY(${height}px)`
    }

    async maximize_startmenu() {
        stylesheet.replaceChildren(
            `@keyframes startmenu {
                0% {
                    transform: translateY(${this.element.clientHeight + 5}px);
                }

                80% {
                    transform: translateY(50px);
                }

                100% {
                    transform: translateY(0px);
                }
            }
            `
        )

        this.start_menu.style.animation = "startmenu 0.5s";
        this.start_menu.style.animationFillMode = "forwards";

        await delay(500);
        this.start_menu.style.animation = "";
        this.start_menu.style.transform = "translateY(0px)";
    }

    async toggle_startmenu() {
        if (this.start_menu.style.transform === "translateY(0px)") {
            this.minimize_startmenu();
        } else {
            this.maximize_startmenu();
        }
    }

    #startmenu_drag_top() {
        var pos1, pos2, pos3, pos4 = 0;

        const obj = this;

        obj.start_menu.querySelector('.resizer_up').addEventListener("mousedown", (e) => {
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

            obj.start_menu.style.height = (obj.start_menu.clientHeight + pos2) + "px";
        }
    }

    #startmenu_drag_top_right() {
        var pos1, pos2, pos3, pos4 = 0;

        const obj = this;

        obj.start_menu.querySelector('.resizer_up_right').addEventListener("mousedown", (e) => {
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

            obj.start_menu.style.height = (obj.start_menu.clientHeight + pos2) + "px";
            obj.start_menu.style.width = (obj.start_menu.clientWidth - pos1) + "px";
        }
    }

    #startmenu_drag_right() {
        var pos1, pos2, pos3, pos4 = 0;

        const obj = this;

        obj.start_menu.querySelector('.resizer_right').addEventListener("mousedown", (e) => {
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

            obj.start_menu.style.width = (obj.start_menu.clientWidth - pos1) + "px";
        }
    }
}

function createIcon(name, type) {
    const icon = document.createElement("div");
    icon.classList.add("icon");
    icon.dataset.type = type || "none";

    var iconImg = document.createElement("div");
    iconImg.classList.add("icon_img");
    iconImg.dataset.type = type || "none";

    var iconName = document.createElement("div");
    iconName.classList.add("icon_name");
    iconName.innerHTML = name;

    icon.appendChild(iconImg);
    icon.appendChild(iconName);

    return icon;
}