import React, { useState, useEffect, useRef } from "react";

const StreamingCandlestickChart = () => {
  const chartContainer = useRef(null);
  const chartInstance = useRef(null);
  const scriptsLoaded = useRef(false);
  const dataTable = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [socketStatus, setSocketStatus] = useState("disconnected");
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    wsRef.current = new WebSocket("ws://localhost:8080/ws");

    wsRef.current.onopen = () => {
      console.log("WebSocket connection established");
      setSocketStatus("connected");
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    wsRef.current.onmessage = (event) => {
      if (!dataTable.current || !chartInstance.current) return;

      try {
        const parsedData = parseJSONData(event.data);
        if (parsedData && parsedData.length > 0) {
          dataTable.current.addData(parsedData);

          const chart = chartInstance.current;
          const range = chart.getSelectedRange();
          if (range) {
            const newEnd = parsedData[0][0].getTime();
            const newStart = newEnd - (range.endValue - range.startValue);
            chart.selectRange(newStart, newEnd);
          }
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setSocketStatus("error");
    };

    wsRef.current.onclose = () => {
      setSocketStatus("disconnected");
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
    };
  };

  const parseJSONData = (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      if (!data.date || !data.open || !data.high || !data.low || !data.close) {
        throw new Error("Invalid data format");
      }

      // Assuming date format is "DD-MMM-YYYY"
      const [day, month, year] = data.date.split("-");
      const dateObj = new Date(`${month} ${day} ${year}`);

      return [
        [
          dateObj,
          data.open,
          data.high,
          data.low,
          data.close,
        ],
      ];
    } catch (error) {
      console.error("Error parsing JSON data:", error);
      return [];
    }
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (scriptsLoaded.current) return;

    const scripts = [
      "https://cdn.anychart.com/releases/8.11.0/js/anychart-core.min.js",
      "https://cdn.anychart.com/releases/8.13.0/js/anychart-base.min.js",
      "https://cdn.anychart.com/releases/8.11.0/js/anychart-stock.min.js",
      "https://cdn.anychart.com/releases/8.11.0/themes/dark_glamour.min.js",
    ];

    let loadedScripts = 0;
    scripts.forEach((src) => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => {
          loadedScripts++;
          if (loadedScripts === scripts.length) {
            scriptsLoaded.current = true;
            initializeChart();
          }
        };
        document.body.appendChild(script);
      } else {
        loadedScripts++;
        if (loadedScripts === scripts.length) {
          scriptsLoaded.current = true;
          initializeChart();
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, []);

  const initializeChart = () => {
    if (!window.anychart || !chartContainer.current || chartInstance.current) {
      return;
    }

    window.anychart.onDocumentReady(() => {
      dataTable.current = window.anychart.data.table();

      const mapping = dataTable.current.mapAs({
        open: 1,
        high: 2,
        low: 3,
        close: 4,
      });

      const chart = window.anychart.stock();
      chartInstance.current = chart;

      window.anychart.theme("darkGlamour");

      const plot = chart.plot(0);
      chart.background().fill("#1a202c");
      plot.background().fill("#1a202c");

      plot.yGrid(true).xGrid(true).yMinorGrid(true).xMinorGrid(true);
      plot.xGrid().stroke("#2d3748");
      plot.yGrid().stroke("#2d3748");
      plot.xMinorGrid().stroke("#2d3748", 0.5);
      plot.yMinorGrid().stroke("#2d3748", 0.5);

      const series = plot.candlestick(mapping);
      series.name("Stock Data");
      series.fallingFill("#FF0D0D");
      series.fallingStroke("#FF0D0D");
      series.risingFill("#43FF43");
      series.risingStroke("#43FF43");

      chart.title()
        .text("Live Stock Trading Data")
        .fontColor("#ffffff")
        .fontSize(16)
        .fontWeight("normal");

      series.tooltip().format(
        "Open: {%open}\nHigh: {%high}\nLow: {%low}\nClose: {%close}"
      );

      plot.xAxis().labels().fontColor("#ffffff");
      plot.yAxis().labels().fontColor("#ffffff");

      chart.scroller().enabled(true);
      chart.scroller().fill("#2d3748");
      chart.scroller().selectedFill("#4a5568");

      chart.container("chart-container");
      chart.draw();

      const range = 50 * 60 * 1000;
      const now = new Date().getTime();
      chart.selectRange(now - range, now);

      setIsInitialized(true);
    });
  };

  return (
    <div className="flex flex-col w-full">
      <div
        className={`mb-2 px-4 py-2 rounded text-sm ${
          socketStatus === "connected"
            ? "bg-green-500/20 text-green-400"
            : socketStatus === "error"
            ? "bg-red-500/20 text-red-400"
            : "bg-yellow-500/20 text-yellow-400"
        }`}
      >
        Status:{" "}
        {socketStatus === "connected"
          ? "Connected"
          : socketStatus === "error"
          ? "Error"
          : "Disconnected"}
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
            backgroundColor: "#1a202c",
            visibility: isInitialized ? "visible" : "hidden",
          }}
        />
      </div>
    </div>
  );
};

export default StreamingCandlestickChart;

