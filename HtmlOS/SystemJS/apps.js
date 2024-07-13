class CommandLine extends DesktopWindow {
    constructor(title, width, height) {
        super(title, width, height, true, true, true, "command_prompt", null);

        const content = this.content;

        const iframe = document.createElement("iframe");
        iframe.src = "HtmlOS/SystemJS/cmd/index.html";
        content.appendChild(iframe);
        this.content = content;
    }
}