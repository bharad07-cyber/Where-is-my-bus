import { RouteOption, AIRecommendationRequest } from '../types/index.js';
import { dbStore } from '../database/db.js';
import { GISEngine } from '../gis/gisEngine.js';
import { GTFSParser } from '../gtfs/gtfsParser.js';

export interface PlanJourneyResult {
  success: boolean;
  noRouteAvailable?: boolean;
  message?: string;
  options: RouteOption[];
}

export class RoutePlanner {
  public static planJourney(req: AIRecommendationRequest): PlanJourneyResult {
    const { originLat, originLng, destLat, destLng, weatherCondition } = req;
    const stops = dbStore.getStops();
    const routes = dbStore.getRoutes();
    const vehicles = dbStore.getVehicles();

    // 1. Find nearest valid GTFS stops to Origin & Destination
    const originStopMatch = GISEngine.findNearestStop(originLat, originLng, stops, 6000);
    const destStopMatch = GISEngine.findNearestStop(destLat, destLng, stops, 6000);

    if (!originStopMatch || !destStopMatch) {
      return {
        success: false,
        noRouteAvailable: true,
        message: 'No public bus route is available for this journey.',
        options: []
      };
    }

    const originStop = originStopMatch.stop;
    const destStop = destStopMatch.stop;

    const walkToBoardMeters = originStopMatch.distanceMeters;
    const walkFromGetOffMeters = destStopMatch.distanceMeters;
    const totalWalkMeters = walkToBoardMeters + walkFromGetOffMeters;

    const options: RouteOption[] = [];

    // Helper to resolve GTFS stop sequence names
    const getStopSequenceNames = (stopIds: string[]) => {
      return stopIds.map(id => {
        const s = stops.find(item => item.id === id);
        return s ? s.name : id.replace('stop_', '').replace('_', ' ').toUpperCase();
      });
    };

    // Category 1: Direct GTFS Matches
    for (const r of routes) {
      const match = GTFSParser.isDirectGTFSMatch(r, originStop.id, destStop.id);
      if (match.matches) {
        const liveBus = vehicles.find(v => v.routeId === r.id) || vehicles[0];
        const journeyDistMeters = Math.round(GISEngine.haversineMeters(originStop.lat, originStop.lng, destStop.lat, destStop.lng));
        const busTravelTimeMins = Math.max(10, Math.round((journeyDistMeters / 1000) * 2.5));
        const busFare = r.type === 'EXPRESS' ? Math.max(18, Math.round(r.fareRs)) : Math.max(10, Math.round(r.fareRs * 0.7));

        const isAutoRecommended = totalWalkMeters > 750 || weatherCondition === 'RAIN' || weatherCondition === 'EXTREME_HEAT';
        const autoFareEstimate = Math.round(35 + (totalWalkMeters / 1000) * 18);

        options.push({
          id: `opt_direct_${r.id}`,
          rank: options.length + 1,
          title: `${r.operator} Bus ${r.routeNumber} (${originStop.name} ➔ ${destStop.name})`,
          titleTamil: `${r.operator} பேருந்து ${r.routeNumber} (${originStop.nameTamil} ➔ ${destStop.nameTamil})`,
          totalDurationMins: Math.round(busTravelTimeMins + Math.ceil(totalWalkMeters / 80)),
          totalFareRs: busFare,
          walkingDistanceMeters: totalWalkMeters,
          transfersCount: 0,
          isAutoRecommended,
          autoFareEstimateRs: autoFareEstimate,
          recommendationBadge: options.length === 0 ? 'BEST_OVERALL' : 'FASTEST',
          recommendationReason: `GTFS verified direct trip on Bus ${r.routeNumber}. Travels ${match.intermediateCount} stops directly.`,
          recommendationReasonTamil: `பேருந்து ${r.routeNumber}-இல் ${originStop.nameTamil}-லிருந்து ${destStop.nameTamil}-க்கு நேரிடைப் பயணம்.`,
          reliabilityScore: 96,
          confidenceScore: 94,
          crowdLevel: liveBus.occupancy || 'MEDIUM',
          delayRisk: liveBus.delayMins <= 0 ? 'ON_TIME' : 'SLIGHT_DELAY',
          starRating: options.length === 0 ? 5 : 4,
          aiRecommendationTitle: options.length === 0 ? '⭐⭐⭐⭐⭐ Best Overall Choice' : '⭐⭐⭐⭐ Fastest Direct Bus',
          stopSequenceDetails: getStopSequenceNames(match.stopSequence),
          steps: [
            {
              type: 'WALK',
              instruction: `Walk ${walkToBoardMeters}m to ${originStop.name}`,
              instructionTamil: `${originStop.nameTamil}-க்கு ${walkToBoardMeters}மீ நடக்கவும`,
              distanceMeters: walkToBoardMeters,
              durationMins: Math.ceil(walkToBoardMeters / 80),
              boardingStop: originStop
            },
            {
              type: 'BUS',
              instruction: `Board Bus ${r.routeNumber} towards ${r.destination}`,
              instructionTamil: `${r.destinationTamil} செல்லும் பேருந்து ${r.routeNumber}-இல் ஏறவும்`,
              distanceMeters: journeyDistMeters,
              durationMins: busTravelTimeMins,
              busNumber: r.routeNumber,
              routeId: r.id,
              boardingStop: originStop,
              getOffStop: destStop,
              intermediateStopsCount: match.intermediateCount,
              vehiclePosition: liveBus
            },
            {
              type: 'WALK',
              instruction: `Walk ${walkFromGetOffMeters}m to Destination`,
              instructionTamil: `இலக்கிற்கு ${walkFromGetOffMeters}மீ நடக்கவும`,
              distanceMeters: walkFromGetOffMeters,
              durationMins: Math.ceil(walkFromGetOffMeters / 80),
              getOffStop: destStop
            }
          ]
        });
      }
    }

    // Category 2: 1-Transfer GTFS Junction Connections
    for (const r1 of routes) {
      if (!r1.stops.includes(originStop.id)) continue;
      const originSeq1 = r1.stops.indexOf(originStop.id);

      for (const r2 of routes) {
        if (r1.id === r2.id || !r2.stops.includes(destStop.id)) continue;
        const destSeq2 = r2.stops.indexOf(destStop.id);

        const transferStopId = r1.stops.slice(originSeq1 + 1).find(sId => {
          const seq2 = r2.stops.indexOf(sId);
          return seq2 !== -1 && seq2 < destSeq2;
        });

        if (transferStopId) {
          const transferStop = stops.find(s => s.id === transferStopId);
          if (!transferStop) continue;

          const seq1Count = r1.stops.indexOf(transferStopId) - originSeq1;
          const seq2Count = destSeq2 - r2.stops.indexOf(transferStopId);

          const totalMins = 32 + seq1Count * 3 + seq2Count * 3;
          const totalFare = r1.fareRs + r2.fareRs;

          // Combine GTFS stop sequence for r1 and r2
          const seq1Array = r1.stops.slice(originSeq1, r1.stops.indexOf(transferStopId) + 1);
          const seq2Array = r2.stops.slice(r2.stops.indexOf(transferStopId), destSeq2 + 1);
          const combinedSeq = [...seq1Array, ...seq2Array.slice(1)];

          options.push({
            id: `opt_transfer_${r1.id}_${r2.id}`,
            rank: options.length + 1,
            title: `Transfer Route: Bus ${r1.routeNumber} ➔ Bus ${r2.routeNumber} (via ${transferStop.name})`,
            titleTamil: `இணைப்புப் பேருந்து: ${r1.routeNumber} ➔ ${r2.routeNumber} (${transferStop.nameTamil} வழியாக)`,
            totalDurationMins: totalMins,
            totalFareRs: totalFare,
            walkingDistanceMeters: totalWalkMeters + 120,
            transfersCount: 1,
            isAutoRecommended: totalWalkMeters > 700,
            autoFareEstimateRs: Math.round(35 + (totalWalkMeters / 1000) * 18),
            recommendationBadge: 'AUTO_HYBRID',
            recommendationReason: `Verified GTFS transfer. Board Bus ${r1.routeNumber} to ${transferStop.name}, then transfer to Bus ${r2.routeNumber}.`,
            recommendationReasonTamil: `${transferStop.nameTamil} நிறுத்தத்தில் இணைப்புப் பேருந்து ${r2.routeNumber}-க்கு மாறவும்.`,
            reliabilityScore: 92,
            confidenceScore: 90,
            crowdLevel: 'LOW',
            delayRisk: 'ON_TIME',
            starRating: 4,
            aiRecommendationTitle: '⭐⭐⭐⭐ Convenient Transfer Route',
            stopSequenceDetails: getStopSequenceNames(combinedSeq),
            steps: [
              {
                type: 'WALK',
                instruction: `Walk ${walkToBoardMeters}m to ${originStop.name}`,
                instructionTamil: `${originStop.nameTamil}-க்கு ${walkToBoardMeters}மீ நடக்கவும`,
                distanceMeters: walkToBoardMeters,
                durationMins: Math.ceil(walkToBoardMeters / 80),
                boardingStop: originStop
              },
              {
                type: 'BUS',
                instruction: `Board Bus ${r1.routeNumber} to ${transferStop.name}`,
                instructionTamil: `${transferStop.nameTamil}-க்கு பேருந்து ${r1.routeNumber}-இல் ஏறவும்`,
                distanceMeters: 4500,
                durationMins: 18,
                busNumber: r1.routeNumber,
                boardingStop: originStop,
                getOffStop: transferStop,
                intermediateStopsCount: seq1Count
              },
              {
                type: 'TRANSFER',
                instruction: `Transfer at ${transferStop.name} (Wait ~5 mins)`,
                instructionTamil: `${transferStop.nameTamil} நிறுத்தத்தில் மாறவும்`,
                distanceMeters: 100,
                durationMins: 5
              },
              {
                type: 'BUS',
                instruction: `Board Bus ${r2.routeNumber} to ${destStop.name}`,
                instructionTamil: `${destStop.nameTamil}-க்கு பேருந்து ${r2.routeNumber}-இல் ஏறவும்`,
                distanceMeters: 5500,
                durationMins: 20,
                busNumber: r2.routeNumber,
                boardingStop: transferStop,
                getOffStop: destStop,
                intermediateStopsCount: seq2Count
              },
              {
                type: 'WALK',
                instruction: `Walk ${walkFromGetOffMeters}m to Destination`,
                instructionTamil: `இலக்கிற்கு ${walkFromGetOffMeters}மீ நடக்கவும`,
                distanceMeters: walkFromGetOffMeters,
                durationMins: Math.ceil(walkFromGetOffMeters / 80),
                getOffStop: destStop
              }
            ]
          });
          if (options.length >= 7) break;
        }
      }
    }

    // Category 3: Auto + Bus Hybrid Options
    const primaryRoute = routes[0];
    const autoFare = Math.round(35 + (totalWalkMeters / 1000) * 18);
    options.push({
      id: `opt_auto_hybrid`,
      rank: options.length + 1,
      title: `Auto Pickup + Bus ${primaryRoute.routeNumber} Express`,
      titleTamil: `ஆட்டோ பயணம் + பேருந்து ${primaryRoute.routeNumber} எக்ஸ்பிரஸ்`,
      totalDurationMins: 22,
      totalFareRs: primaryRoute.fareRs + autoFare,
      walkingDistanceMeters: 50,
      transfersCount: 1,
      isAutoRecommended: true,
      autoFareEstimateRs: autoFare,
      recommendationBadge: 'AUTO_HYBRID',
      recommendationReason: `Saves ${Math.ceil(walkToBoardMeters / 80)} minutes of walking in current traffic by taking an Auto ride directly to ${originStop.name}.`,
      recommendationReasonTamil: `ஆட்டோ மூலம் ${originStop.nameTamil} நிறுத்தத்தை அடைந்து விரைவாக பயணிக்கலாம்.`,
      reliabilityScore: 98,
      confidenceScore: 96,
      crowdLevel: 'LOW',
      delayRisk: 'ON_TIME',
      starRating: 5,
      aiRecommendationTitle: '⭐⭐⭐⭐⭐ Minimum Walking & Maximum Comfort',
      stopSequenceDetails: getStopSequenceNames(primaryRoute.stops),
      steps: [
        {
          type: 'AUTO',
          instruction: `Take Auto to ${originStop.name} (Estimated Rs.${autoFare})`,
          instructionTamil: `${originStop.nameTamil}-க்கு ஆட்டோவில் செல்லவும் (ரூ.${autoFare})`,
          distanceMeters: walkToBoardMeters,
          durationMins: 4
        },
        {
          type: 'BUS',
          instruction: `Board Bus ${primaryRoute.routeNumber}`,
          instructionTamil: `பேருந்து ${primaryRoute.routeNumber}-இல் ஏறவும்`,
          distanceMeters: 6500,
          durationMins: 18,
          busNumber: primaryRoute.routeNumber,
          routeId: primaryRoute.id,
          boardingStop: originStop,
          getOffStop: destStop,
          intermediateStopsCount: primaryRoute.stops.length
        }
      ]
    });

    // Category 4: Cheap Ordinary Town Bus (White / Pink Board)
    options.push({
      id: `opt_ordinary_white_board`,
      rank: options.length + 1,
      title: `Ordinary MTC Town Bus (Pink / White Board)`,
      titleTamil: `சாதாரண எம்டிசி பேருந்து (மகளிருக்கு இலவசம்)`,
      totalDurationMins: 38,
      totalFareRs: 10,
      walkingDistanceMeters: totalWalkMeters,
      transfersCount: 0,
      isAutoRecommended: false,
      recommendationBadge: 'CHEAPEST',
      recommendationReason: `Lowest fare option (Only Rs. 10). Free travel eligible for women in pink buses.`,
      recommendationReasonTamil: `மிகக் குறைந்த கட்டணம் (ரூ. 10 மட்டுமே). மகளிருக்கு இலவச பேருந்து சேவை உண்டு.`,
      reliabilityScore: 94,
      confidenceScore: 91,
      crowdLevel: 'MEDIUM',
      delayRisk: 'ON_TIME',
      starRating: 4,
      aiRecommendationTitle: '⭐⭐⭐⭐ Economical & Free Travel Eligible',
      stopSequenceDetails: getStopSequenceNames(primaryRoute.stops),
      steps: [
        {
          type: 'WALK',
          instruction: `Walk to ${originStop.name}`,
          instructionTamil: `${originStop.nameTamil}-க்கு நடக்கவும`,
          distanceMeters: walkToBoardMeters,
          durationMins: Math.ceil(walkToBoardMeters / 80),
          boardingStop: originStop
        },
        {
          type: 'BUS',
          instruction: `Board Ordinary Town Bus`,
          instructionTamil: `சாதாரண நகர பேருந்தில் ஏறவும்`,
          distanceMeters: 6500,
          durationMins: 38,
          busNumber: '11G / 23C',
          boardingStop: originStop,
          getOffStop: destStop
        }
      ]
    });

    // Re-rank options 1 to 10
    options.forEach((opt, index) => {
      opt.rank = index + 1;
    });

    if (options.length === 0) {
      return {
        success: false,
        noRouteAvailable: true,
        message: 'No public bus route is available for this journey.',
        options: []
      };
    }

    return {
      success: true,
      options: options.slice(0, 10)
    };
  }
}
