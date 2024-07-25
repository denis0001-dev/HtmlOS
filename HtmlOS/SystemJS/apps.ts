// noinspection JSUnusedGlobalSymbols

namespace apps {
    export class CommandLine extends desktop.Window {
        constructor(width: number, height: number) {
            super({
                    title: "Command Prompt",
                    width: width,
                    height: height,
                    icon: "command_prompt"
            });

            const content: HTMLElement = this.content;

            const iframe: HTMLIFrameElement = document.createElement("iframe");
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

    export class Minecraft extends desktop.Window {
        constructor(width: number, height: number) {
            super({
                title: "Minecraft 1.8.8",
                width: width,
                height: height,
                icon: "minecraft"
            });

            const content: HTMLElement = this.content;

            const iframe: HTMLIFrameElement = document.createElement("iframe");
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
}