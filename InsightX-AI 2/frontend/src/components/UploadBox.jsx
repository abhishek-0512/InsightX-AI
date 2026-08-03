import { useRef, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import toast from "react-hot-toast";

import api from "../api/axios";
import { useAnalysis } from "../context/AnalysisContext";

function UploadBox() {

    const { setAnalysis } = useAnalysis();

    const inputRef = useRef();

    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState("");

    const handleUpload = async (e) => {

        const file = e.target.files[0];

        if (!file) return;

        setFileName(file.name);

        const formData = new FormData();

        formData.append("file", file);

        try {

            setLoading(true);

            const { data } = await api.post(
                "/upload",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );

            setAnalysis(data.analysis);

            toast.success(data.message);

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                "Upload Failed"
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 mb-8">

            <div className="flex flex-col items-center gap-5">

                <FaCloudUploadAlt
                    size={80}
                    className="text-cyan-400"
                />

                <h1 className="text-3xl font-bold">
                    Upload CSV / Excel File
                </h1>

                <p className="text-slate-400">
                    Supported: CSV, XLS, XLSX
                </p>

                <button
                    onClick={() => inputRef.current.click()}
                    disabled={loading}
                    className="bg-cyan-500 hover:bg-cyan-600 px-8 py-3 rounded-lg font-semibold"
                >
                    {loading ? "Analyzing..." : "Choose File"}
                </button>

                {fileName && (
                    <p className="text-green-400">
                        {fileName}
                    </p>
                )}

                <input
                    hidden
                    ref={inputRef}
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    onChange={handleUpload}
                />

            </div>

        </div>

    );

}

export default UploadBox;