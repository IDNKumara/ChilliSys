'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Calendar, Package, Activity, DollarSign } from 'lucide-react';
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';

export default function PredictPage() {
  const [formData, setFormData] = useState({
    selectedDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    supply_kg: '',
    demand_index: '',
    prev_price: ''
  });
  const [prediction, setPrediction] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historicalData, setHistoricalData] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Fetch historical data on component mount
    fetchHistoricalData();
  }, []);

  const fetchHistoricalData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/prices/history?days=30');
      setHistoricalData(response.data);
      setChartData(response.data.map(item => ({
        date: item.date,
        price: item.price,
        type: 'historical'
      })));
    } catch (err) {
      console.error('Failed to fetch historical data:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: parseFloat(e.target.value) || e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrediction(null);
    setForecast([]);

    try {
      // Convert selected date to day of year
      const selectedDateObj = new Date(formData.selectedDate);
      const startOfYear = new Date(selectedDateObj.getFullYear(), 0, 0);
      const diff = selectedDateObj - startOfYear;
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);

      // Get 7-day forecast
      const response = await axios.post('http://localhost:8000/predict/forecast', {
        day_of_year: dayOfYear,
        supply_kg: parseFloat(formData.supply_kg),
        demand_index: parseFloat(formData.demand_index),
        prev_price: parseFloat(formData.prev_price),
        days: 7
      });
      
      const forecastData = response.data.forecast;
      setForecast(forecastData);
      setPrediction(forecastData[0].predicted_price);

      // Update chart data with 7-day forecast
      const today = new Date();
      const updatedChartData = [
        ...historicalData.map(item => ({
          date: item.date,
          price: item.price,
          type: 'historical'
        }))
      ];

      // Add a bridge point - the last historical price as the starting point for forecast
      if (historicalData.length > 0) {
        const lastHistorical = historicalData[historicalData.length - 1];
        const todayDate = today.toISOString().split('T')[0];
        updatedChartData.push({
          date: todayDate,
          price: lastHistorical.price,  // This extends the blue line
          predictedPrice: lastHistorical.price,  // This starts the red line
          upperBound: lastHistorical.price,
          lowerBound: lastHistorical.price,
          type: 'bridge'
        });
      }

      forecastData.forEach((item, index) => {
        const forecastDate = new Date(today);
        forecastDate.setDate(forecastDate.getDate() + index + 1);
        const dateStr = forecastDate.toISOString().split('T')[0];

        // Calculate uncertainty range (±10%)
        const uncertainty = item.predicted_price * 0.1;

        updatedChartData.push({
          date: dateStr,
          predictedPrice: item.predicted_price,
          upperBound: item.predicted_price + uncertainty,
          lowerBound: item.predicted_price - uncertainty,
          uncertaintyRange: [item.predicted_price - uncertainty, item.predicted_price + uncertainty],
          type: 'predicted'
        });
      });

      setChartData(updatedChartData);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Price Prediction</h1>
      
      {/* Key Market Indicators Guide - Moved to Top */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg shadow mb-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center">
          <Activity className="mr-2 h-5 w-5 text-blue-600" />
          Key Market Indicators Explained
        </h3>
        
        <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-200 dark:border-blue-700">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <strong className="text-blue-600 dark:text-blue-400">How it works:</strong> Enter <strong>today's market conditions</strong> (supply, demand, yesterday's price) and the system will predict <strong>prices for the next 7 days</strong>. Think of it as asking: "Based on what I see today, what will happen to prices this week?"
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-2">📦 Available Supply Today</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              How much chili is available in the market RIGHT NOW. <strong>More supply = Lower prices</strong>, Less supply = Higher prices.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-2">📈 Market Demand Level</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              How much people want to buy RIGHT NOW. <strong>1.0 = Normal demand</strong>, Above 1.0 = High (festivals, exports), Below 1.0 = Low demand.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-2">💰 Yesterday's Price</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The last known market price (from yesterday or most recent). Prices follow trends - they don't jump randomly.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-2">📅 Today's Date</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The starting point for predictions (usually today). Season matters! Harvest time = lower prices. Off-season or festivals = higher prices.
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>💡 Tip:</strong> The AI model uses all these factors together to predict future prices - just like how experienced traders think about the market!
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-6 dark:text-white flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-red-600" />
            Market Parameters
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Today's Date
              </label>
              <input
                type="date"
                name="selectedDate"
                value={formData.selectedDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The date you're making this prediction from</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                <Package className="inline h-4 w-4 mr-1" />
                Available Supply Today (kg)
              </label>
              <input
                type="number"
                name="supply_kg"
                value={formData.supply_kg}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                min="0"
                step="0.01"
                placeholder="e.g., 500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                <Activity className="inline h-4 w-4 mr-1" />
                Market Demand Level
              </label>
              <input
                type="number"
                name="demand_index"
                value={formData.demand_index}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                min="0"
                step="0.01"
                placeholder="e.g., 1.2"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Market demand multiplier (typical: 0.8 - 1.5)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Yesterday's Price (Rs/kg)
              </label>
              <input
                type="number"
                name="prev_price"
                value={formData.prev_price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                min="0"
                step="0.01"
                placeholder="e.g., 400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Forecasting...' : 'Get 7-Day Forecast'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Prediction Result */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-lg shadow dark:from-gray-800 dark:to-gray-700">
          <h2 className="text-xl font-semibold mb-6 dark:text-white">Tomorrow's Prediction</h2>
          
          {prediction !== null && forecast.length > 0 ? (
            <div className="py-8">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">Predicted Price for Tomorrow</p>
                <p className="text-6xl font-bold text-red-600 dark:text-red-400 mb-3">
                  Rs. {prediction.toFixed(2)}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">per kg</p>
              </div>
              
              <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                  <TrendingUp className="inline h-4 w-4 mr-1" />
                  <strong>View the chart below</strong> for the full 7-day price forecast and trend analysis
                </p>
              </div>

              <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  AI prediction based on today's market conditions
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <TrendingUp className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Enter market parameters and click "Get 7-Day Forecast" to see the price predictions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Price Trend Chart */}
      <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800 mt-6">
        <h2 className="text-xl font-semibold mb-6 dark:text-white flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-red-600" />
          Price Trend Analysis (30 Days Historical + 7 Days Forecast)
        </h2>
        
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#9CA3AF' }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis 
                tick={{ fill: '#9CA3AF' }}
                label={{ value: 'Price (Rs/kg)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                }}
                labelStyle={{
                  color: '#E5E7EB',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}
                itemStyle={{
                  padding: '4px 0'
                }}
                labelFormatter={(value) => `📅 ${value}`}
                formatter={(value, name) => {
                  if (name === 'price') {
                    return [
                      <span style={{ color: '#60A5FA', fontWeight: '600' }}>Rs. {value.toFixed(2)}</span>,
                      <span style={{ color: '#93C5FD' }}>Historical Price</span>
                    ];
                  }
                  if (name === 'predictedPrice') {
                    return [
                      <span style={{ color: '#FBBF24', fontWeight: '700', fontSize: '15px' }}>Rs. {value.toFixed(2)}</span>,
                      <span style={{ color: '#FCD34D' }}>🎯 Predicted Price</span>
                    ];
                  }
                  if (name === 'upperBound') {
                    return [
                      <span style={{ color: '#34D399', fontWeight: '500' }}>Rs. {value.toFixed(2)}</span>,
                      <span style={{ color: '#6EE7B7', fontSize: '12px' }}>↑ Upper Bound (+10%)</span>
                    ];
                  }
                  if (name === 'lowerBound') {
                    return [
                      <span style={{ color: '#F87171', fontWeight: '500' }}>Rs. {value.toFixed(2)}</span>,
                      <span style={{ color: '#FCA5A5', fontSize: '12px' }}>↓ Lower Bound (-10%)</span>
                    ];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              
              {/* Uncertainty cone - upper and lower bounds */}
              {forecast.length > 0 && (
                <>
                  <Line
                    type="monotone"
                    dataKey="upperBound"
                    stroke="#DC2626"
                    strokeWidth={1}
                    strokeOpacity={0.5}
                    strokeDasharray="3 3"
                    dot={false}
                    connectNulls
                    name="Upper Bound"
                  />
                  <Line
                    type="monotone"
                    dataKey="lowerBound"
                    stroke="#DC2626"
                    strokeWidth={1}
                    strokeOpacity={0.5}
                    strokeDasharray="3 3"
                    dot={false}
                    connectNulls
                    name="Lower Bound"
                  />
                </>
              )}
              
              
              {/* Historical prices */}
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 3 }}
                connectNulls
                name="Historical Price"
              />
              
              {/* Predicted prices */}
              {forecast.length > 0 && (
                <Line 
                  type="monotone" 
                  dataKey="predictedPrice" 
                  stroke="#DC2626" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: '#DC2626', r: 5 }}
                  connectNulls
                  name="Predicted Price"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">Loading historical data...</p>
          </div>
        )}
        
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-blue-500 mr-2"></div>
            Historical Data
          </div>
          {forecast.length > 0 && (
            <>
              <div className="flex items-center">
                <div className="w-4 h-0.5 bg-red-600 mr-2" style={{borderTop: '2px dashed #DC2626'}}></div>
                7-Day Forecast
              </div>
              <div className="flex items-center">
                <div className="w-4 h-3 bg-red-200 opacity-50 mr-2"></div>
                Uncertainty Range (±10%)
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
