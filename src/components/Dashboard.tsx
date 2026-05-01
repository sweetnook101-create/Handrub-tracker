import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../services/db';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { TrendingUp, Droplets, Map, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const [locations, setLocations] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [locsData, logsData] = await Promise.all([
      dbService.getLocations(),
      dbService.getLogs()
    ]);
    setLocations(locsData || []);
    setLogs(logsData || []);
    setLoading(false);
  };

  const stats = useMemo(() => {
    const totalUsage = logs.reduce((sum, log) => sum + (log.usageAmount || 0), 0);
    const weeklyUsage = logs.filter(log => log.timestamp >= startOfWeek(new Date())).reduce((sum, log) => sum + (log.usageAmount || 0), 0);
    
    // Usage per location
    const locationUsage = locations.map(loc => {
      const usage = logs
        .filter(log => log.locationId === loc.id)
        .reduce((sum, log) => sum + (log.usageAmount || 0), 0);
      return { name: loc.name, usage };
    }).sort((a, b) => b.usage - a.usage);

    // Daily usage for the current week
    const currentWeekStart = startOfWeek(new Date());
    const currentWeekEnd = endOfWeek(new Date());
    const days = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });
    
    const weeklyData = days.map(day => {
      const dayUsage = logs
        .filter(log => isSameDay(new Date(log.timestamp), day))
        .reduce((sum, log) => sum + (log.usageAmount || 0), 0);
      return {
        date: format(day, 'EEE'),
        usage: dayUsage
      };
    });

    return { totalUsage, weeklyUsage, locationUsage, weeklyData };
  }, [locations, logs]);

  if (loading) {
    return <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
      </div>
      <div className="h-96 bg-gray-100 rounded-3xl" />
    </div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h2>
        <p className="text-sm text-gray-500">Monitor handrub consumption across the ward</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          label="Total Consumption" 
          value={`${stats.totalUsage}ml`} 
          icon={Droplets} 
          color="blue" 
          description="Total recorded usage"
        />
        <SummaryCard 
          label="This Week" 
          value={`${stats.weeklyUsage}ml`} 
          icon={TrendingUp} 
          color="green" 
          description="Last 7 days"
        />
        <SummaryCard 
          label="Active Points" 
          value={locations.length.toString()} 
          icon={Map} 
          color="amber" 
          description="Tracked dispensers"
        />
        <SummaryCard 
          label="Avg. Daily" 
          value={`${Math.round(stats.totalUsage / 30)}ml`} 
          icon={Activity} 
          color="purple" 
          description="Estimated avg usage"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Usage Over Time */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 capitalize mb-6">Weekly Consumption Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#3B82F6', strokeWidth: 2 }}
                />
                <Line type="monotone" dataKey="usage" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location Breakdown */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 capitalize mb-6">Consumption by Location</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.locationUsage} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} />
                <Bar dataKey="usage" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20}>
                  {stats.locationUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comparison Pie */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-400 capitalize mb-6">Usage Distribution</h3>
        <div className="h-[400px] flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.locationUsage}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="usage"
              >
                {stats.locationUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <p className="text-sm font-bold text-gray-400 uppercase">Total</p>
            <p className="text-2xl font-bold">{stats.totalUsage}ml</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, color, description }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
    >
      <div className="flex items-center gap-4">
        <div className={cn("p-4 rounded-2xl", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
