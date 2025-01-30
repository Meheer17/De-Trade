import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";

const productPerformanceData = [
	{ name: "Product A", APPLE: 4000, GOOGLE: 2400, META: 2400 },
	{ name: "Product B", APPLE: 3000, GOOGLE: 1398, META: 2210 },
	{ name: "Product C", APPLE: 2000, GOOGLE: 9800, META: 2290 },
	{ name: "Product D", APPLE: 2780, GOOGLE: 3908, META: 2000 },
	{ name: "Product E", APPLE: 1890, GOOGLE: 4800, META: 2181 },]

const ProductPerformance = () => {
	return (
		<motion.div
			className='bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
		>
			<h2 className='text-xl font-semibold text-gray-100 mb-4'>Product Performance</h2>
			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<BarChart data={productPerformanceData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#374151' />
						<XAxis dataKey='name' stroke='#9CA3AF' />
						<YAxis stroke='#9CA3AF' />
						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(31, 41, 55, 0.8)",
								borderColor: "#4B5563",
							}}
							itemStyle={{ color: "#E5E7EB" }}
						/>
						<Legend />
						<Bar dataKey='APPLE' fill='#8B5CF6' />
						<Bar dataKey='GOOGLE' fill='#10B981' />
						<Bar dataKey='META' fill='#F59E0B' />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default ProductPerformance;
