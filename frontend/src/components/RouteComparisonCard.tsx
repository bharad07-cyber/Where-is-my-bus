import React, { useState } from 'react';
import { RouteOption } from '../types';
import { useAppStore } from '../stores/useAppStore';
import { Clock, IndianRupee, Footprints, Zap, AlertCircle, ArrowRight, ShieldCheck, Star, Users, AlertTriangle, ChevronDown, ChevronUp, MapPin, Bus } from 'lucide-react';
import { TurnByTurnWalkingCard } from './TurnByTurnWalkingCard';

interface RouteComparisonCardProps {
  option: RouteOption;
  onSelect: (option: RouteOption) => void;
}

export const RouteComparisonCard: React.FC<RouteComparisonCardProps> = ({ option, onSelect }) => {
  const { language } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'BEST_OVERALL':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'FASTEST':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
      case 'CHEAPEST':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'AUTO_HYBRID':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getCrowdBadgeStyle = (crowd: string) => {
    switch (crowd) {
      case 'LOW':
      case 'EMPTY':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'HIGH':
      case 'VERY_CROWDED':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="glass-card rounded-3xl p-5 border border-slate-700/60 shadow-2xl transition hover:border-sky-500/50 space-y-4">
      {/* Top Header: Rank, Star Rating, Title & Fare */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-700/50 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-brand-600 text-white shadow-sm">
              Option #{option.rank}
            </span>
            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getBadgeStyle(option.recommendationBadge)}`}>
              {option.recommendationBadge.replace('_', ' ')}
            </span>
            <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{option.aiRecommendationTitle}</span>
            </span>
          </div>

          <h3 className="font-bold text-base text-white mt-1">
            {language === 'ta' ? option.titleTamil : option.title}
          </h3>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Fare</span>
          <p className="font-extrabold text-xl text-emerald-400 flex items-center justify-end">
            <IndianRupee className="w-5 h-5" />
            <span>{option.totalFareRs}</span>
          </p>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-900/80 rounded-2xl p-3.5 border border-slate-800 text-center">
        <div>
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-0.5">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Travel Time</span>
          </div>
          <p className="font-extrabold text-sm text-slate-100">{option.totalDurationMins} mins</p>
        </div>

        <div>
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-0.5">
            <Footprints className="w-3.5 h-3.5 text-emerald-400" />
            <span>Walking</span>
          </div>
          <p className="font-extrabold text-sm text-slate-100">{option.walkingDistanceMeters}m ({Math.ceil(option.walkingDistanceMeters / 80)}m)</p>
        </div>

        <div>
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-0.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Transfers</span>
          </div>
          <p className="font-extrabold text-sm text-slate-100">{option.transfersCount}</p>
        </div>

        <div>
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Reliability</span>
          </div>
          <p className="font-extrabold text-sm text-indigo-300">{option.reliabilityScore}%</p>
        </div>
      </div>

      {/* Machine Learning Metrics Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/60 rounded-xl px-3 py-2 border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-medium">Crowd:</span>
          <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] border ${getCrowdBadgeStyle(option.crowdLevel)}`}>
            {option.crowdLevel}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-medium">Delay Risk:</span>
          <span className="font-extrabold text-[11px] text-emerald-400">
            {option.delayRisk.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <span>ML Confidence:</span>
          <span className="font-bold text-sky-400">{option.confidenceScore}%</span>
        </div>
      </div>

      {/* Auto Recommendation Banner (if triggered) */}
      {option.isAutoRecommended && (
        <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <p>
            <strong>Auto Pickup Suggested:</strong> Reduces walk by {option.walkingDistanceMeters}m. Estimated Auto Fare: <strong>Rs. {option.autoFareEstimateRs}</strong>
          </p>
        </div>
      )}

      {/* Explainable AI Reason */}
      <div className="flex items-start gap-2 text-slate-300 text-xs">
        <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
        <p className="italic">
          "{language === 'ta' ? option.recommendationReasonTamil : option.recommendationReason}"
        </p>
      </div>

      {/* Expand / Collapse Complete GTFS Stop Sequence */}
      {option.stopSequenceDetails && option.stopSequenceDetails.length > 0 && (
        <div className="border-t border-slate-800 pt-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-left text-xs font-semibold text-sky-400 hover:underline flex items-center justify-between"
          >
            <span>{isExpanded ? 'Hide Full GTFS Intermediate Stop Sequence' : `Show Complete GTFS Stop Sequence (${option.stopSequenceDetails.length} Stops)`}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isExpanded && (
            <div className="mt-3 bg-slate-900/90 rounded-2xl p-4 border border-sky-500/30 space-y-2">
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-sky-400" />
                <span>Complete GTFS Stop Sequence ({option.stopSequenceDetails.length} Stops)</span>
              </p>

              <div className="relative pl-6 space-y-2 border-l-2 border-slate-700">
                {option.stopSequenceDetails.map((stopName, idx) => (
                  <div key={idx} className="relative flex items-center gap-2 text-xs text-slate-200">
                    <div className={`absolute -left-[31px] w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : idx === option.stopSequenceDetails.length - 1 ? 'bg-rose-500 ring-4 ring-rose-500/20' : 'bg-sky-400'}`} />
                    <span className="font-mono text-[10px] text-slate-400 w-4">{idx + 1}.</span>
                    <span className={`font-medium ${idx === 0 || idx === option.stopSequenceDetails.length - 1 ? 'font-extrabold text-white' : ''}`}>
                      {stopName}
                    </span>
                    {idx === 0 && <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Board</span>}
                    {idx === option.stopSequenceDetails.length - 1 && <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">Get Down</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Select & Highlight on Map Button */}
      <button
        onClick={() => onSelect(option)}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-brand-600/30"
      >
        <span>Select & Highlight Route on Map</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
