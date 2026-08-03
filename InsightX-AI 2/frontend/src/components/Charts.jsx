import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

import { useAnalysis } from "../context/AnalysisContext";

const COLORS = [
    "#06b6d4",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#14b8a6",
    "#f97316"
];

function Charts() {

    const { result } = useAnalysis();

    const analysis = result?.analysis;

    if (!analysis) return null;

    const paymentData = Object.entries(
        analysis.payment?.paymentModes || {}
    ).map(([name, value]) => ({
        name,
        value
    }));

    const monthlyData = Object.entries(
        analysis.monthly?.monthly || {}
    ).map(([month, stats]) => ({
        month,
        revenue: stats.amount,
        transactions: stats.transactions
    }));

    return (

        <div className="grid lg:grid-cols-2 gap-6 mb-8">

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

                <h2 className="text-xl font-bold mb-6">
                    Payment Mode Distribution
                </h2>

                <ResponsiveContainer
                    width="100%"
                    height={320}
                >

                    <PieChart>

                        <Pie
                            data={paymentData}
                            dataKey="value"
                            outerRadius={110}
                            label
                        >

                            {paymentData.map((_, index) => (

                                <Cell
                                    key={index}
                                    fill={
                                        COLORS[
                                            index %
                                            COLORS.length
                                        ]
                                    }
                                />

                            ))}

                        </Pie>

                        <Tooltip />

                        <Legend />

                    </PieChart>

                </ResponsiveContainer>

            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

                <h2 className="text-xl font-bold mb-6">
                    Monthly Revenue
                </h2>

                <ResponsiveContainer
                    width="100%"
                    height={320}
                >

                    <BarChart
                        data={monthlyData}
                    >

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="month" />

                        <YAxis />

                        <Tooltip />

                        <Legend />

                        <Bar
                            dataKey="revenue"
                            fill="#06b6d4"
                            radius={[8, 8, 0, 0]}
                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>

        </div>

    );

}

export default Charts;