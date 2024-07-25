// noinspection JSUnusedGlobalSymbols
var apps;
(function (apps) {
    class CommandLine extends desktop.Window {
        constructor(width, height) {
            super({
                title: "Command Prompt",
                width: width,
                height: height,
                icon: "command_prompt"
            });
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
    apps.CommandLine = CommandLine;
    class Minecraft extends desktop.Window {
        constructor(width, height) {
            super({
                title: "Minecraft 1.8.8",
                width: width,
                height: height,
                icon: "minecraft"
            });
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
    apps.Minecraft = Minecraft;
})(apps || (apps = {}));
