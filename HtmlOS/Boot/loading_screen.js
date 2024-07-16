const chars = [
    'E052', 'E053', 'E054', 'E055', 'E056', 'E057', 'E058', 'E059', 'E060', 'E061', 'E062', 'E063', 'E064', 'E065',
    'E066', 'E067', 'E068', 'E069', 'E070', 'E071', 'E072', 'E073', 'E074', 'E075', 'E076', 'E077', 'E078', 'E079',
    'E07a', 'E07b', 'E07c', 'E07d', 'E07e', 'E07f', 'E080', 'E081', 'E082', 'E083', 'E084', 'E085', 'E086', 'E087',
    'E088', 'E089', 'E08a', 'E08b', 'E08c', 'E08d', 'E08e', 'E08f', 'E090', 'E091', 'E092', 'E093', 'E094', 'E095',
    'E096', 'E097', 'E098', 'E099', 'E09a', 'E09b', 'E09c', 'E09d', 'E09e', 'E09f', 'E0A0', 'E0A1', 'E0A2', 'E0A3',
    'E0A4', 'E0A5', 'E0A6', 'E0A7', 'E0A8', 'E0A9', 'E0Aa', 'E0Ab', 'E0Ac', 'E0Ad', 'E0Ae', 'E0Af', 'E0B0', 'E0B1',
    'E0B2', 'E0B3', 'E0B4', 'E0B5', 'E0B6', 'E0B7', 'E0B8', 'E0B9', 'E0Ba', 'E0Bb', 'E0Bc', 'E0Bd', 'E0Be', 'E0Bf',
    'E0C0', 'E0C1', 'E0C2', 'E0C3', 'E0C4', 'E0C5', 'E0C6', 'E0C7', 'E0C8', 'E0C9', 'E0Ca', 'E0Cb'
];
class Spinner {
    element;
    running;
    constructor(element) {
        this.element = element;
        element.style.opacity = "0";
    }
    async start() {
        this.element.style.opacity = "1";
        this.running = true;
        while (this.running && this.element.style.display !== "none") {
            for (let i = 0; i < chars.length; i++) {
                this.element.innerHTML = '&#x' + chars[i];
                await delay(25);
            }
        }
    }
    stop() {
        this.element.style.opacity = "0";
        this.running = false;
    }
}
class LoadingScreen {
    element;
    spinner;
    constructor(element) {
        this.element = element;
        let spinner_span = this.element.querySelector('#spinner');
        this.spinner = new Spinner(spinner_span);
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
