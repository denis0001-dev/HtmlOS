// noinspection JSUnusedLocalSymbols

import ErrorDialog = desktop.ErrorDialog;
import OKAction = desktop.OKAction;
import notification = desktop.notification;

addEventListener("booted", () => {
    const log: Function = console.log;
    const warn: Function = console.warn;
    const error: Function = console.error;
    const info: Function = console.info;
    const debug: Function = console.debug;

    console.error = (...data: any[]): void => {
        const msg: string = data.join(" ");

        new ErrorDialog("Error", 420, 180, msg, OKAction).show();
        error(...data);
    }

    window.onerror = (msg, url, line, col, error) => {
        console.error(error);
        return true;
    }

    console.warn = (...data: any[]): void => {
        warn(...data);
        notification("warning", "Warning", data.join(" "), []);
    }
});