import { api } from './config';

export const uploadService = {
  async uploadFile(file, params) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(
      `/upload?a=${params.a}&b=${params.b}&c=${params.c}&d=${params.d}`, 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data;
  }
}; 