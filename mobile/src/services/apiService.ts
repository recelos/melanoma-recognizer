import axios from 'axios';

export interface ApiResponse {
  result: string;
}

export function isApiResponse(object: any): object is ApiResponse {
  return 'result' in object;
}

export async function uploadPhoto(photoPath: string) : Promise<ApiResponse | string> {
  const endpoint = 'https://melanoma.craksys.win/image';

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
  const endpoint = `https://melanoma.craksys.win/users/${userId}/folders`;
  const response = axios.get(endpoint);

  return response;
}

export const fetchPhotosByFolder = async (folderId: number) => {
  const endpoint = `https://melanoma.craksys.win/folders/${folderId}/photos`;
  const response = await axios.get(endpoint);
  return response.data;
};

export const saveFile = async (fileUri: string, folderId: number, classificationResult: string) => {
  const endpoint = 'https://melanoma.craksys.win/save';
  const fileBlob = {
    uri: fileUri,
    type: 'image/jpeg',
    name: 'image.jpg',
  };

  const formData = new FormData();
  formData.append('file', fileBlob as any);
  formData.append('folder_id', String(folderId));
  formData.append('classification_result', classificationResult);

  const response = await axios.post(endpoint, formData, {headers: {
    'Content-Type': 'multipart/form-data',
  }});

  return response.data;
};

export const createNewFolder = async(name: string, userId: string) =>{
  const endpoint = 'https://melanoma.craksys.win/folders';
  const formData = new FormData();
  formData.append('name', name);
  formData.append('user_id', userId);
  const response = await axios.post(endpoint, formData, { headers: {
    'Content-Type': 'multipart/form-data',
  }});
  return response.data;
};

export const createNewUser = async(userId: string, username: string) => {
  const endpoint = 'https://melanoma.craksys.win/users';
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('username', username);
  const response = await axios.post(endpoint, formData, { headers: {
    'Content-Type': 'multipart/form-data',
  }});
  return response.data;
};
