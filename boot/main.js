async function boot() {
    const loading_screen = new LoadingScreen(document.getElementById("loading_screen"));
    loading_screen.start();
    await delay(5000);

    loading_screen.spinner.stop();
    await delay(1000);

    loading_screen.stop();

    // desktop(document.getElementById("main"));

    const desktop = new Desktop(document.getElementById("main"));



    desktop.placeIcon(createIcon("Trash", "trash_empty"), 0, 0)

    const window = new DesktopWindow("test", 600, 800, true, true, true);
    window.show();
}