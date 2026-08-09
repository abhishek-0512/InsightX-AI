import { FaChartBar, FaBolt } from "react-icons/fa";

function Navbar() {
    return (
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo & Brand */}
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
                        <FaChartBar size={22} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black tracking-tight text-white">
                                Insight<span className="text-cyan-400">X</span> AI
                            </h1>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                                Pro Analytics
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                            Enterprise Transaction & Revenue Intelligence Engine
                        </p>
                    </div>
                </div>

                {/* Right Status */}
                <div className="hidden sm:flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                        <FaBolt className="text-amber-400" size={12} />
                        <span className="font-semibold text-slate-200">AI Engine</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-[11px] text-emerald-400 font-medium">Ready</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Navbar;