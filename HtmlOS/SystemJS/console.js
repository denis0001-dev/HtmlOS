addEventListener("booted", () => {
    const log = console.log;
    const warn = console.warn;
    const error = console.error;
    const info = console.info;
    const debug = console.debug;
    console.error = (...data) => {
        const msg = data.join(" ");
        new ErrorDialog("Error", 420, 180, msg, OKAction).show();
        error(...data);
    };
    window.onerror = (msg, url, line, col, error) => {
        console.error(error);
        return true;
    };
    console.warn = (...data) => {
        warn(...data);
        notification("warning", "Warning", data.join(" "), createActions());
    };
});
