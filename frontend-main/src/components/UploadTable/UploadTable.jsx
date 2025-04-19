import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { uploadService } from '../../api/uploadService';
import './UploadTable.css';

const UploadTable = ({ onUpload, activeTab }) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [aValue, setAValue] = useState('1');
  const [bValue, setBValue] = useState('1');
  const [cValue, setCValue] = useState('1');
  const [dValue, setDValue] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const isZipMode = activeTab === 'zip';

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    if (isZipMode) {
      const zipFile = droppedFiles[0];
      if (zipFile.type === 'application/zip' || zipFile.name.endsWith('.zip')) {
        setFiles([zipFile]);
        simulateUploadProgress();
      } else {
        alert('Пожалуйста, загрузите ZIP архив');
      }
    } else {
      const validFiles = droppedFiles.filter(file => 
        file.type === 'text/csv' || 
        file.type === 'image/png' || 
        file.type === 'image/jpeg'
      );
      
      if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles]);
      } else {
        alert('Пожалуйста, загрузите файлы форматов CSV, PNG или JPG');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (isZipMode) {
      const zipFile = selectedFiles[0];
      if (zipFile && (zipFile.type === 'application/zip' || zipFile.name.endsWith('.zip'))) {
        setFiles([zipFile]);
        simulateUploadProgress();
      }
    } else {
      const validFiles = selectedFiles.filter(file => 
        file.type === 'text/csv' || 
        file.type === 'image/png' || 
        file.type === 'image/jpeg'
      );
      
      if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles]);
      }
    }
  };

  const simulateUploadProgress = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const createZipFromFiles = async (files) => {
    const zip = new JSZip();
    
    // Добавляем все файлы в zip
    for (const file of files) {
      const fileContent = await file.arrayBuffer();
      zip.file(file.name, fileContent);
    }
    
    // Генерируем zip файл
    const zipContent = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    }, (metadata) => {
      // Обновляем прогресс
      setUploadProgress(Math.round(metadata.percent));
    });
    
    // Создаем File объект из blob
    return new File([zipContent], 'files.zip', { type: 'application/zip' });
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      alert('Пожалуйста, выберите файлы');
      return;
    }
    setIsLoading(true);
    try {
      let zipFile;
      
      if (isZipMode) {
        zipFile = files[0];
      } else {
        setIsUploading(true);
        zipFile = await createZipFromFiles(files);
      }

      const params = {
        a: parseFloat(aValue),
        b: parseFloat(bValue),
        c: parseFloat(cValue),
        d: parseFloat(dValue)
      };

      const data = await uploadService.uploadFile(zipFile, params);
      console.log('Успешно загружено:', data);
      
      if (isZipMode) {
        onUpload && onUpload(files, params, data);
      } else {
        onUpload && onUpload([{ name: 'files.zip' }], params, data);
      }
      
      setIsUploading(false);
      setUploadProgress(0);
      
    } catch (error) {
      console.error('Ошибка при загрузке:', error);
      setIsUploading(false);
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (isZipMode) {
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  const handleAddMore = () => {
    fileInputRef.current?.click();
  };

  const handleNumberInput = (e, type) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      const setValue = value;
      switch(type) {
        case 'a':
          setAValue(setValue);
          break;
        case 'b':
          setBValue(setValue);
          break;
        case 'c':
          setCValue(setValue);
          break;
        case 'd':
          setDValue(setValue);
          break;
      }
    }
  };

  // Очищаем файлы при смене режима
  React.useEffect(() => {
    setFiles([]);
    setUploadProgress(0);
    setIsUploading(false);
  }, [activeTab]);

  return (
    <div className="upload-container">
      <div className="number-inputs">
        <div className="input-group">
          <label htmlFor="aValue">A:</label>
          <input
            type="number"
            id="aValue"
            value={aValue}
            onChange={(e) => handleNumberInput(e, 'a')}
            placeholder="1"
            min="1"
          />
        </div>
        <div className="input-group">
          <label htmlFor="bValue">B:</label>
          <input
            type="number"
            id="bValue"
            value={bValue}
            onChange={(e) => handleNumberInput(e, 'b')}
            placeholder="1"
            min="1"
          />
        </div>
        <div className="input-group">
          <label htmlFor="cValue">C:</label>
          <input
            type="number"
            id="cValue"
            value={cValue}
            onChange={(e) => handleNumberInput(e, 'c')}
            placeholder="1"
            min="1"
          />
        </div>
        <div className="input-group">
          <label htmlFor="dValue">D:</label>
          <input
            type="number"
            id="dValue"
            value={dValue}
            onChange={(e) => handleNumberInput(e, 'd')}
            placeholder="1"
            min="1"
          />
        </div>
      </div>

      <div 
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${files.length > 0 ? 'has-file' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={files.length === 0 ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={isZipMode ? '.zip' : '.csv,.png,.jpg,.jpeg'}
          onChange={handleFileSelect}
          multiple={!isZipMode}
          className="file-input"
        />
        
        {files.length > 0 ? (
          <div className="upload-status">
            {files.map((file, index) => (
              <div key={index} className="file-card">
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                </div>
                <div className="file-actions">
                  <button className="action-button delete" onClick={() => handleDelete(index)}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            {isZipMode && isUploading && (
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${uploadProgress}%` }}
                />
                <span className="progress-text">{uploadProgress}%</span>
              </div>
            )}
            {!isZipMode && (
              <button 
                className="add-more-button"
                onClick={handleAddMore}
                type="button"
              >
                + Добавить еще файлы
              </button>
            )}
          </div>
        ) : (
          <div className="drop-text">
            {isDragging ? (
              <span>Отпустите файл{!isZipMode ? 'ы' : ''} здесь</span>
            ) : (
              <>
                <span className="upload-icon">📁</span>
                <span>
                  {isZipMode 
                    ? 'Перетащите ZIP архив или кликните для выбора'
                    : 'Перетащите файлы (CSV, PNG, JPG) или кликните для выбора'}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <button 
        className="submit-button"
        disabled={files.length === 0 || isUploading || isLoading}
        onClick={handleSubmit}
      >
        {isLoading ? 'Загрузка...' : 'Отправить'}
      </button>
    </div>
  );
};

export default UploadTable; 