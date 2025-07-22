import React, { useRef, useState } from "react";
import LiquidGlass from "liquid-glass-react";

function Dock() {
    return <div className="macos-dock">Dock (macOS style)</div>;
}

function Menubar() {
    return <div className="macos-menubar">Menu Bar (macOS style)</div>;
}

function Window({ title, children }: { title: string; children: React.ReactNode }) {
    const windowRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

    React.useEffect(() => {
        // Center the window on mount (always use pixel position)
        if (windowRef.current && position === null) {
            const win = windowRef.current;
            const { innerWidth, innerHeight } = window;
            const rect = win.getBoundingClientRect();
            setPosition({
                x: Math.max((innerWidth - rect.width) / 2, 0),
                y: Math.max((innerHeight - rect.height) / 2, 0),
            });
        }
    }, [windowRef, position]);

    const onMouseDown = (e: React.MouseEvent) => {
        if (position) {
            setDragging(true);
            setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    React.useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (dragging) {
                setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
            }
        };
        const onMouseUp = () => setDragging(false);
        if (dragging) {
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [dragging, offset]);

    return (
        <div
            ref={windowRef}
            className="macos-window"
            style={{
                left: position ? position.x : 0,
                top: position ? position.y : 0,
                zIndex: 100,
                userSelect: dragging ? "none" : undefined,
            }}
        >
            <div
                className="macos-window-titlebar"
                onMouseDown={onMouseDown}
            >
                <div style={{ display: "flex", gap: 6, marginRight: 12 }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56", display: "inline-block", border: "1px solid #e33e41" }} />
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e", display: "inline-block", border: "1px solid #e09e3e" }} />
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f", display: "inline-block", border: "1px solid #13a10e" }} />
                </div>
                <span style={{ fontWeight: 500, fontSize: 15, color: "#222" }}>{title}</span>
            </div>
            <div 
                style={{ 
                    padding: 24,
                    flex: 1,
                }}
            >
                {children}
            </div>
        </div>
    );
}

export default function App() {
    return (
        <div className="macos-desktop">
            <Menubar />
            <div className="macos-windows-area">
                <Window title="Welcome">
                    Window Area (drag me!)
                </Window>
            </div>
            <Dock />
        </div>
    );
}