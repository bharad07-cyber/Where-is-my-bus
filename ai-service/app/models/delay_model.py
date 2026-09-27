class DelayPredictionModel:
    def predict_delay(self, route_id: str, hour_of_day: int, is_weekend: bool, traffic: str) -> dict:
        if traffic == 'HEAVY' or (17 <= hour_of_day <= 20 and not is_weekend):
            status = "MAJOR_DELAY"
            delay_mins = 14
            probability = 0.88
            reason = "Peak hour office exit traffic on arterial roads."
        elif traffic == 'MODERATE' or (8 <= hour_of_day <= 10 and not is_weekend):
            status = "SLIGHT_DELAY"
            delay_mins = 5
            probability = 0.72
            reason = "Morning commuter rush hour."
        else:
            status = "ON_TIME"
            delay_mins = 0
            probability = 0.94
            reason = "Smooth traffic flow along route corridor."

        return {
            "status": status,
            "estimated_delay_mins": delay_mins,
            "probability": probability,
            "reason": reason
        }

delay_model = DelayPredictionModel()
