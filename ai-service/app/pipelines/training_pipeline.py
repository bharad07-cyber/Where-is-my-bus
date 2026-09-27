import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, accuracy_score

class MLTrainingPipeline:
  def __init__(self):
    self.eta_model = RandomForestRegressor(n_estimators=100, random_state=42)
    self.delay_model = RandomForestClassifier(n_estimators=100, random_state=42)
    self.crowd_model = RandomForestClassifier(n_estimators=100, random_state=42)

  def generate_synthetic_journey_dataset(self, num_records: int = 10000) -> pd.DataFrame:
    print(f"[ML PIPELINE] Generating {num_records} historical journey records for model training...")
    np.random.seed(42)

    distances = np.random.uniform(1.0, 35.0, num_records) # km
    stops_count = (distances * np.random.uniform(0.8, 1.4, num_records)).astype(int) + 2
    bus_speed_kmh = np.random.uniform(14.0, 42.0, num_records)
    hour_of_day = np.random.randint(5, 23, num_records)
    is_weekend = np.random.choice([0, 1], size=num_records, p=[0.7, 0.3])
    weather_code = np.random.choice([0, 1, 2], size=num_records, p=[0.7, 0.2, 0.1]) # 0: Clear, 1: Rain, 2: Heat
    traffic_code = np.random.choice([0, 1, 2], size=num_records, p=[0.5, 0.35, 0.15]) # 0: Low, 1: Moderate, 2: Heavy

    # Calculate actual travel duration with non-linear factors
    traffic_mult = 1.0 + traffic_code * 0.25
    weather_mult = 1.0 + weather_code * 0.15
    base_time = (distances / bus_speed_kmh) * 60 + stops_count * 0.75
    actual_duration = base_time * traffic_mult * weather_mult + np.random.normal(0, 1.5, num_records)
    actual_duration = np.clip(actual_duration, 5.0, 180.0)

    # Delay target
    delay_mins = actual_duration - base_time
    delay_class = []
    for d in delay_mins:
      if d <= 2:
        delay_class.append("ON_TIME")
      elif d <= 7:
        delay_class.append("SLIGHT_DELAY")
      elif d <= 15:
        delay_class.append("MODERATE_DELAY")
      else:
        delay_class.append("HEAVY_DELAY")

    # Crowd target
    crowd_class = []
    for h in hour_of_day:
      if (8 <= h <= 10) or (17 <= h <= 19):
        crowd_class.append("HIGH" if np.random.rand() > 0.3 else "VERY_CROWDED")
      elif 11 <= h <= 16:
        crowd_class.append("MEDIUM")
      else:
        crowd_class.append("LOW")

    df = pd.DataFrame({
      "distance_km": distances,
      "stops_count": stops_count,
      "bus_speed_kmh": bus_speed_kmh,
      "hour_of_day": hour_of_day,
      "is_weekend": is_weekend,
      "weather_code": weather_code,
      "traffic_code": traffic_code,
      "actual_duration_mins": actual_duration,
      "delay_class": delay_class,
      "crowd_class": crowd_class
    })

    return df

  def train_models(self, num_records: int = 10000) -> dict:
    df = self.generate_synthetic_journey_dataset(num_records)

    features = ["distance_km", "stops_count", "bus_speed_kmh", "hour_of_day", "is_weekend", "weather_code", "traffic_code"]
    X = df[features]

    # Train ETA Regressor
    y_eta = df["actual_duration_mins"]
    X_train, X_test, y_train, y_test = train_test_split(X, y_eta, test_state=42 if False else None, test_size=0.2)
    self.eta_model.fit(X_train, y_train)
    eta_pred = self.eta_model.predict(X_test)
    r2 = r2_score(y_test, eta_pred)

    # Train Delay Classifier
    y_delay = df["delay_class"]
    X_train_d, X_test_d, y_train_d, y_test_d = train_test_split(X, y_delay, test_size=0.2)
    self.delay_model.fit(X_train_d, y_train_d)
    delay_pred = self.delay_model.predict(X_test_d)
    delay_acc = accuracy_score(y_test_d, delay_pred)

    # Train Crowd Classifier
    y_crowd = df["crowd_class"]
    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X, y_crowd, test_size=0.2)
    self.crowd_model.fit(X_train_c, y_train_c)
    crowd_pred = self.crowd_model.predict(X_test_c)
    crowd_acc = accuracy_score(y_test_c, crowd_pred)

    print(f"[ML PIPELINE] Training complete on {num_records} records!")
    print(f"  - ETA R2 Score: {r2:.4f}")
    print(f"  - Delay Classifier Accuracy: {delay_acc * 100:.2f}%")
    print(f"  - Crowd Classifier Accuracy: {crowd_acc * 100:.2f}%")

    return {
      "records_trained": num_records,
      "eta_r2_score": round(r2, 4),
      "delay_accuracy_pct": round(delay_acc * 100, 2),
      "crowd_accuracy_pct": round(crowd_acc * 100, 2),
      "status": "TRAINED_SUCCESSFULLY"
    }

if __name__ == "__main__":
  pipeline = MLTrainingPipeline()
  pipeline.train_models(10000)
