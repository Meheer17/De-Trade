import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Simulate fetching the current stock price
const fetchStockPrice = () => {
  // Here you would call an API or use an oracle to get live price
  return Math.floor(Math.random() * 300) + 150; // Random stock price between 150 and 450
};

const StockTradingPlatform = () => {
  const [stockData, setStockData] = useState({
    balance: 10000, // User's initial balance
    stocksOwned: 0,
    stockPrice: 200, // Initial simulated price
    purchasePrice: 0, // Price at which stocks were purchased
  });
  const [timeToSell, setTimeToSell] = useState(false); // Set to true when it's a good time to sell
  const [history, setHistory] = useState([]); // Track purchase/sale history

  useEffect(() => {
    const interval = setInterval(() => {
      setStockData((prevData) => ({
        ...prevData,
        stockPrice: fetchStockPrice(),
      }));
    }, 5000); // Update stock price every 5 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  // Handle the Buy action
  const handleBuy = () => {
    const amountToBuy = 10; // For simplicity, always buy 10 stocks
    const cost = amountToBuy * stockData.stockPrice;
    if (stockData.balance >= cost) {
      setStockData((prevData) => ({
        ...prevData,
        balance: prevData.balance - cost,
        stocksOwned: prevData.stocksOwned + amountToBuy,
        purchasePrice: prevData.stockPrice, // Track the price at purchase
      }));
      setHistory([
        ...history,
        { type: "BUY", amount: amountToBuy, price: stockData.stockPrice, date: new Date() },
      ]);
    } else {
      alert("Insufficient balance for this purchase.");
    }
  };

  // Handle the Sell action
  const handleSell = () => {
    const amountToSell = 5; // For simplicity, always sell 5 stocks
    const revenue = amountToSell * stockData.stockPrice;
    if (stockData.stocksOwned >= amountToSell) {
      setStockData((prevData) => ({
        ...prevData,
        balance: prevData.balance + revenue,
        stocksOwned: prevData.stocksOwned - amountToSell,
      }));
      setHistory([
        ...history,
        { type: "SELL", amount: amountToSell, price: stockData.stockPrice, date: new Date() },
      ]);
    } else {
      alert("Not enough stocks to sell.");
    }
  };

  // Calculate total gain or loss
  const calculateGainLoss = () => {
    const totalSpent = stockData.purchasePrice * stockData.stocksOwned;
    const totalCurrentValue = stockData.stockPrice * stockData.stocksOwned;
    return totalCurrentValue - totalSpent;
  };

  // Calculate if it’s a good time to sell (simple example: if price is significantly higher than purchase price)
  const calculateBestTimeToSell = () => {
    if (stockData.purchasePrice > 0) {
      if (stockData.stockPrice > stockData.purchasePrice * 1.2) {
        setTimeToSell(true); // Triggered if price increased by more than 20%
      } else {
        setTimeToSell(false);
      }
    }
  };

  useEffect(() => {
    // Check if it's a good time to sell every time the stock price changes
    calculateBestTimeToSell();
  }, [stockData.stockPrice]);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-lg font-medium mb-4 text-gray-100">Stock Trading Platform</h2>

      {/* Best Time to Sell Message */}
      {timeToSell && (
        <div className="mb-6 text-center text-green-400">
          <p>It’s a good time to sell! Stock price increased significantly!</p>
        </div>
      )}

      {/* Buy and Sell Buttons */}
      <div className="flex justify-center space-x-6">
        <button
          onClick={handleBuy}
          className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Buy
        </button>
        <button
          onClick={handleSell}
          className="bg-red-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-600 transition duration-200"
        >
          Sell
        </button>
      </div>

      {/* Trade History Log */}
      <div className="mt-6 text-center">
        <h3 className="text-gray-100">Trade History</h3>
        <div className="space-y-2 mt-4">
          {history.map((trade, index) => (
            <div
              key={index}
              className={`text-gray-400 ${trade.type === "BUY" ? "bg-green-500" : "bg-red-500"} rounded-lg p-2`}
            >
              {trade.type} {trade.amount} stocks at ${trade.price} on {new Date(trade.date).toLocaleString()}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default StockTradingPlatform;
