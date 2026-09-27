import numpy as np

class ETAPredictionModel:
    def __init__(self):
        # Simulated trained XGBoost Regression weights
        self.base_speed_kmh = 28.0

    def predict_eta(self, distance_km: float, stops_remaining: int, bus_speed_kmh: float, weather: str, traffic: str) -> dict:
        # Calculate dynamic delay impact
        traffic_multiplier = 1.0
        if traffic == 'HEAVY':
            traffic_multiplier = 1.45
        elif traffic == 'MODERATE':
            traffic_multiplier = 1.20

        weather_multiplier = 1.0
        if weather == 'RAIN':
            weather_multiplier = 1.30
        elif weather == 'EXTREME_HEAT':
            weather_multiplier = 1.10

        effective_speed = max(bus_speed_kmh, 12.0) / (traffic_multiplier * weather_multiplier)
        dwell_time_mins = stops_remaining * 0.75  # 45 sec per bus stop

        travel_time_mins = (distance_km / effective_speed) * 60 + dwell_time_mins
        predicted_eta = round(travel_time_mins, 1)

        confidence_score = float(np.clip(1.0 - (stops_remaining * 0.03) - (traffic_multiplier - 1.0), 0.75, 0.98))

        return {
            "predicted_eta_mins": predicted_eta,
            "confidence": round(confidence_score * 100, 1),
            "factors": {
                "traffic_delay_mins": round((traffic_multiplier - 1.0) * travel_time_mins, 1),
                "weather_delay_mins": round((weather_multiplier - 1.0) * travel_time_mins, 1),
                "stop_dwell_time_mins": round(dwell_time_mins, 1)
            }
        }

eta_model = ETAPredictionModel()
