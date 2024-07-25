/// <reference path="../index.ts" />
var desktop;
(function (desktop) {
    var delay = utils.delay;
    var generateRandomString = utils.generateRandomString;
    var notificationActive = false;
    async function notification(icon, title, message, _actions) {
        const actions = document.createElement("div");
        actions.classList.add("actions");
        if (_actions) {
            _actions.forEach(action => {
                const button = document.createElement("button");
                button.classList.add("action");
                button.innerHTML = action.name;
                button.onclick = () => {
                    action.callback();
                    removeNotification();
                };
                actions.appendChild(button);
            });
        }
        const notification = document.getElementById("notification");
        if (notificationActive) {
            notification.innerHTML = '';
            notification.dataset.id = '';
            notification.classList.forEach((value) => {
                notification.classList.remove(value);
            });
            notification.classList.add("hidden");
            await delay(250);
        }
        if (getComputedStyle(document.getElementById("main")).visibility === 'hidden') {
            throw new Error("Cannot display notification when desktop is not loaded");
        }
        notification.innerHTML = `
        <div class="head">
            <div class="left">
                <div class="icon icon_img ${icon}" data-type="${icon}"></div>
                <div class="title">${title}</div>
            </div>
            <div class="right">
                <div class="close"></div>
            </div>
        </div>
        <p class="body">
            ${message}
        </p>
    `;
        notification.classList.remove("hidden");
        notification.appendChild(actions);
        notification.querySelector(".head > .right > .close").addEventListener("click", removeNotification);
        const id = generateRandomString(8);
        notification.dataset.id = id;
        notificationActive = true;
        notification.classList.add("appear");
        new Audio('HtmlOS/Media/notification.mp3').play();
        for (let i = 0; i < 700; i++) {
            if (notificationActive && notification.dataset.id === id) {
                await delay(1);
            }
            else {
                notificationActive = false;
                return;
            }
        }
        if (!notification.classList.contains("hidden") && notification.dataset.id === id && notificationActive) {
            removeNotification();
        }
        notification.dataset.id = '';
    }
    desktop.notification = notification;
    async function removeNotification() {
        const notification = document.getElementById("notification");
        notification.classList.remove("appear");
        notification.classList.add("disappear");
        await delay(500);
        notification.classList.remove("disappear");
        notification.classList.add("hidden");
        notification.innerHTML = "";
    }
    desktop.removeNotification = removeNotification;
    class Action {
        name;
        callback;
        constructor(name, callback) {
            this.name = name;
            this.callback = callback;
        }
    }
    desktop.Action = Action;
})(desktop || (desktop = {}));
