import { useEffect, useState } from "react";
import Papa from "papaparse";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, BarChart, LineChart, ArrowUpRight, ArrowDownRight } from "lucide-react";

// Sample CSV data (You can replace this with an actual file import)
const csvData = `
Date,Open,High,Low,Close,Shares Traded,Turnover (₹ Cr)
24-JAN-2024,21185.25,21482.35,21137.2,21453.95,407460664,41718.64
25-JAN-2024,21454.6,21459,21247.05,21352.6,418143077,40088.5
29-JAN-2024,21433.1,21763.25,21429.6,21737.6,376702289,34516.42
30-JAN-2024,21775.75,21813.05,21501.8,21522.1,375137333,32916.3
31-JAN-2024,21487.25,21741.35,21448.85,21725.7,410583065,41587.85
01-FEB-2024,21780.65,21832.95,21658.75,21697.45,332541208,34042.15
`;

const OverviewCards = () => {
    const [overviewData, setOverviewData] = useState([]);

    useEffect(() => {
        Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (result) => {
                const rows = result.data;

                // Extract the last two days for comparison
                const latest = rows[rows.length - 1];
                const previous = rows[rows.length - 2];

                if (latest && previous) {
                    const closingChange = (((latest.Close - previous.Close) / previous.Close) * 100).toFixed(2);
                    const turnoverChange = (((latest["Turnover (₹ Cr)"] - previous["Turnover (₹ Cr)"]) / previous["Turnover (₹ Cr)"]) * 100).toFixed(2);
                    const sharesTradedChange = (((latest["Shares Traded"] - previous["Shares Traded"]) / previous["Shares Traded"]) * 100).toFixed(2);

                    // Format data for UI
                    const data = [
                        { name: "Closing Price", value: `₹${latest.Close}`, change: closingChange, icon: LineChart },
                        { name: "Turnover", value: `₹${latest["Turnover (₹ Cr)"]} Cr`, change: turnoverChange, icon: DollarSign },
                        { name: "Shares Traded", value: `${latest["Shares Traded"].toLocaleString()}`, change: sharesTradedChange, icon: BarChart },
                    ];

                    setOverviewData(data);
                }
            },
        });
    }, []);

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {overviewData.map((item, index) => (
                <motion.div
                    key={item.name}
                    className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-400">{item.name}</h3>
                            <p className="mt-1 text-xl font-semibold text-gray-100">{item.value}</p>
                        </div>

                        <div className={`p-3 rounded-full bg-opacity-20 ${item.change >= 0 ? "bg-green-500" : "bg-red-500"}`}>
                            <item.icon className={`size-6 ${item.change >= 0 ? "text-green-500" : "text-red-500"}`} />
                        </div>
                    </div>

                    <div className={`mt-4 flex items-center ${item.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {item.change >= 0 ? <ArrowUpRight size="20" /> : <ArrowDownRight size="20" />}
                        <span className="ml-1 text-sm font-medium">{Math.abs(item.change)}%</span>
                        <span className="ml-2 text-sm text-gray-400">vs last period</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default OverviewCards;

