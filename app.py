# uvicorn server to run the FastAPI app
import time, cv2, uvicorn
from fastapi import FastAPI, File, UploadFile
# basemodel helps define response models
from pydantic import BaseModel
# middleware.cors helps frontend-backend communication
from fastapi.middleware.cors import CORSMiddleware

import numpy as np
import mediapipe as mp
import tensorflow as tf


app = FastAPI()
# 127.0.0.1:3000 is React dev server
# origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
origins = ["http://localhost:3000",]


# only allow req from localhost, allow cookies, all http methods, any HTTP header
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

mp_holistic = mp.solutions.holistic

ACTIONS = ["happy", "sad", "angry"]
# MODEL_PATH = "./backend/model.h5"
MODEL_PATH = "./backend/model_mlp.h5"
model = tf.keras.models.load_model(MODEL_PATH)

# return 1D vector array of keypoints
def extract_keypoints(results):
    pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33*4)
    face = np.array([[res.x, res.y, res.z] for res in results.face_landmarks.landmark]).flatten() if results.face_landmarks else np.zeros(468*3)
    lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
    rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
    keypoints = np.concatenate([pose, face, lh, rh])
    return keypoints

# take img bytes and return keypoints using Holistic
def image_to_keypoints(image_bytes: bytes):
    # turn raw bytes into 1D np.array
    file_bytes = np.frombuffer(image_bytes, np.uint8)
    # decode bytes as colored img
    img_bgr = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    # create holistic model with block for resource cleanup
    with mp_holistic.Holistic(static_image_mode=True) as holistic:
        results = holistic.process(img_rgb)
    keypoints = extract_keypoints(results)
    return keypoints

# Pydantic model for prediction response
class PredictionResponse(BaseModel):
    emotion: str
    probabilities: dict 

@app.get("/emotion")
def emotion_check():
    return {"status": "ok"}

# @app.post("/predict", response_model=PredictionResponse)
# # wait for file upload in form-data under key "file"
# async def predict(file: UploadFile = File(...)):
#     contents = await file.read()

#     # convert img bytes to keypoints
#     keypoints = image_to_keypoints(contents)

#     # FOR LSTM MODEL
#     # prep input for LSTM model
#     # seq = np.repeat([keypoints.astype(np.float32)], 30, axis=0)  # (30, 1662)
#     # add dim so shape = (1, 30, 1662) as LSTM exptects 3D input
#     # x = np.expand_dims(seq, axis=0)

#     # FOR MLP MODEL
#     # add dim so shape = (1, 1662) as MLP expects 2D input
#     x = np.expand_dims(keypoints.astype(np.float32), axis=0)
    
#     # make prediction using loaded model
#     preds = model.predict(x)[0]

#     # find highest prob idx and map to lbl
#     predicted_idx = int(np.argmax(preds))
#     emotion = ACTIONS[predicted_idx]

#     # build dict of label: probability pairs for JSON response
#     prob_dict = {
#         label: float(p) for label, p in zip(ACTIONS, preds)
#     }

#     # return response as Pydantic model (emotion lbl + prob dict)
#     return PredictionResponse(
#         emotion=emotion,
#         probabilities=prob_dict,
#     )

@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    print("---- REQUEST RECEIVED ----")

    try:
        contents = await file.read()
        print("Bytes length:", len(contents))
    except Exception as e:
        print("ERROR reading file:", e)
        raise

    try:
        keypoints = image_to_keypoints(contents)
        print("Keypoints shape:", keypoints.shape)
    except Exception as e:
        print("ERROR in MediaPipe:", e)
        raise

    try:
        x = np.expand_dims(keypoints.astype(np.float32), axis=0)
        print("Model input shape:", x.shape)
    except Exception as e:
        print("ERROR preparing input:", e)
        raise

    try:
        preds = model.predict(x)
        print("Preds:", preds)
        preds = preds[0]
    except Exception as e:
        print("ERROR during prediction:", e)
        raise

    predicted_idx = int(np.argmax(preds))
    emotion = ACTIONS[predicted_idx]

    prob_dict = {label: float(p) for label, p in zip(ACTIONS, preds)}

    return PredictionResponse(emotion=emotion, probabilities=prob_dict)


if __name__ == "__main__":
    # module app, variable app
    # host 0.0.0.0. - listen on all interfaces
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

