import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { CheckCircle2, RotateCcw, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function EntryForm({ onComplete }: { onComplete: () => void }) {
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<any | null>(null);
  const [volume, setVolume] = useState<string>('');
  const [logType, setLogType] = useState<'daily' | 'weekly'>('daily');
  const [isReplacement, setIsReplacement] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    const data = await dbService.getLocations();
    setLocations(data || []);
  };

  const handleLocationSelect = (locId: string) => {
    const loc = locations.find(l => l.id === locId);
    setSelectedLoc(loc || null);
    if (loc && !isReplacement) {
      setVolume(loc.currentVolume.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoc || (!isReplacement && volume === '')) return;

    setLoading(true);
    const volumeValue = isReplacement ? 500 : Number(volume);
    
    await dbService.addLog(selectedLoc.id, volumeValue, logType, isReplacement);
    
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setVolume('');
      setIsReplacement(false);
      setSelectedLoc(null);
      onComplete();
    }, 2000);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Record Usage</h2>
        <p className="text-sm text-gray-500">Update the current volume level of a dispenser</p>
      </div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-green-50 border border-green-100 rounded-3xl p-12 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Entry Recorded</h3>
            <p className="text-green-700">The volume levels have been updated successfully.</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Select Location */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Select Location</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {locations.map(loc => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleLocationSelect(loc.id)}
                      className={cn(
                        "text-left p-4 rounded-2xl border transition-all",
                        selectedLoc?.id === loc.id 
                          ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500/10" 
                          : "bg-gray-50 border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <p className="font-semibold text-sm">{loc.name}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Current: {loc.currentVolume}ml</p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedLoc && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-8 pt-4 border-t border-gray-100"
                >
                  {/* Log Type Toggle */}
                  <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                    {(['daily', 'weekly'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setLogType(type)}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                          logType === type ? "bg-white shadow-sm text-blue-600" : "text-gray-500"
                        )}
                      >
                        {type} Check
                      </button>
                    ))}
                  </div>

                  {/* Reset/Replacement Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsReplacement(!isReplacement);
                      if (!isReplacement) setVolume('500');
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                      isReplacement ? "bg-amber-50 border-amber-500" : "bg-gray-50 border-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <RotateCcw className={cn("w-5 h-5", isReplacement ? "text-amber-600" : "text-gray-400")} />
                      <div className="text-left">
                        <p className="text-sm font-semibold">Bottle Replaced</p>
                        <p className="text-[10px] text-gray-500">Reset volume to 500ml</p>
                      </div>
                    </div>
                    <div className={cn(
                      "w-10 h-5 rounded-full flex items-center px-1 transition-colors",
                      isReplacement ? "bg-amber-600" : "bg-gray-300"
                    )}>
                      <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", isReplacement && "translate-x-5")} />
                    </div>
                  </button>

                  {/* Volume Input */}
                  {!isReplacement && (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Remaining Volume (ml)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={volume}
                          onChange={e => setVolume(e.target.value)}
                          max={selectedLoc.bottleCapacity}
                          min="0"
                          className="w-full text-4xl font-mono font-bold bg-transparent border-b-2 border-gray-100 focus:border-blue-500 outline-none pb-2 transition-colors"
                          placeholder="000"
                        />
                        <span className="absolute right-0 bottom-3 text-gray-300 font-bold">ml</span>
                      </div>
                      {Number(volume) > selectedLoc.currentVolume && (
                        <div className="flex items-center gap-2 text-amber-600 text-[10px] font-bold uppercase">
                          <AlertCircle className="w-3 h-3" />
                          Volume is higher than last recorded
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    disabled={loading || (!isReplacement && volume === '')}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? "Saving..." : <><Save className="w-5 h-5" /> Confirm Update</>}
                  </button>
                </motion.div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
