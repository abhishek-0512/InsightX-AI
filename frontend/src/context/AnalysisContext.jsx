import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AnalysisContext = createContext();

const API_BASE_URL = "https://insightx-ai.onrender.com";

export const AnalysisProvider = ({ children }) => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const analyzeFile = async (file) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("file", file);

            const res = await axios.post(`${API_BASE_URL}/api/analytics`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const payload = res.data.data || res.data;
            setResult(payload);
            toast.success("File analyzed successfully!");
        } catch (err) {
            console.error("Analysis Error:", err);
            toast.error(err.response?.data?.message || "Failed to analyze file.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnalysisContext.Provider value={{ result, loading, analyzeFile }}>
            {children}
        </AnalysisContext.Provider>
    );
};

export const useAnalysis = () => useContext(AnalysisContext);