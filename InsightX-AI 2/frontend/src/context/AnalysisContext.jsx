import { createContext, useContext, useState } from "react";

const AnalysisContext = createContext();

export function AnalysisProvider({ children }) {

    const [result, setResult] = useState(null);

    return (
        <AnalysisContext.Provider
            value={{
                result,
                setResult
            }}
        >
            {children}
        </AnalysisContext.Provider>
    );
}

export function useAnalysis() {
    return useContext(AnalysisContext);
}