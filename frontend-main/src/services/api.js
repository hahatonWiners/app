import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const getResult = async () => {
  try {
    const response = await axios.get(`${API_URL}/result`);
    return response.data;
  } catch (error) {
    console.error('Error fetching result:', error);
    throw error;
  }
};

export const downloadFile = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/download`, data, {
      responseType: 'blob',
      headers: {
        'Accept': 'text/csv',
      }
    });
    
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Failed to download file');
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response:', error.response.data);
      throw new Error(error.response.data.detail || 'Failed to download file');
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
      throw new Error('No response from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
      throw error;
    }
  }
};

export const deleteTemp = async (data) => {
  try {
    const response = await axios.get(`${API_URL}/delete_temp`, {
      params: data
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting temp files:', error);
    throw error;
  }
}; 