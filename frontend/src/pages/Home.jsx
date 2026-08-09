import Navbar from "../components/Navbar";
import UploadBox from "../components/UploadBox";
import DateFilterBar from "../components/DateFilterBar";
import KPICards from "../components/KPICards";
import MonthlyBreakdownTable from "../components/MonthlyBreakdownTable";
import Charts from "../components/Charts";
import AllInsights from "../components/AllInsights";
import DownloadButton from "../components/DownloadButton";
import { useAnalysis } from "../context/AnalysisContext";

function Home() {
    const { result } = useAnalysis();
    const hasData = result && result.rows && result.rows.length > 0;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-cyan-500 selection:text-white flex flex-col justify-between">
            <div>
                <Navbar />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <UploadBox />

                    {hasData && (
                        <div className="space-y-2 animate-fade-in">
                            <DateFilterBar />
                            <KPICards />
                            <MonthlyBreakdownTable />
                            <Charts />
                            <AllInsights />
                            <DownloadButton />
                        </div>
                    )}
                </main>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-400">
                <p>InsightX AI — Enterprise Transaction Analytics & Revenue Intelligence System</p>
            </footer>
        </div>
    );
}

export default Home;