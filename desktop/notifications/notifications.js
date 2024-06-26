var notificationActive = false;

async function notification(icon, title, message, actions) {
    const notification = document.getElementById("notification");
    if (notificationActive) {
        notification.innerHTML = '';
        notification.dataset.id = '';
        notification.classList.forEach((value) => {
            notification.classList.remove(value);
        })
        notification.classList.add("hidden");
        await delay(250);
    }
    if (window.getComputedStyle(document.getElementById("main")).visibility == 'hidden') {
        throw new Error("Cannot display notification when desktop is not loaded");
    }
    notification.innerHTML = `
    <div class="head">
        <div class="left">
            <div class="icon icon_img ${icon}"></div>
            <div class="title">${title}</div>
        </div>
        <div class="right">
            <div class="close"></div>
        </div>
    </div>
    <p class="body">
        ${message}
    </p>
    `
    notification.classList.remove("hidden");

    notification.appendChild(actions);

    notification.querySelector(".head > .right > .close").addEventListener("click",removeNotification)

    const id = generateRandomString(8);

    notification.dataset.id = id;

    notificationActive = true;

    notification.classList.add("appear");
    new Audio('sounds/notification.mp3').play();

    for (let i = 0; i < 700; i++) {
        if (notificationActive && notification.dataset.id == id) {
            await delay(1);
        } else {
            notificationActive = false;
            return;
        }
    }
    if (!notification.classList.contains("hidden") && notification.dataset.id == id && notificationActive) {
        removeNotification();
    }

    notification.dataset.id = '';
}

async function removeNotification() {
    const notification = document.getElementById("notification");
    notification.classList.remove("appear");
    notification.classList.add("disappear");
    await delay(500);
    notification.classList.remove("disappear");
    notification.classList.add("hidden");
    notification.innerHTML = "";
}

function createActions(actionArray) {
    if (arguments.length == 0) {
        const actions = document.createElement("div");
        actions.classList.add("actions");
        return actions;
    } else if (arguments.length == 1) {
        const actions = document.createElement("div");
        actions.classList.add("actions");

        actionArray.forEach(action => {
            const button = document.createElement("button");
            button.classList.add("action");
            button.innerHTML = action.name;
            button.onclick = () => {
                action.callback();
                removeNotification();
            };
            actions.appendChild(button);
        });

        return actions;
    } else {
        throw new Error("Invalid number of arguments");
    }
}

class Action {
    #name;
    #callback;

    constructor(name, callback) {
        this.name = name;
        this.callback = callback;
    }

    get name() {
        return this.#name;
    }

    get callback() {
        return this.#callback;
    }

    set name(name) {
        this.#name = name;
    }

    set callback(callback) {
        this.#callback = callback;
    }
}