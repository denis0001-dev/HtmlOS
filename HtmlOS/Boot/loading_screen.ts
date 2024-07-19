class LoadingScreen {
    public readonly element: HTMLDivElement;
    public readonly spinner: UWPSpinner;

    constructor(element: HTMLDivElement) {
        this.element = element;
        this.spinner = this.element.querySelector('#spinner');
        element.style.visibility = "hidden";
    }

    start(): void {
        this.element.style.visibility = "visible";
        this.spinner.start();
    }

    stop(): void {
        this.element.style.visibility = "hidden";
        this.spinner.stop();
    }
}