class CrowdPredictionModel:
    def predict_occupancy(self, route_id: str, hour_of_day: int, is_holiday: bool) -> dict:
        if is_holiday:
            occupancy = "LOW"
            occupancy_pct = 30
            confidence = 0.90
        elif 8 <= hour_of_day <= 10 or 17 <= hour_of_day <= 19:
            occupancy = "HIGH"
            occupancy_pct = 88
            confidence = 0.95
        elif 11 <= hour_of_day <= 16:
            occupancy = "MEDIUM"
            occupancy_pct = 55
            confidence = 0.89
        else:
            occupancy = "LOW"
            occupancy_pct = 25
            confidence = 0.92

        return {
            "occupancy_level": occupancy,
            "estimated_occupancy_pct": occupancy_pct,
            "confidence": confidence,
            "seats_available_estimate": max(0, 40 - int(40 * (occupancy_pct / 100)))
        }

crowd_model = CrowdPredictionModel()
