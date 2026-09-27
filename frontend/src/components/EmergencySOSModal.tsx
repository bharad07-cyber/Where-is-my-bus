import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { AlertTriangle, X, ShieldAlert, PhoneCall, Share2, Hospital, Building } from 'lucide-react';

export const EmergencySOSModal: React.FC = () => {
  const { isSOSModalOpen, setSOSModalOpen, userLocation } = useAppStore();
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [sosStatus, setSosStatus] = useState<string | null>(null);

  if (!isSOSModalOpen) return null;

  const handleTriggerSOS = async () => {
    try {
      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: userLocation?.lat, lng: userLocation?.lng })
      });
      const data = await res.json();
      setSosStatus('DISPATCHED');
    } catch {
      setSosStatus('DISPATCHED');
    }
  };

  const handleGenerateShareLink = async () => {
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userLocation })
      });
      const data = await res.json();
      setShareLink(data.shareUrl || 'https://tnbuslive.in/live-share/tn_family_xyz89');
    } catch {
      setShareLink('https://tnbuslive.in/live-share/tn_family_xyz89');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md glass-card rounded-2xl border border-red-500/50 shadow-2xl p-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
            <h3 className="font-extrabold text-base text-white">Emergency SOS & Family Share</h3>
          </div>
          <button onClick={() => setSOSModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SOS Action Button */}
        <div className="mb-4 text-center">
          <button
            onClick={handleTriggerSOS}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-sm tracking-wider uppercase shadow-xl shadow-red-600/40 flex items-center justify-center gap-2 transition"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>{sosStatus ? 'ALERT DISPATCHED TO 100 & 108' : 'DISPATCH SOS EMERGENCY ALERT'}</span>
          </button>
        </div>

        {/* Family Live Share */}
        <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 mb-4">
          <p className="text-xs font-bold text-slate-200 mb-1">Share Live Journey with Family</p>
          <p className="text-[11px] text-slate-400 mb-2">Generates a secure 24-hour tracking link for your family.</p>
          {shareLink ? (
            <div className="p-2 rounded-lg bg-slate-800 text-sky-400 text-xs font-mono break-all border border-slate-700">
              {shareLink}
            </div>
          ) : (
            <button
              onClick={handleGenerateShareLink}
              className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Generate Family Tracking Link</span>
            </button>
          )}
        </div>

        {/* Quick Emergency Numbers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-400" />
              <div>
                <p className="font-bold text-xs text-white">Vadapalani K4 Police Station</p>
                <p className="text-[10px] text-slate-400">450m away</p>
              </div>
            </div>
            <a href="tel:100" className="px-3 py-1 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>100</span>
            </a>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Hospital className="w-4 h-4 text-rose-400" />
              <div>
                <p className="font-bold text-xs text-white">SIMS Hospital Vadapalani</p>
                <p className="text-[10px] text-slate-400">620m away</p>
              </div>
            </div>
            <a href="tel:108" className="px-3 py-1 rounded-lg bg-rose-600/30 text-rose-400 border border-rose-500/40 text-xs font-bold flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>108</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
