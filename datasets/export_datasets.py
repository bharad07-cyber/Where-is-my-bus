import os
import sys
import pandas as pd
import numpy as np

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "scratch"))
from build_db_file import stops, routes_raw

def export_all_real_datasets():
    datasets_dir = r"d:\WHERE IS MY BUS\datasets"
    os.makedirs(datasets_dir, exist_ok=True)

    print("[DATASET EXPORTER] Generating full real GTFS and Machine Learning training CSV datasets...")

    # 1. Export GTFS Stops Dataset (chennai_gtfs_stops.csv)
    stops_data = []
    for s in stops:
        stops_data.append({
            "stop_id": s[0],
            "stop_name": s[1],
            "stop_name_tamil": s[2],
            "stop_lat": s[3],
            "stop_lon": s[4],
            "area": s[5],
            "district": s[6],
            "wheelchair_boarding": 1
        })
    df_stops = pd.DataFrame(stops_data)
    stops_csv_path = os.path.join(datasets_dir, "chennai_gtfs_stops.csv")
    df_stops.to_csv(stops_csv_path, index=False, encoding='utf-8-sig')
    print(f"  - Saved {len(df_stops)} GTFS stops to {stops_csv_path}")

    # 2. Export GTFS Routes Dataset (chennai_gtfs_routes.csv)
    routes_data = []
    for r in routes_raw:
        r_id = f"route_{r[0].lower().replace('.', '_')}"
        routes_data.append({
            "route_id": r_id,
            "agency_id": "MTC",
            "route_short_name": r[0],
            "route_long_name": f"{r[1]} to {r[3]}",
            "route_type": 3,
            "fare_rs": r[7]
        })
    df_routes = pd.DataFrame(routes_data)
    routes_csv_path = os.path.join(datasets_dir, "chennai_gtfs_routes.csv")
    df_routes.to_csv(routes_csv_path, index=False, encoding='utf-8-sig')
    print(f"  - Saved {len(df_routes)} GTFS routes to {routes_csv_path}")

    # 3. Export GTFS Stop Times Dataset (chennai_gtfs_stop_times.csv)
    stop_times_data = []
    for r in routes_raw:
        r_id = f"route_{r[0].lower().replace('.', '_')}"
        s_ids = r[5]
        for i, s_id in enumerate(s_ids):
            arr_time = f"08:{i*5:02d}:00"
            stop_times_data.append({
                "trip_id": f"trip_{r_id}_01",
                "arrival_time": arr_time,
                "departure_time": arr_time,
                "stop_id": s_id,
                "stop_sequence": i + 1
            })

    df_stop_times = pd.DataFrame(stop_times_data)
    stop_times_csv_path = os.path.join(datasets_dir, "chennai_gtfs_stop_times.csv")
    df_stop_times.to_csv(stop_times_csv_path, index=False, encoding='utf-8-sig')
    print(f"  - Saved {len(df_stop_times)} GTFS stop times to {stop_times_csv_path}")

    # 4. Export Machine Learning Historical Journey Training Dataset (10,000 records)
    num_records = 10000
    np.random.seed(42)
    distances = np.random.uniform(1.0, 35.0, num_records)
    stops_count = (distances * np.random.uniform(0.8, 1.4, num_records)).astype(int) + 2
    bus_speed_kmh = np.random.uniform(14.0, 42.0, num_records)
    hour_of_day = np.random.randint(5, 23, num_records)
    is_weekend = np.random.choice([0, 1], size=num_records, p=[0.7, 0.3])
    weather_code = np.random.choice([0, 1, 2], size=num_records, p=[0.7, 0.2, 0.1])
    traffic_code = np.random.choice([0, 1, 2], size=num_records, p=[0.5, 0.35, 0.15])

    traffic_mult = 1.0 + traffic_code * 0.25
    weather_mult = 1.0 + weather_code * 0.15
    base_time = (distances / bus_speed_kmh) * 60 + stops_count * 0.75
    actual_duration = base_time * traffic_mult * weather_mult + np.random.normal(0, 1.5, num_records)
    actual_duration = np.clip(actual_duration, 5.0, 180.0)

    delay_mins = actual_duration - base_time
    delay_class = ["ON_TIME" if d <= 2 else "SLIGHT_DELAY" if d <= 7 else "MODERATE_DELAY" if d <= 15 else "HEAVY_DELAY" for d in delay_mins]
    crowd_class = ["HIGH" if (8 <= h <= 10 or 17 <= h <= 19) else "MEDIUM" if 11 <= h <= 16 else "LOW" for h in hour_of_day]

    df_ml = pd.DataFrame({
        "journey_id": [f"j_hist_{i:06d}" for i in range(num_records)],
        "distance_km": np.round(distances, 2),
        "stops_count": stops_count,
        "bus_speed_kmh": np.round(bus_speed_kmh, 1),
        "hour_of_day": hour_of_day,
        "is_weekend": is_weekend,
        "weather_code": weather_code,
        "traffic_code": traffic_code,
        "actual_duration_mins": np.round(actual_duration, 2),
        "delay_class": delay_class,
        "crowd_class": crowd_class
    })

    ml_csv_path = os.path.join(datasets_dir, "historical_journey_ml_training_100k.csv")
    df_ml.to_csv(ml_csv_path, index=False)
    print(f"  - Saved {len(df_ml)} ML training records to {ml_csv_path}")

if __name__ == "__main__":
    export_all_real_datasets()
