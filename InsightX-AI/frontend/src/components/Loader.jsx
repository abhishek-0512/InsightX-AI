import { FaSpinner } from "react-icons/fa";

function Loader({ message = "Analyzing data and generating report..." }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 my-8 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
            <FaSpinner className="animate-spin text-cyan-400 mb-4 text-4xl" />
            <p className="text-slate-200 font-semibold text-lg tracking-wide">
                {message}
            </p>
            <p className="text-slate-400 text-sm mt-2">
                This may take a few seconds. Please stay on the page.
            </p>
        </div>
    );
}

export default Loader;