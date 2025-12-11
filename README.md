# Emotion Recognition Cloud Service (Mediapipe Holistic + MLP + FastAPI + React)

## Project Overview

1. Using MP Holistic collected dataset with 3 emotions: happy, sad, angry (90 images in total)

2. Trained MLP (Multi-Layer Perceptron) - 97% accuracy
[!model_summary](./frontend/public/images/model_summary.png)

3. Runs as two microservices (frontend + backend) and fully containerized using Docker Compose

## Folder Structure

backend/
    Logs/...
    mp_data/
        angry/...
        happy/...
        sad/...
    app.py
    Dockerfile
    model_mlp.h5
    model.h5
    model.ipynb
    requirements.txt
frontend/
    build/...
    node_modules/...
    public/
        images/
        index.html
    src/
        App.css
        App.js
        index.css
    Dockerfile
    package-lock.json
    package.json
docker-compose.yml
package-lock.json
README.md

## Prerequisities

- Node.js 18
- Python 3.10 (Mediapipe doesn't support > 3.11)
- pip
- Conda (optional, for reproducible environment)
- mediapipe
- opencv-python
- fastapi
- tensorflow
- Docker Desktop

## How to Run (w/o Docker)

1. Backend setup
`cd backend`

2. Install required packages

`pip install -r requirements.txt`

3. Run server for backend

`uvicorn app:app --reload --host 0.0.0.0. --port 8000`

4. Backend runs at:

http://localhost:8000 

5. Frontend setup

`cd frontend`

6. Install packages from "package.json"

`npm install`

7. Start server for frontend

`npm start`

8. Frontend runs at:

http://localhost:3000

## How to Run (**with** Docker)

1. Create, start and run containers (reading docker-compose.yml)

`docker-compose up --build`

2. Containers start at

Frontend: http://localhost:3000 

Backend: http://localhost:8000 

This simulates a cloud microservice system











































1. Project Title

Emotion Recognition Cloud Service (MediaPipe + MLP + FastAPI + React)

2. Overview

Explain briefly what your project does:

Extracts keypoints from images using MediaPipe Holistic

Classifies emotion (happy, sad, angry) using an MLP model

Runs as two microservices (frontend + backend)

Fully containerized using Docker Compose

3. Folder Structure
project/
  backend/
    app.py
    model_mlp.h5
    requirements.txt
    Dockerfile
  frontend/
    src/
    package.json
    Dockerfile
  docker-compose.yml

4. Prerequisites
Without Docker:

Node.js ≥ 18

Python ≥ 3.10

pip

Conda (optional, for reproducible environment)

Must install: mediapipe, opencv-python, fastapi, tensorflow

With Docker:

Docker Desktop

No need to install Python or Node locally

5. How to Run (Without Docker)
Backend Setup
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000


Backend runs at:

http://localhost:8000

Frontend Setup
cd frontend
npm install
npm start


Frontend runs at:

http://localhost:3000

6. How to Run (WITH Docker Orchestration)

From project root:

docker-compose up --build


Containers start at:

Frontend: http://localhost:3000

Backend: http://localhost:8000

This simulates a cloud microservice system.

7. Notes about Python Version

You trained the model in Python 3.12.3, but your Docker backend uses Python 3.10, because:

MediaPipe does NOT support Python ≥ 3.11

TensorFlow also has issues on 3.12

Python 3.10 is the correct choice for production/docker

Put in README:

Training was performed in Conda environment using:
Python 3.12.3
TensorFlow, MediaPipe, OpenCV

Inference container uses Python 3.10 due to better library compatibility for deployment.