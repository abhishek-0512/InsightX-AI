import React from "react";
import Navbar from "../components/Navbar";
import UploadBox from "../components/UploadBox";
import KPICards from "../components/KPICards";
import Charts from "../components/Charts";
import LocationRefundAnalytics from "../components/LocationRefundAnalytics";
import DeviceAnalytics from "../components/DeviceAnalytics";
import AllInsights from "../components/AllInsights";
import DownloadButton from "../components/DownloadButton";
import { useAnalysis } from "../context/AnalysisContext";

export default function Home() {
    const { result } = useAnalysis();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
            <Navbar />

            <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-grow">
                <UploadBox />

                {result ? (
                    <div className="animate-fadeIn transition-all duration-300">
                        <KPICards />
                        <Charts />
                        <LocationRefundAnalytics />
                        <DeviceAnalytics />
                        <AllInsights />
                        <DownloadButton />
                    </div>
                ) : (
                    <div className="text-center py-16 bg-slate-900/40 border border-slate-800/60 rounded-2xl my-6">
                        <p className="text-slate-400 font-medium text-lg">
                            Upload your transaction spreadsheet or CSV file above to instantly generate your complete business analytics dashboard and professional reports.
                        </p>
                    </div>
                )}
            </main>

            <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
                &copy; {new Date().getFullYear()} InsightX AI &bull; All Rights Reserved
            </footer>
        </div>
    );
}