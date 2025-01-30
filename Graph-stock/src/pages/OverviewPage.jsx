import { useState, useEffect } from 'react';
import { BarChart2, ShoppingBag, Users, Zap, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import SalesOverviewChart from "../components/overview/SalesOverviewChart";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";

const fetchStockPrice = () => {
  return Math.floor(Math.random() * 300) + 150;
};

const OverviewPage = () => {
  const [stockData, setStockData] = useState({
    balance: 10000,
    stocksOwned: 0,
    stockPrice: 200,
    purchasePrice: 0,
    totalInvested: 0,
  });
  
  const [buyAmount, setBuyAmount] = useState(1);
  const [sellAmount, setSellAmount] = useState(1);
  const [timeToSell, setTimeToSell] = useState(false);
  const [history, setHistory] = useState([]);
  const [totalSales, setTotalSales] = useState(12345);
  const [newUsers, setNewUsers] = useState(1234);
  const [conversionRate, setConversionRate] = useState(12.5);

  useEffect(() => {
    const stockInterval = setInterval(() => {
      setStockData(prevData => ({
        ...prevData,
        stockPrice: fetchStockPrice(),
      }));
    }, 5000);

    const statsInterval = setInterval(() => {
      setNewUsers(prev => Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000);
      setTotalSales(prev => prev + (Math.random() > 0.5 ? 100 : -100));
      setConversionRate(prev => Math.max(0, prev + (Math.random() * 2 - 1.5)));
    }, 5000);

    return () => {
      clearInterval(stockInterval);
      clearInterval(statsInterval);
    };
  }, []);

  useEffect(() => {
    if (stockData.purchasePrice > 0) {
      setTimeToSell(stockData.stockPrice > stockData.purchasePrice * 1.2);
    }
  }, [stockData.stockPrice, stockData.purchasePrice]);

  const calculateGainLoss = () => {
    const currentValue = stockData.stocksOwned * stockData.stockPrice;
    return currentValue - stockData.totalInvested;
  };

  const handleBuy = () => {
    const cost = buyAmount * stockData.stockPrice;

    if (stockData.balance >= cost) {
      setStockData(prevData => ({
        ...prevData,
        balance: prevData.balance - cost,
        stocksOwned: prevData.stocksOwned + buyAmount,
        purchasePrice: prevData.stockPrice,
        totalInvested: prevData.totalInvested + cost
      }));

      setHistory(prev => [
        {
          type: "BUY",
          amount: buyAmount,
          price: stockData.stockPrice,
          total: cost,
          date: new Date()
        },
        ...prev
      ]);
    } else {
      alert("Insufficient balance for this purchase.");
    }
  };

  const handleSell = () => {
    const revenue = sellAmount * stockData.stockPrice;

    if (stockData.stocksOwned >= sellAmount) {
      const soldValue = (stockData.totalInvested / stockData.stocksOwned) * sellAmount;
      
      setStockData(prevData => ({
        ...prevData,
        balance: prevData.balance + revenue,
        stocksOwned: prevData.stocksOwned - sellAmount,
        totalInvested: prevData.totalInvested - soldValue
      }));

      setHistory(prev => [
        {
          type: "SELL",
          amount: sellAmount,
          price: stockData.stockPrice,
          total: revenue,
          date: new Date()
        },
        ...prev
      ]);
    } else {
      alert("Not enough stocks to sell.");
    }
  };

  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <Header title='Stock Trading Overview' />
      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        {timeToSell && (
          <div className="mb-6 p-4 bg-green-500 bg-opacity-20 rounded-lg text-green-400 text-center">
            <p>Profitable selling opportunity! Stock price has increased by over 20%</p>
          </div>
        )}

        <motion.div
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard 
            name='Current Price' 
            icon={Zap} 
            value={`$${stockData.stockPrice.toFixed(2)}`} 
            color='#6366F1' 
          />
          <StatCard 
            name='Stocks Owned' 
            icon={ShoppingBag} 
            value={stockData.stocksOwned} 
            color='#EC4899' 
          />
          <StatCard 
            name='Gain/Loss' 
            icon={BarChart2} 
            value={`$${calculateGainLoss().toFixed(2)}`} 
            color='#F59E0B' 
          />
          <StatCard 
            name='Balance' 
            icon={Users} 
            value={`$${stockData.balance.toFixed(2)}`} 
            color='#10B981' 
          />
        </motion.div>

        {/* Compact Trading Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 w-auto">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 mb-1">Buy Amount</span>
                <div className="flex items-center gap-2">
                  <button
                    className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
                    onClick={() => setBuyAmount(Math.max(1, buyAmount - 1))}
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={buyAmount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setBuyAmount(Math.max(1, value));
                    }}
                    className="w-16 px-2 py-1 text-center bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                  <button
                    className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
                    onClick={() => setBuyAmount(buyAmount + 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400">Total: ${(buyAmount * stockData.stockPrice).toFixed(2)}</span>
                <button
                  onClick={handleBuy}
                  className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition duration-200 text-sm"
                >
                  Buy
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 w-auto">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 mb-1">Sell Amount</span>
                <div className="flex items-center gap-2">
                  <button
                    className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
                    onClick={() => setSellAmount(Math.max(1, sellAmount - 1))}
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={sellAmount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setSellAmount(Math.max(1, Math.min(value, stockData.stocksOwned)));
                    }}
                    className="w-16 px-2 py-1 text-center bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                  <button
                    className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
                    onClick={() => setSellAmount(Math.min(stockData.stocksOwned, sellAmount + 1))}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400">Total: ${(sellAmount * stockData.stockPrice).toFixed(2)}</span>
                <button
                  onClick={handleSell}
                  className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded transition duration-200 text-sm"
                >
                  Sell
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trade History */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-gray-100">Recent Trades</h3>
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            {history.length === 0 ? (
              <p className="text-gray-400 text-center">No trades yet</p>
            ) : (
              history.slice(0, 5).map((trade, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    trade.type === "BUY" 
                      ? "bg-blue-500 bg-opacity-10 text-blue-400" 
                      : "bg-green-500 bg-opacity-10 text-green-400"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">{trade.type}</span>
                    <span>{trade.amount} stocks</span>
                    <span>@ ${trade.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>Total: ${trade.total.toFixed(2)}</span>
                    <span className="text-sm text-gray-400">
                      {new Date(trade.date).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-1'>
          <SalesOverviewChart />
        </div>
      </main>
    </div>
  );
};

export default OverviewPage;
