import React, { createContext, useContext, useState } from "react";

export interface WindowEntry {
    id: string;
    title: string;
    content: React.ReactNode;
}

interface WindowContextType {
    windows: WindowEntry[];
    openWindow: (entry: Omit<WindowEntry, 'id'>) => void;
    closeWindow: (id: string) => void;
}

const WindowContext = createContext<WindowContextType | undefined>(undefined);

let windowIdCounter = 0;

export function WindowProvider({ children }: { children: React.ReactNode }) {
    const [windows, setWindows] = useState<WindowEntry[]>([{
        id: 'welcome',
        title: 'Welcome',
        content: <>Window Area (drag me!)</>,
    }]);

    const openWindow = (entry: Omit<WindowEntry, 'id'>) => {
        setWindows(wins => [...wins, { ...entry, id: `window_${windowIdCounter++}` }]);
    };
    const closeWindow = (id: string) => {
        setWindows(wins => wins.filter(w => w.id !== id));
    };
    return (
        <WindowContext.Provider value={{ windows, openWindow, closeWindow }}>
            {children}
        </WindowContext.Provider>
    );
}

export function useWindows() {
    const ctx = useContext(WindowContext);
    if (!ctx) throw new Error('useWindows must be used within a WindowProvider');
    return ctx;
}

export function WindowButtons(
    { onClose }: { onClose?: () => void }
) {
    return (
        <div style={{ display: "flex", gap: 6, marginRight: 12 }}>
            <span
                style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56", display: "inline-block", border: "1px solid #e33e41", cursor: 'pointer' }}
                onClick={() => {
                    if (onClose) onClose()
                }}
            />
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e", display: "inline-block", border: "1px solid #e09e3e" }} />
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f", display: "inline-block", border: "1px solid #13a10e" }} />
        </div>
    )
}

// Draggable, closable, animated Window component
function Window({ title, children, onClose }: { title: string; children: React.ReactNode; onClose?: () => void }) {
    const windowRef = React.useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = React.useState(false);
    const [offset, setOffset] = React.useState({ x: 0, y: 0 });
    const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null);
    const [closing, setClosing] = React.useState(false);

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
            if (dragging && windowRef.current) {
                const win = windowRef.current;
                const rect = win.getBoundingClientRect();
                const { innerWidth, innerHeight } = window;

                // Only update if cursor is inside the browser window
                if (e.clientX >= 0 && e.clientX <= innerWidth) {
                    let newX = e.clientX - offset.x;
                    let newY = e.clientY - offset.y;

                    newY = Math.max(0, Math.min(newY, innerHeight - rect.height));

                    setPosition({ x: newX, y: newY });
                }
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

    // Handle close animation
    const handleClose = () => {
        setClosing(true);
        setTimeout(() => {
            if (onClose) onClose();
        }, 300); // match CSS transition duration
    };

    return (
        <div
            ref={windowRef}
            className={`window${closing ? ' window-closing' : ''}`}
            style={{
                left: position ? position.x : 0,
                top: position ? position.y : 0,
                zIndex: 100,
                userSelect: dragging ? "none" : undefined,
            }}
        >
            <div
                className="titlebar"
                onMouseDown={onMouseDown}
            >
                <WindowButtons onClose={handleClose} />
                <span>{title}</span>
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

export function WindowsArea() {
    const { windows, closeWindow } = useWindows();

    return (
        <>
            {windows.map((win) => (
                <Window key={win.id} title={win.title} onClose={() => closeWindow(win.id)}>
                    {win.content}
                </Window>
            ))}
        </>
    );
}