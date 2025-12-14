
import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import './App.css';
import './index.css'

function APP() {
  // set selected file, useState null initial(no file selected)
  const [selectedFile, setSelectedFile] = useState(null);
  // url for previewing selected image
  const [previewUrl, setPreviewUrl] = useState(null);
  // predicted emotion
  const [emotion, setEmotion] = useState(null);
  // probabilities for each emotion
  const [probabilities, setProbabilities] = useState(null);
  // loading state
  const [isLoading, setIsLoading] = useState(false);
  // error state
  const [error, setError] = useState(null);
  // camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const webcamRef = useRef(null);

  // Reusable function to predict emotion from a file
  const predictEmotion = async (file) => {
    setIsLoading(true);
    setError(null);
    setEmotion(null);
    setProbabilities(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("https://emotion-backend-324286254012.asia-east1.run.app/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Server error!");
      }

      const data = await response.json();
      setEmotion(data.emotion);
      setProbabilities(data.probabilities);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // function called when user selects file
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsCameraOpen(false);
      // Auto-predict
      predictEmotion(file);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const capture = React.useCallback(
    () => {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "webcam-capture.jpg", { type: "image/jpeg" });
            setSelectedFile(file);
            setPreviewUrl(imageSrc);
            setIsCameraOpen(false);
            // Auto-predict
            predictEmotion(file);
          });
      }
    },
    [webcamRef]
  );

  // JSX (UI)
  return (
    <div className='App'>
      <h1 className="header">Emotion Recognition</h1>

      {!isCameraOpen && (
        <div className="input-group">
          {/* Hidden file input, triggered by label or custom button could be better, but keeping simple for now */}
          <label className="submit-btn" style={{ display: 'inline-block', cursor: 'pointer' }}>
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>

          <button className="camera-btn" onClick={() => setIsCameraOpen(true)}>
            Take Photo
          </button>
        </div>
      )}

      {isCameraOpen && (
        <div className="camera-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={320}
            height={240}
            videoConstraints={{ facingMode: "user" }}
          />
          <div className="camera-controls">
            <button onClick={capture}>Capture</button>
            <button onClick={() => setIsCameraOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {isLoading && (
        <p style={{ fontWeight: 'bold', color: '#666' }}>Predicting emotion...</p>
      )}

      {/* Preview selected image */}
      {previewUrl && !isCameraOpen && (
        <div>
          <h2 className="sub-header">Selected Image</h2>
          <img
            src={previewUrl}
            alt="preview"
            style={{ maxWidth: "300px", marginTop: "10px", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
          />
        </div>
      )}

      {/* Display error message */}
      {error && (
        <p className="error-msg">
          {error}
        </p>
      )}

      {/* Display prediction results */}
      {emotion && (
        <div className="prediction-results">
          <h2 className="sub-header">Prediction</h2>
          <p className="emotion-text">
            Emotion: <strong>{emotion}</strong>
          </p>
          {/* Show probabilities for each emotion */}
          {probabilities && (
            <ul className="probability-list">
              {Object.entries(probabilities).map(([label, prob]) => (
                <li className="probability-item" key={label}>
                  {label}: {(prob * 100).toFixed(1)}%
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default APP;