import React from "react";

export function Menubar({ menubarRef }: { menubarRef: React.RefObject<HTMLDivElement> }) {
    return <div className="menubar" ref={menubarRef}>Menu Bar (macOS style)</div>;
}