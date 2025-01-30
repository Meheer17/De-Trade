import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import { CreditCard, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import SalesOverviewChart from "../components/sales/SalesOverviewChart";
import SalesByCategoryChart from "../components/sales/SalesByCategoryChart";
import DailySalesTrend from "../components/sales/DailySalesTrend";

const salesStats = {
	totalRevenue: "$1,234,567",
	averageOrderValue: "$78.90",
	conversionRate: "3.45%",
	salesGrowth: "12.3%",
};

const SalesPage = () => {
	return (
		<div className="flex-1 overflow-auto relative z-10 bg-black text-green-300">
			<Header title="Sales Dashboard" textColor="text-green-300" />

			<main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
				{/* SALES STATS */}
				<motion.div
					className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard
						name="Total Revenue"
						icon={DollarSign}
						value={salesStats.totalRevenue}
						color="#22c55e"
						backgroundColor="bg-green-800"
					/>
					<StatCard
						name="Avg. Order Value"
						icon={ShoppingCart}
						value={salesStats.averageOrderValue}
						color="#4ade80"
						backgroundColor="bg-green-700"
					/>
					<StatCard
						name="Conversion Rate"
						icon={TrendingUp}
						value={salesStats.conversionRate}
						color="#facc15"
						backgroundColor="bg-yellow-800"
					/>
					<StatCard
						name="Sales Growth"
						icon={CreditCard}
						value={salesStats.salesGrowth}
						color="#f43f5e"
						backgroundColor="bg-red-800"
					/>
				</motion.div>

				{/* SALES OVERVIEW */}
				<div className="bg-green-900 p-4 rounded-lg shadow-lg">
					<SalesOverviewChart />
				</div>

				{/* CHARTS */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
					<div className="bg-green-900 p-4 rounded-lg shadow-lg">
						<SalesByCategoryChart />
					</div>
					<div className="bg-green-900 p-4 rounded-lg shadow-lg">
						<DailySalesTrend />
					</div>
				</div>
			</main>
		</div>
	);
};

export default SalesPage;
