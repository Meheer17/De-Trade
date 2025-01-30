import { useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BarChart2, TrendingUp, LogInIcon, Menu, User, Users } from "lucide-react";

const SIDEBAR_ITEMS = [
    { name: "Overview", icon: BarChart2, color: "#FFFFFF", href: "/overview" },
    { name: "Trades", icon: TrendingUp, color: "#FFFFFF", href: "/analytics" },
    { name: "Profile", icon: User, color: "#FFFFFF", href: "/settings" }
];

const Sidebar = ({ isAuthenticated }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();

    // Hide the sidebar on the AuthPage
    if (location.pathname === "/") return null;

    // Filter out "Login/SignUp" if user is authenticated
    const filteredItems = isAuthenticated
        ? SIDEBAR_ITEMS
        : [...SIDEBAR_ITEMS, { name: "Login/SignUp", icon: LogInIcon, color: "#FFFFFF", href: "/" }];

    return (
        <motion.div
            className="relative z-50 h-screen flex-shrink-0 bg-[#040c1c] shadow-lg fixed right-0 top-0"
            animate={{ width: isSidebarOpen ? 260 : 80 }}
        >
            <div className="h-full flex flex-col justify-between p-4">
                <motion.button
                    whileHover={{ rotate: 0 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-4 rounded-full bg-[#182434] text-white flex items-center justify-center hover:bg-gray-700 transition duration-300"
                >
                    <Menu size={24} />
                </motion.button>

                <nav className="mt-10 flex flex-col gap-2">
                    {filteredItems.map((item) => (
                        <Link key={item.href} to={item.href}>
                            <motion.div
                                className="flex items-center gap-4 text-sm font-semibold p-3 rounded-lg cursor-pointer text-[#182434] hover:bg-[#182434]"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                            >
                                <item.icon size={24} style={{ color: item.color, minWidth: "24px" }} />
                                {isSidebarOpen && (
                                    <motion.span
                                        className="whitespace-nowrap text-white"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {item.name}
                                    </motion.span>
                                )}
                            </motion.div>
                        </Link>
                    ))}
                </nav>

                <div className="text-[#182434] text-xs text-center mt-auto">
                    <p>&copy; ASTROBUGS</p>
                </div>
            </div>
        </motion.div>
    );
};

export default Sidebar;
