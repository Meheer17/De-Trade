import { CheckCircle, Clock, DollarSign, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import DailyOrders from "../components/orders/DailyOrders";
import OrderDistribution from "../components/orders/OrderDistribution";
import OrdersTable from "../components/orders/OrdersTable";

const orderStats = {
	totalOrders: "1,234",
	pendingOrders: "56",
	completedOrders: "1,178",
	totalRevenue: "$98,765",
};

const OrdersPage = () => {
	return (
		<div className="flex-1 relative z-10 overflow-auto bg-black text-green-300">
			<Header title={"Orders"} textColor="text-green-300" />

			<main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
				{/* ORDER STATS */}
				<motion.div
					className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard
						name="Total Orders"
						icon={ShoppingBag}
						value={orderStats.totalOrders}
						color="#22c55e"
						backgroundColor="bg-green-800"
					/>
					<StatCard
						name="Pending Orders"
						icon={Clock}
						value={orderStats.pendingOrders}
						color="#facc15"
						backgroundColor="bg-yellow-700"
					/>
					<StatCard
						name="Completed Orders"
						icon={CheckCircle}
						value={orderStats.completedOrders}
						color="#4ade80"
						backgroundColor="bg-green-700"
					/>
					<StatCard
						name="Total Revenue"
						icon={DollarSign}
						value={orderStats.totalRevenue}
						color="#f43f5e"
						backgroundColor="bg-red-800"
					/>
				</motion.div>

				{/* DAILY ORDERS AND DISTRIBUTION */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
					<div className="bg-green-900 p-4 rounded-lg shadow-lg">
						<DailyOrders />
					</div>
					<div className="bg-green-900 p-4 rounded-lg shadow-lg">
						<OrderDistribution />
					</div>
				</div>

				{/* ORDERS TABLE */}
				<div className="bg-green-900 p-4 rounded-lg shadow-lg">
					<OrdersTable />
				</div>
			</main>
		</div>
	);
};

export default OrdersPage;
