import React, { useEffect } from 'react';
import './ResultView.css';
import { downloadFile, deleteTemp } from '../../services/api';

const ResultView = ({uploadData }) => {
  useEffect(() => {
    return () => {
      if (uploadData?.tempdir) {
        deleteTemp(uploadData).catch(error => {
          console.error('Ошибка при удалении временных файлов:', error);
        });
      }
    };
  }, [uploadData]);

  const handleDownload = async () => {
    try {
      const blob = await downloadFile(uploadData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'result.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Произошла ошибка при скачивании файла');
    }
  };

  const handleReload = async () => {
    try {
      if (uploadData?.tempdir) {
        await deleteTemp(uploadData);
      }
      window.location.reload();
    } catch (error) {
      console.error('Ошибка при удалении временных файлов:', error);
      window.location.reload();
    }
  };

  return (
    <div className="result-view">
      {/* <h2>Результат обработки:</h2>
      <div className="result-content">
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div> */}
      <div className="button-group">
        <button className="download-button" onClick={handleDownload}>
          Скачать результат
        </button>
        <button className="return-button" onClick={handleReload}>
          Загрузить еще
        </button>
      </div>
    </div>
  );
};

export default ResultView; 