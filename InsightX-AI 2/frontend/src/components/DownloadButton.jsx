import { FaDownload } from "react-icons/fa";
import { useAnalysis } from "../context/AnalysisContext";

function DownloadButton() {

    const { result } = useAnalysis();

    const reportPath = result?.reportPath;

    if (!reportPath) return null;

    const handleDownload = () => {
        window.open(
            `http://localhost:5001${reportPath}`,
            "_blank"
        );
    };

    return (

        <div className="flex justify-center mt-10">

            <button
                onClick={handleDownload}
                className="flex items-center gap-3 bg-green-600 hover:bg-green-700 transition px-8 py-4 rounded-xl font-semibold text-lg"
            >

                <FaDownload size={20} />

                Download Excel Report

            </button>

        </div>

    );

}

export default DownloadButton;