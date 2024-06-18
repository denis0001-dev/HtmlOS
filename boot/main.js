var cookiesAccepted = false;

async function boot() {
    // Change all cursors to their custom value
    for (let i = 0; i < document.styleSheets.length; i++) {
        let styleSheet = document.styleSheets[i];

        var styleSheetText;
        try {
        styleSheetText = Array.from(styleSheet.cssRules).map(rule => rule.cssText).join(' ');
        } catch (e) {
            continue;
        }

        if (styleSheetText === undefined) {
            continue;
        }

        const c = "cursor: ";

        // Cursor mappings
        styleSheetText.replace(c+"default", "var(--cur-default)");
        styleSheetText.replace(c+"pointer", "var(--cur-pointer)");
        styleSheetText.replace(c+"move", "var(--cur-move)");
        styleSheetText.replace(c+"help", "var(--cur-help)");
        styleSheetText.replace(c+"not-allowed", "var(--cur-unavail)");
        styleSheetText.replace(c+"n-resize", "var(--cur-n-resize)");
        styleSheetText.replace(c+"s-resize", "var(--cur-s-resize)");
        styleSheetText.replace(c+"e-resize", "var(--cur-e-resize)");
        styleSheetText.replace(c+"w-resize", "var(--cur-w-resize)");
        styleSheetText.replace(c+"ns-resize", "var(--cur-ns-resize)");
        styleSheetText.replace(c+"ew-resize", "var(--cur-ew-resize)");
        styleSheetText.replace(c+"nesw-resize", "var(--cur-nesw-resize)");
        styleSheetText.replace(c+"nwse-resize", "var(--cur-nwse-resize)");
    }

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

    // Cookies warning
    const cookies_window = new IconTextDialog("Cookies Warning", 600, 200, 
        `This website uses cookies to remember your settings 
        and improve your experience. Click 'OK' to continue.`, [
            new Action("OK", () => {cookiesAccepted = true; document.cookie = "cookiesAccepted=true"; notification("info", "Cookie Manager", "Cookies accepted.", createActions())}),
            new Action("Decline cookies", () => {cookiesAccepted = false; notification("error", "Cookie Manager", "Cookies rejected.", createActions())})
        ],  "warning"
    )

    if (!document.cookie.split(";").includes("cookiesAccepted=true")) {
        setTimeout(() => {cookies_window.show()}, 3000);
    }

    // Test window
    const window = new DesktopWindow("test", 500, 300, true, true, true, "application");
    window.show();
}