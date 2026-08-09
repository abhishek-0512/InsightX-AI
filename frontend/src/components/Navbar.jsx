import { FaChartLine } from "react-icons/fa";

function Navbar() {
    return (
        <nav className="border-b border-slate-800 bg-slate-900">

            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                <div className="flex items-center gap-3">

                    <FaChartLine
                        size={26}
                        className="text-cyan-400"
                    />

                    <div>
                        <h1 className="text-2xl font-bold">
                            InsightX AI
                        </h1>

                        <p className="text-xs text-slate-400">
                            CSV & Excel Analytics Platform
                        </p>
                    </div>

                </div>

                <div className="text-sm text-slate-400">
                    AI Powered Reporting
                </div>

            </div>

        </nav>
    );
}

export default Navbar;