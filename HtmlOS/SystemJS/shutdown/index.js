/// <reference path="../desktop/windows/index.ts" />
var system;
(function (system) {
    var delay = utils.delay;
    var empty = utils.empty;
    document.addEventListener("DOMContentLoaded", () => {
        exitScreen = document.getElementById("exitScreen");
    });
    async function showExitScreen(text, duration, callback) {
        Array.from(document.getElementById("windows").children).forEach((item) => {
            const window = desktop.Window.get(item);
            window.close();
        });
        exitScreen.querySelector(".wrapper > .text").textContent = text;
        exitScreen.style.visibility = "visible";
        exitScreen.querySelector(".wrapper > uwp-spinner").start();
        let exit = true;
        function keyListener(e) {
            if (e.code === "Escape") {
                exit = false;
                exitScreen.style.visibility = "hidden";
                exitScreen.querySelector(".wrapper > uwp-spinner").stop();
                e.preventDefault();
                removeEventListener("keydown", keyListener);
            }
        }
        addEventListener("keydown", keyListener);
        await delay(duration);
        if (exit) {
            Array.from(document.body.children).forEach((item) => {
                item.style.visibility = "hidden";
            });
            callback();
        }
    }
    system.showExitScreen = showExitScreen;
    // noinspection JSUnusedGlobalSymbols
    async function shutdown() {
        await showExitScreen("Shutting down", 5000, () => {
            close(); // try to close the tab
            // fallback
            Array.from(document.head.childNodes).forEach(item => { item.remove(); });
            Array.from(document.body.childNodes).forEach(item => { item.remove(); });
            document.title = "Html OS";
            document.body.style.backgroundColor = "black";
            document.body.style.color = "white";
            document.body.style.fontFamily = "monospace";
            document.body.innerHTML = "It is now safe to close this tab.";
            onbeforeunload = empty;
        });
    }
    system.shutdown = shutdown;
    // noinspection JSUnusedGlobalSymbols
    async function reboot() {
        await showExitScreen("Restarting", 5000, async () => {
            onbeforeunload = empty;
            Array.from(document.body.children).forEach(item => { item.remove(); });
            Array.from(document.head.children).forEach(item => { item.remove(); });
            document.body.style.backgroundColor = "black";
            document.body.style.cursor = "none !important";
            await delay(1000);
            location.reload();
        });
    }
    system.reboot = reboot;
})(system || (system = {}));
