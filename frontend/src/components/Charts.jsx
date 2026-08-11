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
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316"
];

function CustomTooltip({ active, payload, label, formatCurrency, currencySymbol }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-950 border border-slate-700/80 p-4 rounded-2xl shadow-2xl text-xs text-slate-200 min-w-[190px]">
                <p className="font-bold text-white mb-2 pb-1.5 border-b border-slate-800 text-sm">
                    {label || payload[0].name}
                </p>
                {payload.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 my-1.5">
                        <span className="flex items-center gap-2 font-medium" style={{ color: item.color || item.fill }}>
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color || item.fill }}></span>
                            {item.name || item.dataKey}:
                        </span>
                        <strong className="text-white font-mono text-xs font-bold">
                            {typeof item.value === "number" && (item.dataKey?.includes("revenue") || item.dataKey?.includes("Amount") || item.dataKey?.includes("Revenue") || item.dataKey === "netRevenue" || item.dataKey === "grossRevenue" || item.dataKey === "refundAmount")
                                ? formatCurrency(item.value)
                                : item.value?.toLocaleString?.() || item.value}
                        </strong>
                    </div>
                ))}
            </div>
        );
    }
    return null;
}

function Charts() {
    const {
        result,
        cumulativeAnalysis,
        activePeriod,
        selectedMonths,
        formatCurrency,
        currencySymbol
    } = useAnalysis();

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

    let chartTitle = `Daily Revenue Velocity (${currencySymbol})`;
    let chartSub = "Full day-by-day revenue and activity trend";

    if (showMonthlyChart) {
        chartTitle =
            activePeriod === "months"
                ? `Comparison: ${selectedMonths.join(" + ")} (${currencySymbol})`
                : `Monthly Net Revenue & Trends (${currencySymbol})`;
        chartSub = "Side-by-side performance across selected billing periods";
    } else if (activePeriod === "months" && selectedMonths.length === 1) {
        chartTitle = `${selectedMonths[0]} — Daily Revenue Trend (${currencySymbol})`;
        chartSub = `Day-by-day revenue velocity across ${selectedMonths[0]}`;
    } else if (cumulativeMonthlyList.length === 1) {
        chartTitle = `${cumulativeMonthlyList[0].month} — Daily Revenue Trend (${currencySymbol})`;
        chartSub = `Day-by-day revenue velocity across ${cumulativeMonthlyList[0].month}`;
    }

    return (
        <section className="grid lg:grid-cols-2 gap-8 mb-10">
            {/* Payment Mode Distribution */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                    <div>
                        <h2 className="text-xl font-extrabold text-white tracking-tight">Payment Channel Distribution</h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Transaction share by payment gateway / channel</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {paymentData.length} Channels
                    </span>
                </div>

                <div className="w-full h-[340px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={paymentData}
                                dataKey="value"
                                outerRadius={115}
                                innerRadius={55}
                                paddingAngle={4}
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                                {paymentData.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} currencySymbol={currencySymbol} />} />
                            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "14px" }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Revenue Trend (Monthly/Daily) */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                    <div>
                        <h2 className="text-xl font-extrabold text-white tracking-tight">{chartTitle}</h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{chartSub}</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Settled ({currencySymbol})
                    </span>
                </div>

                <div className="w-full h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                            <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fontSize: 11, fill: "#94a3b8" }}
                                tickFormatter={(v) => (typeof v === "number" ? `${currencySymbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}` : v)}
                            />
                            <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} currencySymbol={currencySymbol} />} />
                            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "14px" }} />
                            <Bar
                                dataKey="netRevenue"
                                name={`Net Revenue (${currencySymbol})`}
                                fill="#06b6d4"
                                radius={[8, 8, 0, 0]}
                            />
                            {showMonthlyChart && (
                                <Bar
                                    dataKey="refundAmount"
                                    name={`Refund Amount (${currencySymbol})`}
                                    fill="#f59e0b"
                                    radius={[8, 8, 0, 0]}
                                />
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </section>
    );
}

export default Charts;