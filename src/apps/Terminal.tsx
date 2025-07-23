import React, { useEffect, useRef } from "react";
import { Terminal as XTerm } from "xterm";
import "xterm/css/xterm.css";

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

// Commands object
const commands: { [key: string]: (args: string[], term: XTerm) => Promise<void> } = {
  async help(args, term) {
    term.write("\r\nAvailable commands: help, echo, clear\r\n");
  },
  async echo(args, term) {
    term.write("\r\n" + args.join(" ") + "\r\n");
  },
  async clear(args, term) {
    term.write("\r\n");
    term.clear();
  }
};

export function Terminal() {
  const xtermRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);

  useEffect(() => {
    if (!xtermRef.current) return;
    const PROMPT = "$ ";
    let inputBuffer = "";
    let cursorPos = 0; // position in inputBuffer
    const term = new XTerm({
      theme: {
        background: "#18181a",
        foreground: "#eee"
      },
      fontFamily: 'monospace',
      fontSize: 15,
      cursorBlink: true,
      // @ts-ignore
      customKeyEventHandler: (ev) => {
        // Allow all keys, we'll handle logic in onData
        return true;
      }
    });
    term.open(xtermRef.current);
    term.write("\x1b[32mWelcome to HtmlOS Terminal!\x1b[0m\r\n" + PROMPT);
    termRef.current = term;

    function redraw() {
      // Move to start of line, clear line, write prompt + inputBuffer
      term.write('\r');
      term.write('\x1b[2K');
      term.write(PROMPT + inputBuffer);
      // Move cursor to correct position (1-based col)
      const promptLength = PROMPT.length;
      term.write(`\x1b[${promptLength + cursorPos + 1}G`);
    }

    term.onData(async data => {
      if (data === "\r") {
        // Enter pressed
        const args = parseArgs(inputBuffer);
        const cmd = args[0];
        if (cmd && commands[cmd]) {
          await commands[cmd](args.slice(1), term);
        } else if (cmd === "") {
          term.write("\r\n");
        } else {
          term.write("\r\nCommand not found: " + inputBuffer + "\r\n");
        }
        inputBuffer = "";
        cursorPos = 0;
        term.write(PROMPT);
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
    });

    return () => {
      term.dispose();
    };
  }, []);

  return (
    <div
      ref={xtermRef}
      style={{ width: "100%", height: "100%", background: "#18181a" }}
    />
  );
}
