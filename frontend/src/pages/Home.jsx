import Navbar from "../components/Navbar";
import UploadBox from "../components/UploadBox";
import DateFilterBar from "../components/DateFilterBar";
import KPICards from "../components/KPICards";
import MonthlyBreakdownTable from "../components/MonthlyBreakdownTable";
import Charts from "../components/Charts";
import AllInsights from "../components/AllInsights";
import DownloadButton from "../components/DownloadButton";

function Home() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <UploadBox />

                <DateFilterBar />

                <KPICards />

                <MonthlyBreakdownTable />

                <Charts />

                <AllInsights />

                <DownloadButton />
            </div>
        </div>
    );
}

export default Home;