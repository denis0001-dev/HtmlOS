import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useRef, useState } from "react";
function Dock() {
    return _jsx("div", { className: "macos-dock", children: "Dock (macOS style)" });
}
function Menubar() {
    return _jsx("div", { className: "macos-menubar", children: "Menu Bar (macOS style)" });
}
function Window({ title, children }) {
    const windowRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState(null);
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
    const onMouseDown = (e) => {
        if (position) {
            setDragging(true);
            setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };
    React.useEffect(() => {
        const onMouseMove = (e) => {
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
    return (_jsxs("div", { ref: windowRef, className: "macos-window", style: {
            left: position ? position.x : 0,
            top: position ? position.y : 0,
            zIndex: 100,
            userSelect: dragging ? "none" : undefined,
        }, children: [_jsxs("div", { className: "macos-window-titlebar", onMouseDown: onMouseDown, children: [_jsxs("div", { style: { display: "flex", gap: 6, marginRight: 12 }, children: [_jsx("span", { style: { width: 12, height: 12, borderRadius: "50%", background: "#ff5f56", display: "inline-block", border: "1px solid #e33e41" } }), _jsx("span", { style: { width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e", display: "inline-block", border: "1px solid #e09e3e" } }), _jsx("span", { style: { width: 12, height: 12, borderRadius: "50%", background: "#27c93f", display: "inline-block", border: "1px solid #13a10e" } })] }), _jsx("span", { style: { fontWeight: 500, fontSize: 15, color: "#222" }, children: title })] }), _jsx("div", { style: {
                    padding: 24,
                    flex: 1,
                }, children: children })] }));
}
export default function App() {
    return (_jsxs("div", { className: "macos-desktop", children: [_jsx(Menubar, {}), _jsx("div", { className: "macos-windows-area", children: _jsx(Window, { title: "Welcome", children: "Window Area (drag me!)" }) }), _jsx(Dock, {})] }));
}
