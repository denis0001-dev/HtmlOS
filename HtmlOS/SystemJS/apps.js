// noinspection JSUnusedGlobalSymbols
class CommandLine extends DesktopWindow {
    constructor(width, height) {
        super("Command Prompt", width, height, true, true, true, "command_prompt", null);
        const content = this.content;
        const iframe = document.createElement("iframe");
        iframe.src = "HtmlOS/SystemJS/cmd/index.html";
        iframe.sandbox.add(...[
            "allow-scripts",
            "allow-same-origin",
            "allow-popups",
            "allow-forms",
            "allow-downloads",
        ]);
        content.appendChild(iframe);
        this.content = content;
    }
}
class Minecraft extends DesktopWindow {
    constructor(width, height) {
        super("Minecraft 1.8.8", width, height, true, true, true, "minecraft", null);
        const content = this.content;
        const iframe = document.createElement("iframe");
        iframe.src = "https://eaglercraft.com/mc/1.8.8/";
        iframe.sandbox.add(...[
            "allow-scripts",
            "allow-same-origin",
            "allow-popups",
            "allow-forms",
            "allow-downloads",
        ]);
        content.appendChild(iframe);
        this.content = content;
    }
}
