try {
    window.UI = (top as any).UI;
} catch (e) {
    console.error("Failed to load ContextMenuBuilder from the UI library");
}

namespace cmd {
    import ContextMenuBuilder = UI.ContextMenuBuilder;
    let caret_line: number = 0;
    let caret_col: number = 0;

    let currentInput: HTMLSpanElement;

    export let cmdHistory: string[] = [];

    declare var cl: HTMLDivElement;
    declare var caret: HTMLSpanElement;

    declare var moveCaret_left: Function;
    declare var moveCaret_right: Function;

    declare var updatePos: Function;
    export declare var newLine: Function;

    export declare var variables: { [x: string]: string };
    export declare var commands: { [x: string]: Function };
    export declare var help: { [x: string]: string };

    export declare var echo: Function;

    export function main() {
        cl = document.getElementById("console") as HTMLDivElement;
        caret = document.getElementById("caret");

        for (let line = 0; line < cl.children.length; line++) {
            const item: HTMLElement = cl.children[line] as HTMLElement;
            caret_line++;

            let br: boolean = false;

            for (let col = 0; col < item.children.length; col++) {
                const str: HTMLSpanElement = item.children[col] as HTMLSpanElement;
                if (!str.classList.contains("input")) continue;
                const text: string = str.textContent;

                currentInput = str;

                if (str === caret) {
                    br = true;
                    break;
                }

                for (let i = 0; i < text.length; i++) {
                    caret_col++;
                }
                br = true;
                break;
            }

            if (br) break;
        }
        console.log(caret_line, caret_col);
        console.log(currentInput);

        let commandRunning: boolean = false;
        let input: boolean = true;

        // Inputs
        function _moveCaret_left(force: undefined | null | boolean): void {
            force = force || false;
            if (caret_col === 0 && !force) return;
            const pos: DOMRect = caret.getBoundingClientRect();

            const left: number = pos.left - pos.width;

            caret.style.position = "absolute";
            caret.style.left = `${left}px`
            caret_col--;
        }

        function _moveCaret_right(force: undefined | null | boolean): void {
            force = force || false;
            if (caret_col === currentInput.textContent.length && !force) return;
            const pos: DOMRect = caret.getBoundingClientRect();

            const left: number = pos.left + pos.width;

            caret.style.position = "absolute";
            caret.style.left = `${left}px`
            caret_col++;
        }

        function _updatePos(): void {
            const pos: DOMRect = caret.getBoundingClientRect();
            caret.style.position = "absolute";
            caret.style.left = `${pos.left}px`;
        }

        function _newLine(): void {
            const children: HTMLSpanElement[] = Array.from(cl.children) as HTMLSpanElement[];
            Array.from(children[caret_line - 1].children).forEach(item => {
                item.classList.remove("input");
                item.classList.add("static");
            });
            const line: HTMLSpanElement = document.createElement("span");
            line.classList.add("line");

            const inp: HTMLSpanElement = document.createElement("span");
            inp.classList.add("input");
            line.appendChild(inp);
            line.appendChild(caret);
            children[caret_line - 1].insertAdjacentElement("afterend", line);
            caret_line++;
            caret_col = 0;
            caret.style.left = "0";
            currentInput = inp;
        }

        moveCaret_left = _moveCaret_left;
        moveCaret_right = _moveCaret_right;
        updatePos = _updatePos;
        newLine = _newLine;

        let historyPos: number = 0;
        let originalCommand: string;

        addEventListener("keydown", async (e) => {
            let value: string;
            // console.log(e);
            e.preventDefault();

            function finalizeHistory() {
                value = value.trim();
                if (value === originalCommand) return;
                originalCommand = currentInput.textContent;

                currentInput.textContent = value;
                caret.style.position = "static";
                caret_col = value.length;
                updatePos();
            }

            if (e.key === "ArrowLeft" && input) {
                moveCaret_left();
            } else if (e.key === "ArrowRight" && input) {
                moveCaret_right();
            } else if (e.key === "Backspace" && input) {
                updatePos();
                if (caret_col === 0) return;
                currentInput.textContent = currentInput.textContent.slice(0, caret_col - 1) + currentInput.textContent.slice(caret_col);
                moveCaret_left(true);
            } else if (e.key === "Enter" && input) {
                const cmd = currentInput.textContent;
                const parts = cmd.split(" ");

                let exec = parts[0];
                let args = parts.slice(1);

                cmdHistory.push(`${exec} ${args.join(" ")}`);
                historyPos = 0;

                // console.log(exec, args);
                newLine();
                if (!commandRunning) {
                    commandRunning = true;
                    try {
                        // Resolve variables
                        let _parts = [...parts];

                        const regex = /%(.*?)%/g;
                        for (let i = 0; i < _parts.length; i++) {
                            let part = _parts[i];

                            let match: RegExpExecArray;

                            while ((match = regex.exec(part)) !== null) {
                                if (match.index === regex.lastIndex) {
                                    regex.lastIndex++;
                                }

                                match.forEach((content, gIndex) => {
                                    if (gIndex === 1) {
                                        _parts[i] = part.replace(`%${content}%`, variables[content] || "");
                                    }
                                });
                            }
                        }

                        let execute = _parts[0];
                        let arguments = _parts.slice(1);

                        await commands[execute](arguments);
                    } catch (e) {
                        if ((exec === "")) {
                        } else if (e instanceof TypeError) {
                            echo(`"${exec}" is not recognized as an internal or external command,\noparable program or batch file.`);
                        } else {
                            echo(`Unexpected error.\n${e.toString()}`);
                        }
                    }
                    commandRunning = false;
                    echo("\nC:\\Html OS\\SystemJS>");
                    input = true;
                }
            } else if (e.key === "ArrowUp" && !commandRunning) {
                const his = cmdHistory.toReversed();
                historyPos++;
                value = his[historyPos - 1];

                if (!value) {
                    historyPos--;
                    return;
                }
                finalizeHistory();
            } else if (e.key === "ArrowDown" && !commandRunning) {
                const his = cmdHistory.toReversed();
                historyPos--;
                value = his[historyPos];

                if (!value) {
                    historyPos++;
                    return;
                }
                finalizeHistory();
            } else if (e.key.length === 1) {
                moveCaret_right(true);
                currentInput.textContent = currentInput.textContent.slice(0, caret_col - 1) + e.key + currentInput.textContent.slice(caret_col - 1);
            }
            // console.log(caret_col, caret_line);
        });

        if (frameElement) {
            const builder: UI.ContextMenuBuilder = new ContextMenuBuilder();
            builder.addNormalItem("none", "Copy", () => {
                const selection: string = getSelection().toString();
                top.navigator.clipboard.writeText(selection);
            });
            builder.addNormalItem("none", "Paste", async () => {
                const text: string = await top.navigator.clipboard.readText();

                for (let i = 0; i < text.length; i++) {
                    const char: string = text.charAt(i);

                    const event: KeyboardEvent = new KeyboardEvent("keydown", {
                        key: char,
                        shiftKey: false,
                        altKey: false,
                        metaKey: false,
                        repeat: false
                    });
                    dispatchEvent(event);
                }
            });
            builder.addSeparator();
            builder.addNormalItem("none", "Wrap text", () => {

            });

            UI.attachContextMenu(frameElement as HTMLIFrameElement, builder);
        }

        function clearEmptyElements(item: HTMLElement) {
            Array.from(item.children).forEach(element => {
                // console.log(element);
                if (element.innerHTML === "" && !(element === currentInput)) {
                    element.remove();
                }
            });
        }

        function _print(data: any): void {
            data = data.toString();
            const lines: string[] = data.split("\n");

            let line: HTMLSpanElement = cl.children[caret_line - 1] as HTMLSpanElement;

            currentInput.classList.remove("input");
            currentInput.classList.add("static");

            Array.from(line.children).forEach(item => {
                // console.log(item);
                item.innerHTML = item.innerHTML.replaceAll("&nbsp;", "");
            });


            const newSpan = document.createElement("span");
            newSpan.textContent = lines[0];
            newSpan.classList.add("static");
            line.appendChild(newSpan);

            for (let item of lines.slice(1)) {
                newLine();
                line = cl.children[caret_line - 1] as HTMLSpanElement;
                const out = document.createElement("span");
                if (!(item === "")) {
                    out.textContent = item;
                } else {
                    out.innerHTML = "&nbsp;";
                }
                out.classList.add("static");
                line.appendChild(out);
            }

            const inp: HTMLSpanElement = document.createElement("span");
            inp.classList.add("input");
            line.appendChild(inp);
            caret.style.position = "static";
            line.appendChild(caret);
            currentInput = inp;
            caret_col = 0;
            updatePos();
            for (const line of cl.children) {
                clearEmptyElements(line as HTMLElement);
            }
        }

        echo = _print;

        echo("Html OS [Version 1.0]\n");
        echo("Type \"help\" for more information.\n\n");
        echo("C:\\Html OS\\SystemJS>");

        var _commands: { [x: string]: (args?: string[]) => number | void | Promise<number | void> } = {
            "test": (): number => {
                echo("Test!");
                return 0;
            },
            "cls": (): number => {
                Array.from(cl.children).forEach(item => {
                    item.remove();
                });
                caret_line = 1;
                caret_col = 0;
                const line = document.createElement("span");
                line.classList.add("line");
                cl.appendChild(line);

                echo("");
                return 0;
            },
            "echo": (args: string[]): number => {
                let output = args.join(" ");
                output = output.replace(/["'](.*)["']/gm, "$1");
                try {
                    output = eval(`"${output}"`);
                } catch (ignore) {
                    echo("Error: invalid string literal");
                }

                echo(output);
                return 0;
            },
            "rem": (): number => {
                return 0
            },
            "js": (args: string[]): number => {
                if (args.length === 0) {
                    echo("No JavaScript code provided.");
                    return;
                }
                try {
                    const log = console.log;
                    const warn = console.warn;
                    const error = console.error;
                    const info = console.info;
                    const debug = console.debug;

                    console.log = (...args) => {
                        echo(`${args.join(", ")}\n`);
                    }
                    console.warn = (...args) => {
                        echo(`W: ${args.join(", ")}\n`);
                    }
                    console.error = (...args) => {
                        echo(`E: ${args.join(", ")}\n`);
                    }
                    console.info = (...args) => {
                        echo(`I: ${args.join(", ")}\n`);
                    }
                    console.debug = (...args) => {
                        echo(`D: ${args.join(", ")}\n`);
                    }
                    echo(`Result: ${eval(args.join(" "))}\n`);

                    console.log = log;
                    console.warn = warn;
                    console.error = error;
                    console.info = info;
                    console.debug = debug;
                } catch (e) {
                    echo(`E: ${e.toString()}`);
                    return 1;
                }
                return 0;
            },
            // Alias for "js" command
            "javascript": (args: string[]): number => {
                return commands.js(args);
            },

            "help": (args: string[]): number => {
                if (args.length === 0) {
                    echo("Available commands:\n");
                    for (const command in help) {
                        echo(`- ${command}: ${help[command]}\n`);
                    }
                } else if (args.length === 1) {
                    const helpText = help[args[0]];

                    if (!helpText) {
                        echo(`No help available for command "${args[0]}".`);
                        return 1;
                    }
                    echo(helpText);
                }
                return 0;
            },
            "pause": (): Promise<number> => {
                echo("Press any key to continue...");
                input = true;

                return new Promise((resolve) => {
                    addEventListener("keydown", () => {
                        input = false;
                        resolve(0);
                    }, {once: true});
                });
            },
            "set": (args: string[]): number | Promise<number> => {
                // TODO /p optional parameter
                let param: string | undefined;
                let declaration: string[];

                let key: string;
                let value: string;

                if (args[0].startsWith("/")) {
                    // noinspection JSUnusedAssignment
                    param = args[0];
                    declaration = args.slice(1).join(" ").split(" ");

                    if (declaration.length > 2) {
                        let string: string = "";
                        for (let i = 1; i < declaration.length; i++) {
                            const item = declaration[i];
                            string += item + (i === declaration.length - 1 ? "" : " ");
                        }
                        declaration = declaration.slice(0, 1);
                        declaration.push(string);
                    }

                    if (declaration.length === 2) {
                        if (!declaration[0].endsWith("=")) {
                            echo("Invalid declaration format. Use \"variable=\".");
                            return 1;
                        }
                        key = declaration[0].substring(0, declaration[0].length - 1);
                        echo(declaration[1]);
                        input = true;

                        return new Promise((resolve: Function): void => {
                            function handleKey(e: KeyboardEvent): void {
                                if (e.key === "Enter") {
                                    removeEventListener("keydown", handleKey);
                                    input = false;
                                    variables[key] = currentInput.textContent;
                                    echo("");
                                    resolve(0);
                                }
                            }

                            addEventListener("keydown", handleKey);
                        });
                    }
                } else {
                    declaration = args.join(" ").split("=");

                    if (declaration.length === 2) {
                        key = declaration[0];
                        value = declaration[1];
                    }
                }

                variables[key] = value;
                return 0;
            },
            "shutdown": () => {
                (top as any).system.shutdown();
            },
            "reboot": () => {
                (top as any).system.reboot();
            },
            "window": (args: string[]): number => {
                switch (args[0]) {
                    case "create":
                        let width: number;
                        let height: number;
                        try {
                            width = Number(args[1]);
                            height = Number(args[2]);
                        } catch (e) {
                            echo("Invalid window dimensions. Use: window create [width] [height] [appId].");
                            return 2;
                        }
                        const appID = args[3];
                        if (appID === undefined) {
                            echo("Missing application ID. Use: window create [width] [height] [appID].");
                            return 2;
                        }

                        const window: desktop.Window = new (top as any).apps[appID](width, height);
                        window.show();
                        echo(`Window '${appID}' with dimensions ${width}x${height}\n has been successfully created.`);
                        break;
                    default:
                        if (!args[0]) {
                            echo('Invalid command. Use: window create [width] [height] [appID].')
                        } else {
                            echo(`Unrecognized command '${args[0]}'`);
                        }
                        return 1;
                }
            }
        }

        var _variables: { [x: string]: string } = {};

        var _help: { [x: string]: string } = {
            "test": "Outputs a test message to the console. It ignores all arguments.",
            "echo": "Outputs the given message to the console.",
            "js": "Evaluates the given JavaScript expression. All console logs will be printed to the console.",
            "javascript": "Alias for \"js\".",
            "cls": "Clears the console screen.",
            "rem": "Does absolutely nothing. Used for comments.",
            "help": "Displays this help message.",
            "pause": "Pauses the execution of code until the user presses any key.",
            "set": "Sets a variable to the specified value.",
            "shutdown": "Shuts down the system and prepares the tab to safely close.",
            "reboot": "Restarts the system.",
            "window": `
                create: Creates a new window with 
                        the specified width and height.
                        It uses the application ID to determine 
                        what app to launch inside the window.
                        Syntax:
                        window create [width] [height] [appID]
            `,
        }

        commands = _commands;
        variables = _variables;
        help = _help;
    }
}

document.addEventListener("DOMContentLoaded", () => {cmd.main()});