document.addEventListener("DOMContentLoaded", () => {
    exitScreen = document.getElementById("exitScreen");
});
async function showExitScreen(text, duration, callback) {
    exitScreen.querySelector(".wrapper > .text").textContent = text;
    exitScreen.style.visibility = "visible";
    exitScreen.querySelector(".wrapper > uwp-spinner").start();
    await delay(duration);
    Array.from(document.body.children).forEach((item) => {
        item.style.visibility = "hidden";
    });
    callback();
}
async function shutdown() {
    await showExitScreen("Shutting down", 5000, () => {
        close();
        location.href = "about:blank";
    });
}
async function reboot() {
    await showExitScreen("Restarting", 5000, () => {
        location.reload();
    });
}
