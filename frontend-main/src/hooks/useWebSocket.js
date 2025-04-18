import { useEffect, useRef, useCallback } from 'react';

const useWebSocket = (url, onMessage) => {
  const ws = useRef(null);

  const connect = useCallback(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('WebSocket соединение установлено');
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        // Проверяем наличие message и progress в данных
        if (data.message) {
          onMessage({
            type: 'log',
            message: data.message
          });
        }
        
        if (data.progress !== undefined) {
          onMessage({
            type: 'progress',
            value: data.progress
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        onMessage({
          type: 'log',
          message: event.data
        });
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error details:', {
        error,
        errorType: typeof error,
        errorKeys: Object.keys(error)
      });
      onMessage({
        type: 'error',
        message: 'Connection error'
      });
    };

    ws.current.onclose = (event) => {
      console.log('WebSocket connection closed with details:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      onMessage({
        type: 'log',
        message: `Connection closed (Code: ${event.code}${event.reason ? ', Reason: ' + event.reason : ''})`
      });
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url, onMessage]);

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log('Sending message:', message);
      ws.current.send(JSON.stringify(message));
    } else {
      console.log('Cannot send message, WebSocket state:', ws.current?.readyState);
    }
  }, []);

  const closeConnection = useCallback(() => {
    if (ws.current) {
      console.log('Manually closing WebSocket connection');
      ws.current.close();
    }
  }, []);

  return {
    connect,
    sendMessage,
    closeConnection
  };
};

export default useWebSocket; 