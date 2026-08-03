import React from "react";

export default function Navbar() {
    return (
        <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-cyan-500 text-slate-950 font-black px-3 py-1 rounded-lg text-lg">
                        IX
                    </div>
                    <span className="font-bold text-lg text-white tracking-wide">InsightX AI</span>
                </div>
                <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
                    v4.0 Live Engine
                </span>
            </div>
        </header>
    );
}