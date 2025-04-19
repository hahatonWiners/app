import { useCallback } from 'react';

const useWebSocketHandler = (setLog, setProgress, setDone) => {
  const handleWebSocketMessage = useCallback(async (data) => {
    console.log('Received WebSocket message:', data);
    
    if (data.type === 'log') {
      setLog(prevLog => prevLog + data.message + '\n');
    } else if (data.type === 'progress') {
      setProgress(data.value);
      
      if (data.value == 100) {
        setDone(true);
      }
    } else if (data.type === 'complete') {
      setLog(prevLog => prevLog + 'Processing completed!\n');
    } else if (data.type === 'error') {
      setLog(prevLog => prevLog + `Error: ${data.message}\n`);
    }
  }, [setLog, setProgress, setDone]);

  return handleWebSocketMessage;
};

export default useWebSocketHandler; 