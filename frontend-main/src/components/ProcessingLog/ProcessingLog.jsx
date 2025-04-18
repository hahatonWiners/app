import React from 'react';
import './ProcessingLog.css';

const ProcessingLog = ({ log, progress }) => {
  return (
    <div className="processing-log">
      <div className="log-container">
        <pre className="log-content">{log}</pre>
      </div>
      <div className="progress-container">
        <div 
          className="progress-bar" 
          style={{ width: `${progress}%` }}
        />
        <span className="progress-text">{progress}%</span>
      </div>
    </div>
  );
};

export default ProcessingLog; 