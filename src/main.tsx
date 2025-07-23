import React, { useRef, useState } from "react";
import LiquidGlass from "liquid-glass-react";
import finderIcon from "/res/finder.png";
import settingsIcon from "/res/settings.png";

// Reusable Dock component
interface DockApp {
    id: string;
    name: string;
    icon: string; // path to icon
}

// DockItem component
function DockItem({ app, active, onClick }: {
    app: DockApp;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <div
            className={"icon-container" + (active ? " icon-active" : "")}
            onClick={onClick}
        >
            <img
                src={app.icon}
                alt={app.name}
                className="icon"
            />
            <span className="tooltip">{app.name}</span>
            {active && <span className="indicator" />}
        </div>
    );
}

// DockSeparator component
function DockSeparator() {
    return <div className="separator" />;
}

// Update DockApp type to allow separators
type DockItemType = { type: 'app'; id: string; name: string; icon: string } | { type: 'separator'; id: string };

function Dock({ apps, activeAppId, onAppClick }: {
    apps: DockItemType[];
    activeAppId: string;
    onAppClick: (id: string) => void;
}) {
    return (
        <div className="dock">
            <div className="wrapper">
                {apps.map(item => {
                    if (item.type === 'separator') {
                        return <DockSeparator key={item.id} />;
                    }
                    return (
                        <DockItem
                            key={item.id}
                            app={item}
                            active={activeAppId === item.id}
                            onClick={() => onAppClick(item.id)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function Menubar() {
    return <div className="menubar">Menu Bar (macOS style)</div>;
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
            className="window"
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
                <div style={{ display: "flex", gap: 6, marginRight: 12 }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56", display: "inline-block", border: "1px solid #e33e41" }} />
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e", display: "inline-block", border: "1px solid #e09e3e" }} />
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f", display: "inline-block", border: "1px solid #13a10e" }} />
                </div>
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

// Update App to use the new DockItemType and add a separator
export default function App() {
    const [activeApp, setActiveApp] = React.useState('finder');
    const apps: DockItemType[] = [
        { type: 'app', id: 'finder', name: 'Finder', icon: finderIcon },
        { type: 'app', id: 'settings', name: 'Settings', icon: settingsIcon }
    ];
    return (
        <div className="desktop">
            <Menubar />
            <div className="windows">
                <Window title="Welcome">
                    Window Area (drag me!)
                </Window>
            </div>
            <Dock apps={apps} activeAppId={activeApp} onAppClick={setActiveApp} />
        </div>
    );
}