import { useState, useEffect } from "react";
import {
        ComposedChart,
        Bar,
        Line,
        XAxis,
        YAxis,
        CartesianGrid,
        Tooltip,
        ResponsiveContainer,
        Legend,
} from "recharts";
import { motion } from "framer-motion";

const CandlestickChart = () => {
        const [chartData, setChartData] = useState([]);

        useEffect(() => {
                // WebSocket connection setup
                const socket = new WebSocket("ws://localhost:8080/ws"); // Replace with your WebSocket server URL

                socket.onopen = () => {
                        console.log("WebSocket connection established");
                };

                socket.onmessage = (event) => {
                        const newStockData = JSON.parse(event.data);

                        setChartData((prevData) => {
                                // Maintain the chart with a fixed number of entries (e.g., 12)
                                const updatedData = [...prevData, newStockData];
                                if (updatedData.length > 12) {
                                        updatedData.shift(); // Remove the oldest entry
                                }
                                return updatedData;
                        });
                };

                socket.onerror = (error) => {
                        console.error("WebSocket error:", error);
                };
               socket.onclose = () => {
                        console.log("WebSocket connection closed");
                };

                return () => socket.close(); // Clean up on component unmount
        }, []);

        return (
                <motion.div
                        className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                >
                        <h2 className="text-lg font-medium mb-4 text-gray-100">Live Stock Data</h2>

                        <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                                                <XAxis dataKey="date" stroke="#9ca3af" />
                                                <YAxis stroke="#9ca3af" />
                                                <Tooltip
                                                        contentStyle={{
                                                                backgroundColor: "rgba(31, 41, 55, 0.8)",
                                                                borderColor: "#4B5563",
                                                        }}
                                                        itemStyle={{ color: "#E5E7EB" }}
                                                />
                                                <Legend />
                                                {/* Candlestick Bars */}
                                                <Bar
                                                        dataKey="high"
                                                        barSize={4}
                                                        fill="#10B981" // Green for High bars
                                                        isAnimationActive={true}
                                                        animationDuration={1000}
                                                        animationEasing="ease-in-out"
                                                        unit={"USD"}
                                                />
                                                <Bar
                                                        dataKey="low"
                                                        barSize={4}
                                                        fill="#8B5CF6" // Purple for Low bars
                                                        isAnimationActive={true}
                                                        animationDuration={1000}
                                                        animationEasing="ease-in-out"
                                                        unit={"USD"}
                                                />
                                                {/* Open-Close Lines */}
                                                <Line
                                                        type="monotone"
                                                        dataKey="open"
                                                        stroke="#6366F1" // Blue line for Open
                                                        strokeWidth={2}
                                                        isAnimationActive={true}
                                                        animationDuration={1000}
                                                        animationEasing="ease-in-out"
                                                />
                                                <Line
                                                        type="monotone"
                                                        dataKey="close"
                                                        stroke="#EF4444" // Red line for Close
                                                        strokeWidth={2}
                                                        isAnimationActive={true}
                                                        animationDuration={1000}
                                                        animationEasing="ease-in-out"
                                                />
                                        </ComposedChart>
                                </ResponsiveContainer>
                        </div>
                </motion.div>
        );
};

export default CandlestickChart;

