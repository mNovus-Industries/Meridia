import { useEffect, useRef } from "react";
import { Terminal as XTerminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "@xterm/xterm/css/xterm.css";

export const Terminal = () => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const terminalInstance = useRef<XTerminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current || terminalInstance.current) return;

    const term = new XTerminal({
      cursorBlink: true,
      fontFamily: "JetBrains Mono, monospace",
      fontSize: 14,
      letterSpacing: 0,
      lineHeight: 1.4,
      theme: {
        background: "#1e1e1e",
        foreground: "#d4d4d4",
        cursor: "#ffffff",
        black: "#000000",
        red: "#cd3131",
        green: "#0dbc79",
        yellow: "#e5e510",
        blue: "#2472c8",
        magenta: "#bc3fbc",
        cyan: "#11a8cd",
        white: "#e5e5e5",
        brightBlack: "#666666",
        brightRed: "#f14c4c",
        brightGreen: "#23d18b",
        brightYellow: "#f5f543",
        brightBlue: "#3b8eea",
        brightMagenta: "#d670d6",
        brightCyan: "#29b8db",
        brightWhite: "#e5e5e5",
      },
    });

    const fit = new FitAddon();
    terminalInstance.current = term;
    fitAddon.current = fit;
    term.loadAddon(fit);
    term.open(terminalRef.current);

    window.electron.ipcRenderer.send("terminal.keystroke", "\r");

    // Delay the fit call slightly to ensure terminal is fully rendered
    setTimeout(() => {
      requestAnimationFrame(() => {
        if (fitAddon.current && terminalRef.current?.offsetWidth) {
          fitAddon.current.fit();
        }
      });
    }, 50);

    // Resize handling
    const handleResize = () => {
      if (fitAddon.current) {
        fitAddon.current.fit();
      }
    };

    window.addEventListener("resize", handleResize);

    term.onResize(({ cols, rows }) => {
      window.electron.ipcRenderer.send("terminal.resize", { cols, rows });
    });

    window.electron.ipcRenderer.on(
      "terminal.incomingData",
      (_event: any, data: any) => {
        term.write(data);
      }
    );

    term.onData((data) => {
      window.electron.ipcRenderer.send("terminal.keystroke", data);
    });

    return () => {
      term.dispose();
      window.removeEventListener("resize", handleResize);
      window.electron.ipcRenderer.removeAllListeners("terminal.incomingData");
    };
  }, []);

  return (
    <div
      ref={terminalRef}
      className="terminal"
      style={{ height: "100%", width: "100%", display: "flex" }}
    />
  );
};
