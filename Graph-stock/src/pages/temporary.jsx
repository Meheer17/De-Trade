import { useState, useEffect } from 'react';
import { BarChart2, ShoppingBag, Users, Zap } from "lucide-react"; // Use Lucide for icons
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import SalesOverviewChart from "../components/overview/SalesOverviewChart";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import SalesChannelChart from "../components/overview/SalesChannelChart";

const OverviewPage = () => {
  // Initial stock price and stock related states
  const currentPrice = 197;
  const [walletBalance, setWalletBalance] = useState(10000);  // Wallet starts with $10,000
  const [stocksOwned, setStocksOwned] = useState(0);  // No stocks at first
  const [gainLoss, setGainLoss] = useState(0);  // Initial gain/loss is 0
  const [totalSales, setTotalSales] = useState(12345);
  const [newUsers, setNewUsers] = useState(1234);
  const [conversionRate, setConversionRate] = useState(12.5);

  // Handle Buy and Sell button actions
  const handleBuy = (amount) => {
    const numberOfStocksToBuy = Math.floor(amount / currentPrice);  // Calculate number of stocks you can buy with the amount
    const totalCost = numberOfStocksToBuy * currentPrice;

    // Check if balance is sufficient and update wallet and stocks
    if (walletBalance >= totalCost) {
      setWalletBalance(prev => prev - totalCost);  // Deduct money from wallet
      setStocksOwned(prev => prev + numberOfStocksToBuy);  // Increase number of stocks owned
      setGainLoss(prev => prev + (numberOfStocksToBuy * currentPrice));  // Update gain/loss (assuming you bought at current price)
    }
  };

  const handleSell = (amount) => {
    const numberOfStocksToSell = Math.min(amount, stocksOwned);  // You can only sell as many stocks as you own
    const totalRevenue = numberOfStocksToSell * currentPrice;

    if (numberOfStocksToSell > 0) {
      setWalletBalance(prev => prev + totalRevenue);  // Add money from sold stocks to wallet
      setStocksOwned(prev => prev - numberOfStocksToSell);  // Decrease the number of stocks owned
      setGainLoss(prev => prev - (numberOfStocksToSell * currentPrice));  // Update gain/loss based on selling at current price
    }
  };

  useEffect(() => {
    const newUserInterval = setInterval(() => {
      const newUserChange = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
      setNewUsers(newUserChange);  // Set the new users count to a random number in the range
    }, 200);  // Update new users every 0.2 seconds

    const statsInterval = setInterval(() => {
      setTotalSales(prev => prev + (Math.random() > 0.5 ? 100 : -100));
      setConversionRate(prev => Math.max(0, prev + (Math.random() * 2 - 1.5)));
    }, 5000); // Update other stats every 5 seconds

    return () => {
      clearInterval(newUserInterval);
      clearInterval(statsInterval);
    };
  }, []);

  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <Header title='Overview' />

      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        {/* STATS */}
        <motion.div
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >

        </motion.div>

        {/* Stock Stats */}
        <motion.div
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name='Current Price' icon={Zap} value={`$${currentPrice}`} color='#6366F1' />
          <StatCard name='Stocks Owned' icon={ShoppingBag} value={stocksOwned} color='#EC4899' />
          <StatCard name='Gain/Loss' icon={Zap} value={`$${gainLoss.toFixed(2)}`} color='#F59E0B' />
                <StatCard name='Wallet' icon={ShoppingBag} value={`$${walletBalance}`} color='#EC4899' />
  </motion.div>

        {/* Buy/Sell Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            className="px-6 py-2 bg-blue-500 text-white rounded"
            onClick={() => handleBuy(1000)}  // Example amount: $1000 for buying
          >
            Buy ($1000)
          </button>
          <button
            className="px-6 py-2 bg-green-500 text-white rounded"
            onClick={() => handleSell(5)}  // Example amount: Sell 5 stocks
          >
            Sell (5 Stocks)
          </button>
        </div>

        {/* CHARTS */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <SalesOverviewChart />
          <CategoryDistributionChart />
        </div>
      </main>
    </div>
  );
};

export default OverviewPage;
