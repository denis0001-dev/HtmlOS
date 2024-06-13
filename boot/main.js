async function boot() {
    // Loading screen
    const loading_screen = new LoadingScreen(document.getElementById("loading_screen"));
    loading_screen.start();
    await delay(5000);

    loading_screen.spinner.stop();
    await delay(1000);

    loading_screen.stop();

    // Generate desktop
    const desktop = new Desktop(document.getElementById("main"));

    desktop.placeIcon(createIcon("Trash", "trash_empty"), 0, 0)

    // Test window
    const window = new DesktopWindow("test", 500, 300, true, true, true);
    window.show();
}