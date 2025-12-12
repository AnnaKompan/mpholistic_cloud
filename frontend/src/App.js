import logo from './logo.svg';
import React, {useState} from 'react';
import './App.css';
import './index.css'

function APP(){
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

  // function called when user selects file
  const handleFileChange = (event) => {
    // reads first file from input
    const file = event.target.files[0];

    // save selected file and reset previous prediction/err
    setSelectedFile(file);
    setEmotion(null);
    setProbabilities(null);
    setError(null);

    // create preview url if file selected
    if (file){
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      // if no file selected, clear preview
      setPreviewUrl(null);
    }
  };
  // function called when form is submitted
  const handleSubmit = async (event) => {
    event.preventDefault();

    // if no file selected, show error
    if (!selectedFile){
      setError("Please upload an image first!");
      return;
    }

    // start loading and clear previous error
    setIsLoading(true);
    setError(null);

    // create form data obj and append file
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // send POST to backend
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });

      // check for server errors (err if not 200..)
      if (!response.ok){
        throw new Error("Server error!");
      }

      // parse json response from backend (emotion + probabilities)
      const data = await response.json();

      // save prediction results into sate so UI can display
      setEmotion(data.emotion);
      setProbabilities(data.probabilities);
    } catch(err){
      setError(err.message || "Something went wrong");
    } finally {
      // finally always executed, turn off loading
      setIsLoading(false);
    }
  };

  // JSX (UI)
  return (
    <div className='App'>
      <h1 className="header">Emotion Recognition</h1>
      <form className="form" onSubmit={handleSubmit}>
        <input className="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        <button className="submit-btn" type="submit" disabled={isLoading}>
          {isLoading ? "Predicting, please wait..." : "Predict Emotion"}
        </button>
      </form>
      {/* Preview selected image */}
      {previewUrl && (
        <div>
          <h2 className="sub-header">Selected Image</h2>
          <img
            src={previewUrl}
            alt="preview"
            style={{maxWidth: "300px", marginTop: "10px"}}
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