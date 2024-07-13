class CommandLine extends DesktopWindow {
    constructor(width, height) {
        super(
            "Command Prompt",
            width,
            height,
            true,
            true,
            true,
            "command_prompt",
            null
        );

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