import React, { useEffect, useRef } from "react";
import { Terminal as XTerm } from "xterm";
import "xterm/css/xterm.css";
import { fsInit, fsList, fsRead, fsIsDir } from '../fs/indexeddb';
import { useWindowClose } from "../components/WindowManager";

// Helper to parse command line with quoted arguments
function parseArgs(line: string): string[] {
  const regex = /"([^"]*)"|'([^']*)'|([^\s]+)/g;
  const args: string[] = [];
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match[1] !== undefined) args.push(match[1]);
    else if (match[2] !== undefined) args.push(match[2]);
    else if (match[3] !== undefined) args.push(match[3]);
  }
  return args;
}

// Environment variables
let env: Record<string, string> = {
  HOME: "/",
  USER: "htmlos",
  SHELL: "/bin/tty",
  PWD: "/"
};

function resolvePath(input: string, cwd: string): string {
  if (!input) return cwd;
  let path = input;
  if (!path.startsWith("/")) {
    path = cwd.endsWith("/") ? cwd + path : cwd + "/" + path;
  }
  // Normalize path: handle ., .., //
  const parts = path.split("/");
  const stack: string[] = [];
  for (const part of parts) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      if (stack.length > 0) stack.pop();
    } else {
      stack.push(part);
    }
  }
  return "/" + stack.join("/");
}

// Commands object
const commands: { [key: string]: (args: string[], term: XTerm, shellCtx: ShellContext) => Promise<void> } = {
  async help(args, term) {
    term.write("\r\nAvailable commands: help, echo, clear, ls, cat, cd, env, sh\r\n");
  },
  async echo(args, term) {
    term.write("\r\n" + args.join(" ") + "\r\n");
  },
  async clear(args, term) {
    term.write("\r\n");
    term.clear();
  },
  async env(args, term) {
    for (const [key, value] of Object.entries(env)) {
      term.write(`\r\n${key}=${value}`);
    }
    term.write("\r\n");
  },
  async ls(args, term, shellCtx) {
    let path = args[0] || ".";
    path = resolvePath(path, shellCtx.cwd);
    try {
      const children = await fsList(path);
      term.write("\r\n" + children.join("  ") + "\r\n");
    } catch (e: any) {
      term.write("\r\n" + e.message + "\r\n");
    }
  },
  async cat(args, term, shellCtx) {
    let path = args[0];
    if (!path) {
      term.write("\r\nUsage: cat <file>\r\n");
      return;
    }
    path = resolvePath(path, shellCtx.cwd);
    try {
      const content = await fsRead(path);
      term.write("\r\n" + content.replace(/\n/g, "\r\n") + "\r\n");
    } catch (e: any) {
      term.write("\r\n" + e.message + "\r\n");
    }
  },
  async cd(args, term, shellCtx) {
    let path = args[0];
    if (!path) {
      shellCtx.cwd = env.HOME || "/";
      env.PWD = shellCtx.cwd;
      return;
    }
    path = resolvePath(path, shellCtx.cwd);
    // Remove trailing slash except for root
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    try {
      const isDir = await fsIsDir(path);
      if (!isDir) throw new Error("Not a directory");
      shellCtx.cwd = path;
      env.PWD = shellCtx.cwd;
    } catch (e: any) {
      term.write("\r\n" + e.message + "\r\n");
    }
  },
  async sh(args, term, shellCtx) {
    await shellPromptLoop(term, shellCtx);
  },
  async sleep(args, term) {
    if (!args[0] || isNaN(Number(args[0]))) {
      term.write("\r\nInvalid time\r\n");
      return;
    }
    const ms = Number(args[0]);
    await new Promise(resolve => setTimeout(resolve, ms * 1000));
  }
};

interface ShellContext {
  cwd: string;
}

function shellPromptLoop(term: XTerm, shellCtx: ShellContext) {
  let inputBuffer = "";
  let cursorPos = 0;
  const getPrompt = () => `${shellCtx.cwd} $ `;
  let isRunning = false;

  function redraw() {
    term.write('\r');
    term.write('\x1b[2K');
    term.write(getPrompt() + inputBuffer);
    const promptLength = getPrompt().length;
    term.write(`\x1b[${promptLength + cursorPos + 1}G`);
  }

  return new Promise<void>(resolve => {
    let exited = false;

    const onData = async (data: string) => {
      if (isRunning || exited) return;
      if (data === "\r") {
        // Enter pressed
        const args = parseArgs(inputBuffer);
        const cmd = args[0];
        term.write("\r\n"); // Always print a new line before command output
        if (cmd && commands[cmd]) {
          isRunning = true;
          await commands[cmd](args.slice(1), term, shellCtx);
          isRunning = false;
        } else if ((cmd || "").trim() === "") {
          // do nothing, just print prompt
        } else if ((cmd || "").trim() === "exit") {
            exited = true
          resolve();
          return;
        } else {
          term.write("Command not found: " + inputBuffer + "\r\n");
        }
        inputBuffer = "";
        cursorPos = 0;
        term.write(getPrompt());
        return;
      } else if (data === "\u007F") {
        // Backspace
        if (cursorPos > 0) {
          inputBuffer = inputBuffer.slice(0, cursorPos - 1) + inputBuffer.slice(cursorPos);
          cursorPos--;
          redraw();
        }
      } else if (data === "\x1b[D") {
        // Left arrow
        if (cursorPos > 0) {
          cursorPos--;
          redraw();
        }
      } else if (data === "\x1b[C") {
        // Right arrow
        if (cursorPos < inputBuffer.length) {
          cursorPos++;
          redraw();
        }
      } else if (data.length === 1 && data >= " " && data <= "~") {
        // Printable character
        inputBuffer = inputBuffer.slice(0, cursorPos) + data + inputBuffer.slice(cursorPos);
        cursorPos++;
        redraw();
      }
      // Ignore all other keys for now
    };
    term.onData(onData);
    // Initial prompt
    term.write(getPrompt());
  });
}

export function Terminal() {
  const xtermRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);
  const onClose = useWindowClose();

  useEffect(() => {
    let term: XTerm | null = null;
    (async () => {
      await fsInit();
      if (!xtermRef.current) return;
      if (xtermRef.current) {
        xtermRef.current.innerHTML = "";
      }
      term = new XTerm({
        theme: {
          background: "#18181a",
          foreground: "#eee"
        },
        fontFamily: 'monospace',
        fontSize: 15,
        cursorBlink: true
      });
      term.open(xtermRef.current);
      termRef.current = term;
      // Start shell
      await commands.sh([], term, { cwd: env.PWD });

      term.write("\r\n[Command finished]\r\nPress any key to quit...");
      if (onClose) term.onKey(onClose);
    })();
    return () => {
      if (term) term.dispose();
    };
  }, []);

  return (
    <div
      ref={xtermRef}
      style={{ width: "100%", height: "100%", background: "#18181a" }}
    />
  );
}
