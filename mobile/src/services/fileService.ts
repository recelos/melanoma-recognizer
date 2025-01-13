import RNFS from 'react-native-fs';

export async function addFile(photoPath: string) : Promise<void> {
  const dir = `${RNFS.DownloadDirectoryPath}/MelanomaRecognizer`;
  await RNFS.mkdir(dir);
  const filePath = `${Date.now()}/pic.jpg`;
  await RNFS.copyFile(photoPath, filePath);
}
