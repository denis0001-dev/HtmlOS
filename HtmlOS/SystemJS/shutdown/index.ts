declare var exitScreen: HTMLDivElement;

document.addEventListener("DOMContentLoaded", () => {
    exitScreen = document.getElementById("exitScreen") as HTMLDivElement;
});

async function showExitScreen(text: string, duration: number, callback: Function) {
    exitScreen.querySelector(".wrapper > .text").textContent = text;
    exitScreen.style.visibility = "visible";
    (exitScreen.querySelector(".wrapper > uwp-spinner") as UWPSpinner).start();
    await delay(duration);
    Array.from(document.body.children).forEach((item: HTMLElement) => {
        item.style.visibility = "hidden";
    });
    callback();
}

async function shutdown(): Promise<void> {
    await showExitScreen("Shutting down", 5000, () => {
        close();
        location.href = "about:blank";
    });
}

async function reboot(): Promise<void> {
    await showExitScreen("Restarting", 5000, () => {
        location.reload();
    });
}