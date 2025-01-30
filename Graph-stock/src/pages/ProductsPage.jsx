import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";

import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import SalesTrendChart from "../components/products/SalesTrendChart";
import ProductsTable from "../components/products/ProductsTable";

const ProductsPage = () => {
	return (
		<div className="flex-1 overflow-auto relative z-10 bg-black text-green-300">
			<Header title="Products" textColor="text-green-300" />

			<main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
				{/* STATS */}
				<motion.div
					className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard
						name="Total Products"
						icon={Package}
						value={1234}
						color="#22c55e"
						backgroundColor="bg-green-800"
					/>
					<StatCard
						name="Top Selling"
						icon={TrendingUp}
						value={89}
						color="#4ade80"
						backgroundColor="bg-green-700"
					/>
					<StatCard
						name="Low Stock"
						icon={AlertTriangle}
						value={23}
						color="#facc15"
						backgroundColor="bg-yellow-800"
					/>
					<StatCard
						name="Total Revenue"
						icon={DollarSign}
						value={"$543,210"}
						color="#f43f5e"
						backgroundColor="bg-red-800"
					/>
				</motion.div>

				{/* PRODUCT TABLE */}
				<div className="bg-green-900 p-4 rounded-lg shadow-lg">
					<ProductsTable />
				</div>

				{/* CHARTS */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
					<div className="bg-green-900 p-4 rounded-lg shadow-lg">
						<SalesTrendChart />
					</div>
					<div className="bg-green-900 p-4 rounded-lg shadow-lg">
						<CategoryDistributionChart />
					</div>
				</div>
			</main>
		</div>
	);
};

export default ProductsPage;
