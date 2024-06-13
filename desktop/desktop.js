/* function desktop(element) {
    element.style.visibility = "visible";

    const wallpaper = element.querySelector("#desktop > #wallpaper");
    const icon_grid = element.querySelector("#desktop > #icons")

    wallpaper.style.backgroundImage = 'url("desktop/wallpaper.png")';

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

        this.wallpaper_path = "desktop/wallpaper.png";

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
        const rows = window.getComputedStyle(this.#icon_grid).gridTemplateRows.split(" ");
        const cols = window.getComputedStyle(this.#icon_grid).gridTemplateColumns.split(" ");

        const icons = Array.from(this.#icon_grid.children);

        icons.forEach(item => {
            if (item.dataset.type == "none") {
                item.remove();
            }
        })



        for (let col = 0; col < cols.length; col++) {
            for (let row = 0; row < rows.length; row++) {
                if (this.getIcon(row, col) != undefined) {
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

        if (nextElIndex == this.#icon_grid.children.length - 1) {
            this.#icon_grid.appendChild(icon);
        } else {
            this.#icon_grid.insertBefore(icon, this.#icon_grid.children[nextElIndex - 1]);
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