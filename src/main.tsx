import React, { useRef, useState, createContext, useContext } from "react";
import LiquidGlass from "liquid-glass-react";
import { Dock } from './components/Dock';
import { Menubar } from './components/Menubar';
import { WindowProvider, useWindows, WindowsArea } from './components/WindowManager';
import finderIcon from "/res/finder.png";
import settingsIcon from "/res/settings.png";

export default function App() {
    const [activeApp, setActiveApp] = React.useState('finder');
    const apps = [
        { type: 'app', id: 'finder', name: 'Finder', icon: finderIcon },
        { type: 'app', id: 'settings', name: 'Settings', icon: settingsIcon }
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