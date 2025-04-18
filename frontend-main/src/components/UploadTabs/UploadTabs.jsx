import React from 'react';
import './UploadTabs.css';

const UploadTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="upload-tabs">
      <button 
        className={`tab ${activeTab === 'zip' ? 'active' : ''}`}
        onClick={() => onTabChange('zip')}
      >
        Zip
      </button>
      <button 
        className={`tab ${activeTab === 'files' ? 'active' : ''}`}
        onClick={() => onTabChange('files')}
      >
        Много файлов
      </button>
    </div>
  );
};

export default UploadTabs; 