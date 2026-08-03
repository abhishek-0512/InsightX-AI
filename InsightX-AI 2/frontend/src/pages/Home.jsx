import Navbar from "../components/Navbar";
import UploadBox from "../components/UploadBox";
import KPICards from "../components/KPICards";
import Charts from "../components/Charts";
import AllInsights from "../components/AllInsights";
import DownloadButton from "../components/DownloadButton";

function Home() {

    return (

        <div className="min-h-screen bg-slate-950">

            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-8">

                <UploadBox />

                <KPICards />

                <Charts />

                <AllInsights />

                <DownloadButton />

            </div>

        </div>

    );

}

export default Home;