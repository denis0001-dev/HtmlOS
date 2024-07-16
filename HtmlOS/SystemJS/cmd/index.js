document.addEventListener("DOMContentLoaded", main);
let caret_line = 0;
let caret_col = 0;
let currentInput;
let cmdHistory = [];
function main() {
    window.cl = document.getElementById("console");
    window.caret = document.getElementById("caret");
    for (let line = 0; line < cl.children.length; line++) {
        const item = cl.children[line];
        caret_line++;
        let br = false;
        for (let col = 0; col < item.children.length; col++) {
            const str = item.children[col];
            if (!str.classList.contains("input"))
                continue;
            const text = str.textContent;
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
        if (br)
            break;
    }
    console.log(caret_line, caret_col);
    console.log(currentInput);
    let commandRunning = false;
    let input = true;
    // Inputs
    function _moveCaret_left(force) {
        force = force || false;
        if (caret_col === 0 && !force)
            return;
        const pos = caret.getBoundingClientRect();
        const left = pos.left - pos.width;
        caret.style.position = "absolute";
        caret.style.left = `${left}px`;
        caret_col--;
    }
    function _moveCaret_right(force) {
        force = force || false;
        if (caret_col === currentInput.textContent.length && !force)
            return;
        const pos = caret.getBoundingClientRect();
        const left = pos.left + pos.width;
        caret.style.position = "absolute";
        caret.style.left = `${left}px`;
        caret_col++;
    }
    function _updatePos() {
        const pos = caret.getBoundingClientRect();
        caret.style.position = "absolute";
        caret.style.left = `${pos.left}px`;
    }
    function _newLine() {
        const children = Array.from(cl.children);
        Array.from(children[caret_line - 1].children).forEach(item => {
            item.classList.remove("input");
            item.classList.add("static");
        });
        const line = document.createElement("span");
        line.classList.add("line");
        const inp = document.createElement("span");
        inp.classList.add("input");
        line.appendChild(inp);
        line.appendChild(caret);
        children[caret_line - 1].insertAdjacentElement("afterend", line);
        caret_line++;
        caret_col = 0;
        caret.style.left = "0";
        currentInput = inp;
    }
    window.moveCaret_left = _moveCaret_left;
    window.moveCaret_right = _moveCaret_right;
    window.updatePos = _updatePos;
    window.newLine = _newLine;
    let historyPos = 0;
    let originalCommand;
    addEventListener("keydown", async (e) => {
        // console.log(e);
        e.preventDefault();
        if (e.key === "ArrowLeft" && input) {
            moveCaret_left();
        }
        else if (e.key === "ArrowRight" && input) {
            moveCaret_right();
        }
        else if (e.key === "Backspace" && input) {
            updatePos();
            if (caret_col === 0)
                return;
            currentInput.textContent = currentInput.textContent.slice(0, caret_col - 1) + currentInput.textContent.slice(caret_col);
            moveCaret_left(true);
        }
        else if (e.key === "Enter" && input) {
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
                        let match;
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
                }
                catch (e) {
                    if ((exec === "")) {
                    }
                    else if (e instanceof TypeError) {
                        echo(`"${exec}" is not recognized as an internal or external command,\noparable program or batch file.`);
                    }
                    else {
                        echo(`Unexpected error.\n${e.toString()}`);
                    }
                }
                commandRunning = false;
                echo("\nC:\\Html OS\\SystemJS>");
                input = true;
            }
        }
        else if (e.key === "ArrowUp" && !commandRunning) {
            const his = cmdHistory.toReversed();
            historyPos++;
            let value = his[historyPos - 1];
            if (!value) {
                historyPos--;
                return;
            }
            value = value.trim();
            if (value === originalCommand)
                return;
            originalCommand = currentInput.textContent;
            currentInput.textContent = value;
            caret.style.position = "static";
            caret_col = value.length;
            updatePos();
        }
        else if (e.key === "ArrowDown" && !commandRunning) {
            const his = cmdHistory.toReversed();
            historyPos--;
            let value = his[historyPos];
            if (!value) {
                historyPos++;
                return;
            }
            value = value.trim();
            if (value === originalCommand)
                return;
            originalCommand = currentInput.textContent;
            currentInput.textContent = value;
            caret.style.position = "static";
            caret_col = value.length;
            updatePos();
        }
        else if (e.key.length === 1) {
            moveCaret_right(true);
            currentInput.textContent = currentInput.textContent.slice(0, caret_col - 1) + e.key + currentInput.textContent.slice(caret_col - 1);
        }
        // console.log(caret_col, caret_line);
    });
    function clearEmptyElements(item) {
        Array.from(item.children).forEach(element => {
            // console.log(element);
            if (element.innerHTML === "" && !(element === currentInput)) {
                element.remove();
            }
        });
    }
    function _print(data) {
        data = data.toString();
        const lines = data.split("\n");
        let line = cl.children[caret_line - 1];
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
            line = cl.children[caret_line - 1];
            const out = document.createElement("span");
            if (!(item === "")) {
                out.textContent = item;
            }
            else {
                out.innerHTML = "&nbsp;";
            }
            out.classList.add("static");
            line.appendChild(out);
        }
        const inp = document.createElement("span");
        inp.classList.add("input");
        line.appendChild(inp);
        caret.style.position = "static";
        line.appendChild(caret);
        currentInput = inp;
        caret_col = 0;
        updatePos();
        for (const line of cl.children) {
            clearEmptyElements(line);
        }
    }
    window.echo = _print;
    echo("Html OS [Version 1.0]\n");
    echo("Type \"help\" for more information.\n\n");
    echo("C:\\Html OS\\SystemJS>");
    var _commands = {
        "test": () => {
            echo("Test!");
            return 0;
        },
        "cls": () => {
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
        "echo": (args) => {
            let output = args.join(" ");
            output = output.replace(/["'](.*)["']/gm, "$1");
            try {
                output = eval(`"${output}"`);
            }
            catch (ignore) {
                echo("Error: invalid string literal");
            }
            echo(output);
            return 0;
        },
        "rem": () => { return 0; },
        "js": (args) => {
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
                };
                console.warn = (...args) => {
                    echo(`W: ${args.join(", ")}\n`);
                };
                console.error = (...args) => {
                    echo(`E: ${args.join(", ")}\n`);
                };
                console.info = (...args) => {
                    echo(`I: ${args.join(", ")}\n`);
                };
                console.debug = (...args) => {
                    echo(`D: ${args.join(", ")}\n`);
                };
                echo(`Result: ${eval(args.join(" "))}\n`);
                console.log = log;
                console.warn = warn;
                console.error = error;
                console.info = info;
                console.debug = debug;
            }
            catch (e) {
                echo(`E: ${e.toString()}`);
                return 1;
            }
            return 0;
        },
        // Alias for "js" command
        "javascript": (args) => { return commands.js(args); },
        "help": (args) => {
            if (args.length === 0) {
                echo("Available commands:\n");
                for (const command in help) {
                    echo(`- ${command}: ${help[command]}\n`);
                }
            }
            else if (args.length === 1) {
                const helpText = help[args[0]];
                if (!helpText) {
                    echo(`No help available for command "${args[0]}".`);
                    return 1;
                }
                echo(helpText);
            }
            return 0;
        },
        "pause": () => {
            echo("Press any key to continue...");
            input = true;
            return new Promise((resolve) => {
                addEventListener("keydown", () => {
                    input = false;
                    resolve(0);
                }, { once: true });
            });
        },
        "set": (args) => {
            let param;
            let declaration;
            let key;
            let value;
            if (args[0].startsWith("/")) {
                param = args[0];
                declaration = args.slice(1).join(" ").split(" ");
                if (declaration.length > 2) {
                    let string = "";
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
                    return new Promise((resolve) => {
                        function handleKey(e) {
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
            }
            else {
                declaration = args.join(" ").split("=");
                if (declaration.length === 2) {
                    key = declaration[0];
                    value = declaration[1];
                }
            }
            variables[key] = value;
            return 0;
        }
    };
    var _variables = {};
    var _help = {
        "test": "Outputs a test message to the console. It ignores all arguments.",
        "echo": "Outputs the given message to the console.",
        "js": "Evaluates the given JavaScript expression. All console logs will be printed to the console.",
        "javascript": "Alias for \"js\".",
        "cls": "Clears the console screen.",
        "rem": "Does absolutely nothing. Used for comments.",
        "help": "Displays this help message.",
        "pause": "Pauses the execution of code until the user presses any key.",
        "set": "Sets a variable to the specified value."
    };
    window.commands = _commands;
    window.variables = _variables;
    window.help = _help;
}
