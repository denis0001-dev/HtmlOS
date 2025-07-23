import React from "react";

export interface DockApp {
    id: string;
    name: string;
    icon: string;
}

export type DockItem = { type: 'app'; id: string; name: string; icon: string } | { type: 'separator'; id: string };

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

function DockSeparator() {
    return <div className="separator" />;
}

export function Dock({ apps, activeAppId, onAppClick }: {
    apps: DockItem[];
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