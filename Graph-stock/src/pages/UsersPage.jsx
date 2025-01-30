import { UserCheck, UserPlus, Users as UsersIcon, UserX } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import UsersTable from "../components/users/UsersTable";
import UserGrowthChart from "../components/users/UserGrowthChart";
import UserActivityHeatmap from "../components/users/UserActivityHeatmap";
import UserDemographicsChart from "../components/users/UserDemographicsChart";

const userStats = {
    totalUsers: 152845,
    newUsersToday: 243,
    activeUsers: 98520,
    churnRate: "2.4%",
};

const UsersPage = () => {
    return (
        <div className="flex-1 overflow-auto relative z-10 bg-black text-green-300">
            <Header title="Users" textColor="text-green-300" />

            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                {/* STATS */}
                <motion.div
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard
                        name="Total Users"
                        icon={UsersIcon}
                        value={userStats.totalUsers.toLocaleString()}
                        color="#22c55e"
                        backgroundColor="bg-green-800"
                    />
                    <StatCard
                        name="New Users Today"
                        icon={UserPlus}
                        value={userStats.newUsersToday}
                        color="#4ade80"
                        backgroundColor="bg-green-700"
                    />
                    <StatCard
                        name="Active Users"
                        icon={UserCheck}
                        value={userStats.activeUsers.toLocaleString()}
                        color="#10b981"
                        backgroundColor="bg-green-600"
                    />
                    <StatCard
                        name="Churn Rate"
                        icon={UserX}
                        value={userStats.churnRate}
                        color="#f43f5e"
                        backgroundColor="bg-red-800"
                    />
                </motion.div>

                {/* USER CHARTS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    <div className="bg-green-900 p-4 rounded-lg shadow-lg">
                        <UserGrowthChart />
                    </div>
                    <div className="bg-green-900 p-4 rounded-lg shadow-lg">
                        <UserActivityHeatmap />
                    </div>
                    <div className="bg-green-900 p-4 rounded-lg shadow-lg">
                        <UserDemographicsChart />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UsersPage;
