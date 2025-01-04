import axios from 'axios';

export default async function uploadPhoto(photoPath: string) : Promise<string> {
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
  });

  return response.data;
}
