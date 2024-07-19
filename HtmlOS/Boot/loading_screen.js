class LoadingScreen {
    element;
    spinner;
    constructor(element) {
        this.element = element;
        this.spinner = this.element.querySelector('#spinner');
        element.style.visibility = "hidden";
    }
    start() {
        this.element.style.visibility = "visible";
        this.spinner.start();
    }
    stop() {
        this.element.style.visibility = "hidden";
        this.spinner.stop();
    }
}
