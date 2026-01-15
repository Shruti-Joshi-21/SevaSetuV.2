import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Loader2, AlertCircle, Check } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

export default function LocationPreview({ onLocationCapture, targetLocation }) {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy: posAccuracy } = position.coords;
        setLocation({ latitude, longitude });
        setAccuracy(Math.round(posAccuracy));
        
        // Calculate distance if target location provided
        if (targetLocation) {
          const dist = calculateDistance(
            latitude, longitude,
            targetLocation.latitude, targetLocation.longitude
          );
          setDistance(Math.round(dist));
        }

        // Reverse geocode
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          setAddress(data.display_name || 'Location captured');
        } catch {
          setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }

        setLoading(false);
        onLocationCapture?.({ latitude, longitude, accuracy: posAccuracy, address });
      },
      (err) => {
        setError('Unable to retrieve your location. Please enable location services.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const isWithinRange = targetLocation?.radius ? distance <= targetLocation.radius : true;

  return (
    <GlassCard className="p-4">
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-xl ${
          error ? 'bg-red-100 dark:bg-red-900/30' : 
          loading ? 'bg-slate-100 dark:bg-slate-800' : 
          isWithinRange ? 'bg-emerald-100 dark:bg-emerald-900/30' : 
          'bg-amber-100 dark:bg-amber-900/30'
        }`}>
          {loading ? (
            <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
          ) : error ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : isWithinRange ? (
            <Check className="w-5 h-5 text-emerald-500" />
          ) : (
            <MapPin className="w-5 h-5 text-amber-500" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-slate-900 dark:text-white">Location</h4>
            {!loading && !error && (
              <button 
                onClick={getCurrentLocation}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                Refresh
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                {address}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1 text-slate-500">
                  <Navigation className="w-3 h-3" />
                  Accuracy: ±{accuracy}m
                </span>
                {distance !== null && (
                  <span className={`flex items-center gap-1 ${
                    isWithinRange ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    <MapPin className="w-3 h-3" />
                    {distance < 1000 ? `${distance}m` : `${(distance/1000).toFixed(1)}km`} from task
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mini Map Preview */}
      {location && !loading && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4"
        >
          <div className="relative h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude-0.005},${location.latitude-0.003},${location.longitude+0.005},${location.latitude+0.003}&layer=mapnik&marker=${location.latitude},${location.longitude}`}
              className="w-full h-full border-0"
              title="Location Map"
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
}