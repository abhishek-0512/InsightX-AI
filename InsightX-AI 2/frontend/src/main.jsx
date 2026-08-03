import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";

import "./index.css";
import App from "./App";
import { AnalysisProvider } from "./context/AnalysisContext";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>

        <AnalysisProvider>

            <Toaster
                position="top-right"
                reverseOrder={false}
            />

            <App />

        </AnalysisProvider>

    </React.StrictMode>
);