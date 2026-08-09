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

function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 border border-slate-700 p-3.5 rounded-xl shadow-2xl text-xs text-slate-200 min-w-[160px]">
                <p className="font-bold text-white mb-2 pb-1 border-b border-slate-800">{label || payload[0].name}</p>
                {payload.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 my-1">
                        <span className="flex items-center gap-1.5" style={{ color: item.color || item.fill }}>
                            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color || item.fill }}></span>
                            {item.name || item.dataKey}:
                        </span>
                        <strong className="text-white font-mono">
                            {typeof item.value === "number" && (item.dataKey?.includes("revenue") || item.dataKey?.includes("Amount") || item.dataKey?.includes("Revenue") || item.dataKey === "netRevenue" || item.dataKey === "grossRevenue" || item.dataKey === "refundAmount")
                                ? `₹${item.value.toLocaleString()}`
                                : item.value}
                        </strong>
                    </div>
                ))}
            </div>
        );
    }
    return null;
}

function Charts() {
    const { result, cumulativeAnalysis, activePeriod, selectedMonths } = useAnalysis();

    const analysis = result?.analysis;
    if (!analysis) return null;

    // Payment mode data
    const paymentData = Object.entries(analysis.payment?.paymentModes || {}).map(([name, value]) => ({
        name,
        value
    }));

    // Monthly data from cumulative analysis
    const cumulativeMonthlyList = cumulativeAnalysis?.monthly?.monthlyList || [];

    // Filter monthly list if specific months are selected
    const activeMonthlyList =
        activePeriod === "months" && selectedMonths.length > 1
            ? cumulativeMonthlyList.filter((m) => selectedMonths.includes(m.month))
            : cumulativeMonthlyList;

    const monthlyBarData = activeMonthlyList.map((m) => ({
        label: m.month,
        netRevenue: m.netAmount,
        grossRevenue: m.grossAmount,
        refundAmount: m.refundAmount,
        transactions: m.transactions
    }));

    // Daily data: Full month days
    const dailyData = Object.entries(analysis.daily || {})
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([dateStr, stats]) => ({
            label: dateStr.slice(5), // MM-DD
            netRevenue: Math.round(stats.amount || 0),
            transactions: stats.transactions || 0,
            refunds: stats.refunds || 0
        }));

    // Determine chart mode
    const showMonthlyChart =
        (activePeriod === "all" && cumulativeMonthlyList.length > 1) ||
        (activePeriod === "months" && selectedMonths.length > 1);

    const chartData = showMonthlyChart ? monthlyBarData : dailyData.length ? dailyData : monthlyBarData;

    let chartTitle = "Daily Revenue Velocity (₹)";
    let chartSub = "Full day-by-day revenue and activity trend";

    if (showMonthlyChart) {
        chartTitle =
            activePeriod === "months"
                ? `Selected Months Comparison (${selectedMonths.join(" & ")})`
                : "Monthly Net Revenue & Transactions";
        chartSub = "Side-by-side cumulative performance comparison";
    } else if (activePeriod === "months" && selectedMonths.length === 1) {
        chartTitle = `${selectedMonths[0]} - Daily Revenue Trend`;
        chartSub = `Daily revenue & transaction velocity across ${selectedMonths[0]}`;
    } else if (cumulativeMonthlyList.length === 1) {
        chartTitle = `${cumulativeMonthlyList[0].month} - Daily Revenue Trend`;
        chartSub = `Daily revenue & transaction velocity across ${cumulativeMonthlyList[0].month}`;
    }

    return (
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Payment Mode Distribution */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-white">Payment Mode Distribution</h2>
                        <p className="text-xs text-slate-400">Transaction count by gateway / method</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
                        {paymentData.length} Modes
                    </span>
                </div>

                <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                        <Pie
                            data={paymentData}
                            dataKey="value"
                            outerRadius={105}
                            innerRadius={45}
                            paddingAngle={3}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                            {paymentData.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Revenue Trend (Monthly/Daily) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-white">{chartTitle}</h2>
                        <p className="text-xs text-slate-400">{chartSub}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                        Revenue (₹)
                    </span>
                </div>

                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                        <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                        <Bar
                            dataKey="netRevenue"
                            name="Net Revenue (₹)"
                            fill="#06b6d4"
                            radius={[6, 6, 0, 0]}
                        />
                        {showMonthlyChart && (
                            <Bar
                                dataKey="refundAmount"
                                name="Refund Amount (₹)"
                                fill="#f59e0b"
                                radius={[6, 6, 0, 0]}
                            />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default Charts;