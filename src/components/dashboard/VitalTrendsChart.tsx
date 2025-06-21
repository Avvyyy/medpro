import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  Activity, 
  Thermometer,
  Calendar,
  Filter
} from 'lucide-react';
import { VitalSigns } from '../../types/vitals';

interface VitalTrendsChartProps {
  patientId: string;
  patientName: string;
  vitalsData: VitalSigns[];
}

const VitalTrendsChart: React.FC<VitalTrendsChartProps> = ({
  patientId,
  patientName,
  vitalsData
}) => {
  const [selectedVital, setSelectedVital] = useState<'heartRate' | 'bloodPressure' | 'temperature' | 'oxygenSaturation'>('heartRate');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    prepareChartData();
  }, [patientId, vitalsData, selectedVital, timeRange]);

  const prepareChartData = () => {
    // Filter vitals for this patient
    const patientVitals = vitalsData
      .filter(v => v.patientId === patientId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Filter by time range
    const now = new Date();
    const cutoffTime = new Date();
    
    switch (timeRange) {
      case '24h':
        cutoffTime.setHours(now.getHours() - 24);
        break;
      case '7d':
        cutoffTime.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffTime.setDate(now.getDate() - 30);
        break;
    }

    const filteredVitals = patientVitals.filter(v => 
      new Date(v.timestamp) >= cutoffTime
    );

    // Extract data points for selected vital
    const dataPoints = filteredVitals
      .map(vital => {
        const vitalData = vital.vitals[selectedVital];
        if (!vitalData) return null;

        let value: number;
        if (selectedVital === 'bloodPressure') {
          value = vitalData.systolic; // Use systolic for blood pressure
        } else {
          value = vitalData.value;
        }

        return {
          timestamp: vital.timestamp,
          value,
          status: vitalData.status,
          source: vital.source
        };
      })
      .filter(Boolean);

    setChartData(dataPoints);
  };

  const getVitalInfo = (vitalType: string) => {
    const info = {
      heartRate: {
        name: 'Heart Rate',
        unit: 'BPM',
        icon: Heart,
        color: 'text-red-500',
        normal: { min: 60, max: 100 },
        warning: { min: 50, max: 120 }
      },
      bloodPressure: {
        name: 'Blood Pressure (Systolic)',
        unit: 'mmHg',
        icon: Activity,
        color: 'text-blue-500',
        normal: { min: 90, max: 120 },
        warning: { min: 80, max: 140 }
      },
      temperature: {
        name: 'Temperature',
        unit: '°F',
        icon: Thermometer,
        color: 'text-orange-500',
        normal: { min: 97.0, max: 99.5 },
        warning: { min: 95.0, max: 101.0 }
      },
      oxygenSaturation: {
        name: 'Oxygen Saturation',
        unit: '%',
        icon: Activity,
        color: 'text-green-500',
        normal: { min: 95, max: 100 },
        warning: { min: 90, max: 94 }
      }
    };
    return info[vitalType as keyof typeof info];
  };

  const calculateTrend = () => {
    if (chartData.length < 2) return { direction: 'stable', percentage: 0 };

    const recent = chartData.slice(-3).map(d => d.value);
    const older = chartData.slice(-6, -3).map(d => d.value);

    if (recent.length === 0 || older.length === 0) return { direction: 'stable', percentage: 0 };

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (Math.abs(change) < 5) return { direction: 'stable', percentage: 0 };
    return {
      direction: change > 0 ? 'up' : 'down',
      percentage: Math.abs(change)
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const vitalInfo = getVitalInfo(selectedVital);
  const trend = calculateTrend();
  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1] : null;

  // Simple chart dimensions
  const chartWidth = 400;
  const chartHeight = 200;
  const padding = 40;

  // Calculate chart scales
  const values = chartData.map(d => d.value);
  const minValue = Math.min(...values, vitalInfo.normal.min);
  const maxValue = Math.max(...values, vitalInfo.normal.max);
  const valueRange = maxValue - minValue;

  const timeRange_ms = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000
  }[timeRange];

  const now = new Date().getTime();
  const startTime = now - timeRange_ms;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center`}>
            <vitalInfo.icon className={`w-6 h-6 ${vitalInfo.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Vital Signs Trends</h3>
            <p className="text-gray-600">{patientName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Vital Type Selector */}
          <select
            value={selectedVital}
            onChange={(e) => setSelectedVital(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="heartRate">Heart Rate</option>
            <option value="bloodPressure">Blood Pressure</option>
            <option value="temperature">Temperature</option>
            <option value="oxygenSaturation">Oxygen Saturation</option>
          </select>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Current Value & Trend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Current {vitalInfo.name}</div>
          <div className="flex items-center space-x-2">
            <span className={`text-2xl font-bold ${
              latestValue?.status === 'critical' ? 'text-red-600' :
              latestValue?.status === 'warning' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {latestValue ? `${latestValue.value} ${vitalInfo.unit}` : 'No data'}
            </span>
            {latestValue && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                latestValue.status === 'critical' ? 'bg-red-100 text-red-800' :
                latestValue.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {latestValue.status}
              </span>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Trend</div>
          <div className="flex items-center space-x-2">
            {trend.direction === 'up' && <TrendingUp className="w-5 h-5 text-red-500" />}
            {trend.direction === 'down' && <TrendingDown className="w-5 h-5 text-blue-500" />}
            {trend.direction === 'stable' && <span className="w-5 h-5 text-gray-500">→</span>}
            <span className="font-medium">
              {trend.direction === 'stable' ? 'Stable' : `${trend.percentage.toFixed(1)}% ${trend.direction}`}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Data Points</div>
          <div className="text-2xl font-bold text-gray-900">{chartData.length}</div>
          <div className="text-xs text-gray-500">in {timeRange}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-50 rounded-lg p-4">
        {chartData.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No data available</h4>
            <p className="text-gray-600">No {vitalInfo.name.toLowerCase()} readings found for the selected time period.</p>
          </div>
        ) : (
          <div className="relative">
            <svg width={chartWidth} height={chartHeight} className="mx-auto">
              {/* Background grid */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width={chartWidth} height={chartHeight} fill="url(#grid)" />

              {/* Normal range background */}
              <rect
                x={padding}
                y={padding + (chartHeight - 2 * padding) * (1 - (vitalInfo.normal.max - minValue) / valueRange)}
                width={chartWidth - 2 * padding}
                height={(chartHeight - 2 * padding) * (vitalInfo.normal.max - vitalInfo.normal.min) / valueRange}
                fill="#10B981"
                fillOpacity="0.1"
              />

              {/* Warning range background */}
              <rect
                x={padding}
                y={padding + (chartHeight - 2 * padding) * (1 - (vitalInfo.warning.max - minValue) / valueRange)}
                width={chartWidth - 2 * padding}
                height={(chartHeight - 2 * padding) * (vitalInfo.warning.max - vitalInfo.warning.min) / valueRange}
                fill="#F59E0B"
                fillOpacity="0.05"
              />

              {/* Data line */}
              {chartData.length > 1 && (
                <polyline
                  fill="none"
                  stroke={vitalInfo.color.replace('text-', '#')}
                  strokeWidth="2"
                  points={chartData.map((point, index) => {
                    const x = padding + (index / (chartData.length - 1)) * (chartWidth - 2 * padding);
                    const y = padding + (chartHeight - 2 * padding) * (1 - (point.value - minValue) / valueRange);
                    return `${x},${y}`;
                  }).join(' ')}
                />
              )}

              {/* Data points */}
              {chartData.map((point, index) => {
                const x = padding + (index / Math.max(chartData.length - 1, 1)) * (chartWidth - 2 * padding);
                const y = padding + (chartHeight - 2 * padding) * (1 - (point.value - minValue) / valueRange);
                
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={getStatusColor(point.status)}
                    stroke="white"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Y-axis labels */}
              <text x={padding - 10} y={padding + 5} textAnchor="end" fontSize="12" fill="#6B7280">
                {maxValue.toFixed(0)}
              </text>
              <text x={padding - 10} y={chartHeight - padding + 5} textAnchor="end" fontSize="12" fill="#6B7280">
                {minValue.toFixed(0)}
              </text>
            </svg>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Normal</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Warning</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Critical</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            {chartData.length > 0 ? Math.max(...values).toFixed(1) : 'N/A'}
          </div>
          <div className="text-gray-600">Highest</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            {chartData.length > 0 ? Math.min(...values).toFixed(1) : 'N/A'}
          </div>
          <div className="text-gray-600">Lowest</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            {chartData.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 'N/A'}
          </div>
          <div className="text-gray-600">Average</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            {chartData.filter(d => d.status === 'normal').length}
          </div>
          <div className="text-gray-600">Normal Readings</div>
        </div>
      </div>
    </div>
  );
};

export default VitalTrendsChart;