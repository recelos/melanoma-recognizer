import axios from 'axios';

export interface ApiResponse {
  result: string;
}

export function isApiResponse(object: any): object is ApiResponse {
  return 'result' in object;
}

export async function uploadPhoto(photoPath: string) : Promise<ApiResponse | string> {
  const endpoint = 'http://10.0.2.2:8000/image';

  const formData = new FormData();
  formData.append('file', {
    uri: photoPath,
    type: 'image/jpeg',
    name: 'photo.jpeg',
  });

  const response = await axios.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 2000,
  });

  return response.data;
}

export async function getFolders(userId: string) : Promise<any> {
  const endpoint = `http://10.0.2.2:8000/users/${userId}/folders`;
  const response = axios.get(endpoint);

  return response;
}
