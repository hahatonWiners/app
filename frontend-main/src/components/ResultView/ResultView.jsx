import React from 'react';
import './ResultView.css';

const ResultView = ({ result }) => {
  return (
    <div className="result-view">
      <h2>Результат обработки:</h2>
      <div className="result-content">
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
      <div className="button-group">
        <button className="download-button">
          Скачать результат
        </button>
        <button className="return-button" onClick={() => window.location.reload()}>
          Загрузить еще
        </button>
      </div>
    </div>
  );
};

export default ResultView; 