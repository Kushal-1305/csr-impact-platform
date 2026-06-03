// pages/Dashboard.jsx — The Impact Dashboard with charts.
//
// This is the most impressive page — shows the social impact in numbers and visuals.
// Uses Recharts library for charts (BarChart, PieChart).
//
// Data flows:
//   1. On load: fetch /api/impact/summary, /by-cause, /monthly, /top-events
//   2. Pass that data to chart components
//   3. Charts render automatically

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../api/axios';

// Colors for the pie chart slices
const PIE_COLORS = ['#16a34a', '#2563eb', '#f97316', '#dc2626', '#eab308', '#7c3aed', '#0891b2'];

// Stat card component — the 4 big numbers at the top
function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${color}`}>TOTAL</span>
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-1">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

// Custom label for pie chart slices
function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) {
  if (percent < 0.05) return null; // Don't show label for tiny slices
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function Dashboard() {
  const [summary, setSummary]     = useState(null);
  const [byCause, setByCause]     = useState([]);
  const [monthly, setMonthly]     = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      // Fetch all 4 data sources in parallel
      const [summaryRes, causeRes, monthlyRes, topRes] = await Promise.all([
        api.get('/impact/summary'),
        api.get('/impact/by-cause'),
        api.get('/impact/monthly'),
        api.get('/impact/top-events'),
      ]);

      setSummary(summaryRes.data);
      setByCause(causeRes.data);

      // Format month labels: "2024-06" → "Jun 24"
      const formattedMonthly = monthlyRes.data.map(d => ({
        ...d,
        month: new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        total_hours: parseFloat(d.total_hours) || 0,
      }));
      setMonthly(formattedMonthly);
      setTopEvents(topRes.data);
    } catch (err) {
      console.error('Failed to fetch impact data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      <div className="text-center">
        <div className="text-4xl mb-3">📊</div>
        <p>Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Impact Dashboard</h1>
        <p className="text-gray-500 mt-1">Track volunteering impact across your organization</p>
      </div>

      {/* ── STAT CARDS ── */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="🧑‍🤝‍🧑" label="Total Volunteers" value={summary.totalVolunteers} color="bg-green-100 text-green-700" />
          <StatCard icon="⏱️"     label="Hours Volunteered" value={summary.totalHours}     color="bg-blue-100 text-blue-700" />
          <StatCard icon="📅"     label="Events Created"    value={summary.totalEvents}    color="bg-orange-100 text-orange-700" />
          <StatCard icon="📝"     label="Registrations"     value={summary.totalRegistrations} color="bg-purple-100 text-purple-700" />
        </div>
      )}

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Bar Chart: Monthly Volunteering Hours */}
        {/* Takes up 2/3 of the row */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-1">Monthly Volunteering Hours</h2>
          <p className="text-xs text-gray-400 mb-4">Total hours contributed per month</p>
          {monthly.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          ) : (
            // ResponsiveContainer makes the chart resize with the window
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthly} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                  formatter={(value) => [`${value} hrs`, 'Hours']}
                />
                <Bar dataKey="total_hours" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart: Events by Cause */}
        {/* Takes up 1/3 of the row */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-1">Impact by Cause</h2>
          <p className="text-xs text-gray-400 mb-4">Volunteer distribution across causes</p>
          {byCause.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={byCause}
                  dataKey="volunteer_count"
                  nameKey="cause"
                  cx="50%" cy="45%"
                  outerRadius={80}
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {byCause.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => <span style={{ fontSize: '11px', color: '#6b7280' }}>{value}</span>}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value, name) => [value + ' volunteers', name]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── TOP EVENTS TABLE ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700">🏆 Top Events by Participation</h2>
        </div>
        {topEvents.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No events data yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3 text-left">Rank</th>
                <th className="px-6 py-3 text-left">Event</th>
                <th className="px-6 py-3 text-left">Cause</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Duration</th>
                <th className="px-6 py-3 text-right">Volunteers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topEvents.map((event, idx) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-gray-400">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </td>
                  <td className="px-6 py-3.5 font-medium text-gray-800">{event.title}</td>
                  <td className="px-6 py-3.5 text-gray-500">{event.cause}</td>
                  <td className="px-6 py-3.5 text-gray-500">{new Date(event.date).toLocaleDateString()}</td>
                  <td className="px-6 py-3.5 text-gray-500">{event.duration_hrs}h</td>
                  <td className="px-6 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                      {event.registrations} 👥
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
