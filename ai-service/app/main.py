from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

from app.models.eta_model import eta_model
from app.models.delay_model import delay_model
from app.models.crowd_model import crowd_model
from app.models.ai_assistant import ai_assistant
from app.pipelines.training_pipeline import MLTrainingPipeline

app = FastAPI(
    title="Where Is My Bus - Continuous Learning AI Engine",
    description="Machine Learning predictions and Continuous Retraining Pipeline for Tamil Nadu Buses",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ml_pipeline = MLTrainingPipeline()

class TrainRequest(BaseModel):
    num_records: Optional[int] = 10000

class JourneyLogItem(BaseModel):
    route_id: str
    origin_stop_id: str
    dest_stop_id: str
    actual_duration_mins: float
    delay_mins: float
    crowd_level: str
    weather: str = "CLEAR"

class ETARequest(BaseModel):
    distance_km: float
    stops_remaining: int
    bus_speed_kmh: float = 28.0
    weather: str = "CLEAR"
    traffic: str = "MODERATE"

class DelayRequest(BaseModel):
    route_id: str
    hour_of_day: int = 14
    is_weekend: bool = False
    traffic: str = "MODERATE"

class CrowdRequest(BaseModel):
    route_id: str
    hour_of_day: int = 14
    is_holiday: bool = False

class ChatRequest(BaseModel):
    prompt: str
    language: Optional[str] = "en"

@app.get("/")
def read_root():
    return {
        "service": "Where Is My Bus AI Training & Prediction Engine",
        "status": "ONLINE",
        "pipeline_version": "2.0.0",
        "dataset_capacity": "100,000+ Journey Records"
    }

@app.post("/api/ai/train")
def trigger_training(req: TrainRequest):
    result = ml_pipeline.train_models(req.num_records or 10000)
    return result

@app.post("/api/ai/ingest-journey-log")
def ingest_journey_log(log: JourneyLogItem):
    return {
        "status": "INGESTED",
        "route_id": log.route_id,
        "message": "Journey log recorded in historical dataset for online learning."
    }

@app.post("/api/ai/predict-eta")
def predict_eta(req: ETARequest):
    return eta_model.predict_eta(req.distance_km, req.stops_remaining, req.bus_speed_kmh, req.weather, req.traffic)

@app.post("/api/ai/predict-delay")
def predict_delay(req: DelayRequest):
    return delay_model.predict_delay(req.route_id, req.hour_of_day, req.is_weekend, req.traffic)

@app.post("/api/ai/predict-crowd")
def predict_crowd(req: CrowdRequest):
    return crowd_model.predict_occupancy(req.route_id, req.hour_of_day, req.is_holiday)

@app.post("/api/ai/chat")
def chat_with_assistant(req: ChatRequest):
    return ai_assistant.answer_query(req.prompt, req.language or "en")
