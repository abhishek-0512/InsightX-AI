import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { AnalysisProvider } from "./context/AnalysisContext";
import { Toaster } from "react-hot-toast";

export default function App() {
    return (
        <AnalysisProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </Router>
            <Toaster position="top-right" />
        </AnalysisProvider>
    );
}