/// <reference path="../SystemJS/desktop/windows/index.ts" />
var system;
(function (system) {
    var Desktop = desktop.Desktop;
    var createIcon = desktop.createIcon;
    var WarningDialog = desktop.WarningDialog;
    var delay = utils.delay;
    var CommandLine = apps.CommandLine;
    var Action = desktop.Action;
    var cookies = utils.cookies;
    var ContextMenuBuilder = UI.ContextMenuBuilder;
    system.cookiesAccepted = false;
    var booted = false;
    // noinspection JSUnusedGlobalSymbols
    async function boot() {
        if (booted) {
            throw new Error("System is already booted");
        }
        booted = true;
        // FIXME make this work
        // Change all cursors to their custom value
        for (let i = 0; i < document.styleSheets.length; i++) {
            let styleSheet = document.styleSheets[i];
            var styleSheetText;
            try {
                styleSheetText = Array.from(styleSheet.cssRules).map(rule => rule.cssText).join(' ');
            }
            catch (ignore) {
                continue;
            }
            if (styleSheetText === undefined) {
                continue;
            }
            const c = "cursor: ";
            // Cursor mappings
            styleSheetText.replace(c + "default", "var(--cur-default)");
            styleSheetText.replace(c + "pointer", "var(--cur-pointer)");
            styleSheetText.replace(c + "move", "var(--cur-move)");
            styleSheetText.replace(c + "help", "var(--cur-help)");
            styleSheetText.replace(c + "not-allowed", "var(--cur-unavail)");
            styleSheetText.replace(c + "n-resize", "var(--cur-n-resize)");
            styleSheetText.replace(c + "s-resize", "var(--cur-s-resize)");
            styleSheetText.replace(c + "e-resize", "var(--cur-e-resize)");
            styleSheetText.replace(c + "w-resize", "var(--cur-w-resize)");
            styleSheetText.replace(c + "ns-resize", "var(--cur-ns-resize)");
            styleSheetText.replace(c + "ew-resize", "var(--cur-ew-resize)");
            styleSheetText.replace(c + "nesw-resize", "var(--cur-nesw-resize)");
            styleSheetText.replace(c + "nwse-resize", "var(--cur-nwse-resize)");
        }
        // Animation cache
        init_cache();
        onbeforeunload = () => "";
        // Loading screen
        const loading_screen = new system.LoadingScreen(document.getElementById("loading_screen"));
        loading_screen.start();
        await delay(5000);
        loading_screen.spinner.stop();
        await delay(1000);
        loading_screen.stop();
        // Generate desktop
        desktop.currentDesktop = new Desktop(document.getElementById("main"));
        desktop.currentDesktop.placeIcon(createIcon("Trash", "trash_empty"), 0, 0);
        dispatchEvent(new Event("booted"));
        let builder = new ContextMenuBuilder();
        builder.addNormalItem("none", "Reboot", system.reboot);
        builder.addNormalItem("none", "Shutdown", system.shutdown);
        builder.addSeparator();
        builder.addNormalItem("cmd", "Command Prompt", () => {
            new CommandLine(800, 600).show();
        });
        UI.attachContextMenu(document.getElementById("desktop"), builder);
        // Cookies warning
        const cookies_window = new WarningDialog("Cookies Warning", 600, 200, `This website uses cookies to remember your settings 
            and improve your experience. Click 'OK' to continue.`, [
            new Action("OK", () => { system.cookiesAccepted = true; document.cookie = "cookiesAccepted=true"; notification("info", "Cookie Manager", "Cookies accepted.", []); }),
            new Action("Decline cookies", () => { system.cookiesAccepted = false; notification("error", "Cookie Manager", "Cookies rejected.", []); })
        ]);
        cookies_window.minHeight = 175;
        cookies_window.minWidth = 325;
        if (!cookies.get("cookiesAccepted") === true) {
            setTimeout(() => { cookies_window.show(); }, 3000);
        }
        else {
            cookies_window.close();
        }
        // Test window
        const content = document.createElement("div");
        content.classList.add("content");
        content.innerHTML = `
            Just a little testing window.
            <br/>
            Right click to see something!
        `;
        builder = new UI.ContextMenuBuilder();
        builder.addSeparator();
        let builder2 = new UI.ContextMenuBuilder();
        builder2.addNormalItem("warning", "lol");
        builder2.addSeparator();
        builder.addCascadingMenu("error", "Cascading menuuu", builder2);
        UI.attachContextMenu(content, builder);
        const window = new desktop.Window({ title: "test", width: 500, height: 300, content: content });
        window.show();
        const commandLine = new CommandLine(800, 600);
        commandLine.show();
    }
    system.boot = boot;
})(system || (system = {}));
