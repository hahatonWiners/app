import { useCallback } from 'react';
import { getResult } from '../services/api';

const useWebSocketHandler = (setLog, setProgress, setResult) => {
  const handleWebSocketMessage = useCallback(async (data) => {
    console.log('Received WebSocket message:', data);
    
    if (data.type === 'log') {
      setLog(prevLog => prevLog + data.message + '\n');
    } else if (data.type === 'progress') {
      setProgress(data.value);
      
      if (data.value == 100) {
        try {
          const resultData = await getResult();
          setResult(resultData);
          setLog(prevLog => prevLog + 'Результаты получены!\n');
        } catch (error) {
          console.error('Error fetching result:', error);
          setLog(prevLog => prevLog + `Ошибка при получении результатов: ${error.message}\n`);
        }
      }
    } else if (data.type === 'complete') {
      setLog(prevLog => prevLog + 'Processing completed!\n');
    } else if (data.type === 'error') {
      setLog(prevLog => prevLog + `Error: ${data.message}\n`);
    }
  }, [setLog, setProgress, setResult]);

  return handleWebSocketMessage;
};

export default useWebSocketHandler; 