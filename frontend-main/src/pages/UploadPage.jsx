import React, { useState } from 'react';
import UploadTable from '../components/UploadTable/UploadTable';
import UploadTabs from '../components/UploadTabs/UploadTabs';
import ProcessingLog from '../components/ProcessingLog/ProcessingLog';
import ResultView from '../components/ResultView/ResultView';
import useWebSocket from '../hooks/useWebSocket';
import useWebSocketHandler from '../hooks/useWebSocketHandler';
import './UploadPage.css';

const WS_URL = import.meta.env.VITE_WS_URL;

const UploadPage = () => {
  const [activeTab, setActiveTab] = useState('zip');
  const [isProcessing, setIsProcessing] = useState(false);
  const [log, setLog] = useState('');
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [uploadData, setUploadData] = useState(null);

  const handleWebSocketMessage = useWebSocketHandler(setLog, setProgress, setDone);
  const { connect, sendMessage } = useWebSocket(WS_URL, handleWebSocketMessage);

  const handleUpload = (files, params, data) => {
    setUploadData(data);
    setIsProcessing(true);
    setLog('Starting process...\n');
    connect();
    
    sendMessage({
      type: 'start_processing',
      files: activeTab === 'zip' ? [files[0].name] : files.map(f => f.name),
      params: params
    });
  };

  return (
    <div className="upload-page">
      {!isProcessing ? (
        <>
          <UploadTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <UploadTable onUpload={handleUpload} activeTab={activeTab} />
        </>
      ) : (
        <>
          <ProcessingLog log={log} progress={progress} />
          {done && <ResultView uploadData={uploadData} />}
        </>
      )}
    </div>
  );
};

export default UploadPage; 