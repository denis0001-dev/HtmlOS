declare var exitScreen: HTMLDivElement;

document.addEventListener("DOMContentLoaded", () => {
    exitScreen = document.getElementById("exitScreen") as HTMLDivElement;
});

async function showExitScreen(text: string, duration: number, callback: Function) {
    Array.from(document.getElementById("windows").children).forEach((item: HTMLElement) => {
        const window: DesktopWindow = DesktopWindow.get(item);

        window.close();
    });

    exitScreen.querySelector(".wrapper > .text").textContent = text;
    exitScreen.style.visibility = "visible";
    (exitScreen.querySelector(".wrapper > uwp-spinner") as UWPSpinner).start();
    let exit = true;

    function keyListener(e: KeyboardEvent) {
        if (e.code === "Escape") {
            exit = false;
            exitScreen.style.visibility = "hidden";
            (exitScreen.querySelector(".wrapper > uwp-spinner") as UWPSpinner).stop();
            e.preventDefault();
            removeEventListener("keydown", keyListener);
        }
    }

    addEventListener("keydown", keyListener);

    await delay(duration);

    if (exit) {
        Array.from(document.body.children).forEach((item: HTMLElement) => {
            item.style.visibility = "hidden";
        });
        callback();
    }
}

async function shutdown(): Promise<void> {
    await showExitScreen("Shutting down", 5000, () => {
        close(); // try to close the tab

        // fallback
        Array.from(document.head.childNodes).forEach(item => {item.remove()});
        Array.from(document.body.childNodes).forEach(item => {item.remove()});

        document.title = "Html OS";

        document.body.style.backgroundColor = "black";
        document.body.style.color = "white";
        document.body.style.fontFamily = "monospace";
        document.body.innerHTML = "It is now safe to close this tab.";
        onbeforeunload = empty;
    });
}

async function reboot(): Promise<void> {
    await showExitScreen("Restarting", 5000, async () => {
        onbeforeunload = empty;
        await delay(1000);
        location.reload();
    });
}