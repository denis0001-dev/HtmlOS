import React from "react";
import { Dock, DockItem } from './components/Dock';
import { Menubar } from './components/Menubar';
import { WindowProvider, WindowsArea } from './components/WindowManager';
import finderIcon from "/res/finder.png";
import settingsIcon from "/res/settings.png";
import vscodeIcon from "/res/vscode.webp";

export default function App() {
    const [activeApp, setActiveApp] = React.useState('finder');
    const apps: DockItem[] = [
        { type: 'app', id: 'finder', name: 'Finder', icon: finderIcon },
        { type: 'app', id: 'settings', name: 'Settings', icon: settingsIcon },
        { type: 'app', id: 'vscode', name: 'Visual Studio Code', icon: vscodeIcon }
    ];
    const menubarRef = React.useRef<HTMLDivElement>(null);
    return (
        <WindowProvider>
            <div className="desktop">
                <Menubar menubarRef={menubarRef} />
                <div className="windows">
                    <WindowsArea />
                </div>
                <Dock apps={apps} activeAppId={activeApp} onAppClick={setActiveApp} />
            </div>
        </WindowProvider>
    );
}