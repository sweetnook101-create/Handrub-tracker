import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { MapPin, Plus, Trash2, Home, UserCircle, DoorOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function LocationManager() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'patient_room',
    bottleCapacity: 500,
    currentVolume: 500
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    setLoading(true);
    const data = await dbService.getLocations();
    setLocations(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbService.addLocation(formData);
    setShowAdd(false);
    setFormData({ name: '', type: 'patient_room', bottleCapacity: 500, currentVolume: 500 });
    loadLocations();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'patient_room': return Home;
      case 'nurse_station': return UserCircle;
      case 'entrance': return DoorOpen;
      default: return MapPin;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Dispenser Locations</h2>
          <p className="text-sm text-gray-500">Manage all handrub tracking points</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {showAdd ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Location</>}
        </button>
      </div>

      {showAdd && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location Name</label>
              <input
                required
                type="text"
                placeholder="e.g., Room 101, West Entrance"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</label>
              <select
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="patient_room">Patient Room</option>
                <option value="nurse_station">Nurse Station</option>
                <option value="entrance">Entrance</option>
                <option value="hallway">Hallway</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Starting Volume (ml)</label>
              <input
                required
                type="number"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.currentVolume}
                onChange={e => setFormData({ ...formData, currentVolume: Number(e.target.value), bottleCapacity: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Save Location
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => {
            const Icon = getIcon(loc.type);
            const percent = (loc.currentVolume / loc.bottleCapacity) * 100;
            return (
              <motion.div
                layout
                key={loc.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-blue-200 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    percent < 20 ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Remaining</p>
                    <p className="text-xl font-mono font-bold">{loc.currentVolume}ml</p>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1">{loc.name}</h3>
                <p className="text-xs text-gray-500 capitalize mb-4">{loc.type.replace('_', ' ')}</p>
                
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        percent < 20 ? "bg-red-500" : "bg-blue-500"
                      )}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-medium text-gray-400">
                    <span>Empty</span>
                    <span>Full ({loc.bottleCapacity}ml)</span>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {locations.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center">
              <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No locations yet</h3>
              <p className="text-gray-500">Add your first dispenser location to start tracking.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
