import { FaChartBar, FaBolt, FaCoins, FaGlobe } from "react-icons/fa";
import { useAnalysis } from "../context/AnalysisContext";

function Navbar() {
    const { currency, setCurrency, availableCurrencies, currencySymbol } = useAnalysis();

    return (
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                {/* Logo & Brand */}
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
                        <FaChartBar size={22} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                                Insight<span className="text-cyan-400">X</span> AI
                            </h1>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider hidden xs:inline">
                                Pro Analytics
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium hidden sm:block">
                            Enterprise Transaction & Revenue Intelligence Engine
                        </p>
                    </div>
                </div>

                {/* Right Controls: Currency Selector & Status */}
                <div className="flex items-center gap-3">
                    {/* Currency Selector */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition shadow-inner">
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs font-bold shrink-0">
                            {currencySymbol}
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="currency-select" className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                                Currency
                            </label>
                            <select
                                id="currency-select"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-1"
                            >
                                {availableCurrencies.map((c) => (
                                    <option key={c.code} value={c.code} className="bg-slate-900 text-white font-medium">
                                        {c.flag} {c.code} ({c.symbol}) — {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* AI Engine Status */}
                    <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
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