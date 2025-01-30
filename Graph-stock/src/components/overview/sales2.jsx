import React, { useState, useEffect, useRef } from "react";

const StreamingCandlestickChart = () => {
  const chartContainer = useRef(null);
  const chartInstance = useRef(null);
  const scriptsLoaded = useRef(false);
  const dataTable = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const wsRef = useRef(null);

  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    wsRef.current = new WebSocket("ws://localhost:8080/ws");

    wsRef.current.onopen = () => {
      console.log("WebSocket connection established");
      setSocketStatus('connected');
    };

    wsRef.current.onmessage = (event) => {
      if (!dataTable.current || !chartInstance.current) return;
      
      try {
        const data = event.data;
        if (!data || typeof data !== 'string') {
          console.warn('Invalid data received:', data);
          return;
        }

        const parsedData = parseCSVData(data);
        if (parsedData && parsedData.length > 0) {
          dataTable.current.addData(parsedData);
          
          // Auto-scroll to the latest data point
          if (chartInstance.current) {
            const plot = chartInstance.current.plot(0);
            // Enable autoScroll
            plot.enableAutoScroll(true);
            // Set scrolling gap
            plot.autoScroll().gap(0);
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setSocketStatus('error');
    };

    wsRef.current.onclose = () => {
      setSocketStatus('disconnected');
      // Attempt to reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };
  };

  const parseCSVData = (csvData) => {
    try {
      const rows = csvData.trim().split('\n');
      if (rows.length < 2) return [];

      return rows.slice(1).map(row => {
        const [date, open, high, low, close] = row.split(',');
        if (!date || !open || !high || !low || !close) {
          throw new Error('Invalid data format');
        }

        // Parse date in DD-MMM-YYYY format
        const [day, month, year] = date.split('-');
        const monthMap = {
          'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
          'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
        };
        
        const parsedDate = new Date(year, monthMap[month.toUpperCase()], parseInt(day));
        
        return [
          parsedDate,
          parseFloat(open),
          parseFloat(high),
          parseFloat(low),
          parseFloat(close)
        ];
      });
    } catch (error) {
      console.error('Error parsing CSV data:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadScripts = async () => {
      const scripts = [
        "https://cdn.anychart.com/releases/8.11.0/js/anychart-core.min.js",
        "https://cdn.anychart.com/releases/8.11.0/js/anychart-stock.min.js",
        "https://cdn.anychart.com/releases/8.11.0/themes/dark_glamour.min.js"
      ];

      for (const src of scripts) {
        if (!document.querySelector(`script[src="${src}"]`)) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }
      }

      scriptsLoaded.current = true;
      initializeChart();
    };

    loadScripts().catch(console.error);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const initializeChart = () => {
    if (!window.anychart || !chartContainer.current || chartInstance.current) {
      return;
    }

    window.anychart.onDocumentReady(() => {
      dataTable.current = window.anychart.data.table('timestamp');

      const mapping = dataTable.current.mapAs({
        open: 1,
        high: 2,
        low: 3,
        close: 4
      });

      const chart = window.anychart.stock();
      chartInstance.current = chart;

      // Apply dark theme
      window.anychart.theme("darkGlamour");

      const plot = chart.plot(0);
      
      // Configure background and appearance
      chart.background().fill("#1a202c");
      plot.background().fill("#1a202c");
      plot.yGrid().stroke("#2d3748");
      plot.xGrid().stroke("#2d3748");
      
      // Configure candlestick series
      const series = plot.candlestick(mapping);
      series.name("Stock Data");
      
      // Set colors
      series.fallingFill("#FF0D0D");
      series.fallingStroke("#FF0D0D");
      series.risingFill("#43FF43");
      series.risingStroke("#43FF43");

      // Configure title
      chart.title()
        .text("Live Stock Trading Data")
        .fontColor("#ffffff")
        .fontSize(16);

      // Configure tooltip
      series.tooltip().format(
        "Date: {%x}\nOpen: {%open}\nHigh: {%high}\nLow: {%low}\nClose: {%close}"
      );

      // Style axes
      plot.xAxis().labels().fontColor("#ffffff");
      plot.yAxis().labels().fontColor("#ffffff");

      // Configure scroller
      const scroller = chart.scroller();
      scroller.fill("#2d3748");
      scroller.selectedFill("#4a5568");
      
      // Enable auto-scrolling
      plot.enableAutoScroll(true);
      plot.autoScroll().gap(0);

      // Set container and draw
      chart.container("chart-container");
      chart.draw();

      setIsInitialized(true);
      connectWebSocket();
    });
  };

  return (
    <div className="flex flex-col w-full">
      <div className={`mb-2 px-4 py-2 rounded text-sm ${
        socketStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
        socketStatus === 'error' ? 'bg-red-500/20 text-red-400' :
        'bg-yellow-500/20 text-yellow-400'
      }`}>
        Status: {socketStatus === 'connected' ? 'Connected' : 
                socketStatus === 'error' ? 'Error' : 'Disconnected'}
      </div>

      <div className="flex gap-4 mb-4">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Buy ($1000)
        </button>
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
          Sell (5 Stocks)
        </button>
      </div>

      <div className="bg-[#1a202c] rounded-xl border border-gray-700 p-6 w-full">
        <div
          id="chart-container"
          ref={chartContainer}
          className="w-full h-[600px]"
          style={{ 
            backgroundColor: '#1a202c',
            visibility: isInitialized ? 'visible' : 'hidden' 
          }}
        />
      </div>
    </div>
  );
};

export default StreamingCandlestickChart;
