import RNFS from 'react-native-fs';

const directory = `${RNFS.DownloadDirectoryPath}/MelanomaRecognizer`;

export async function addFile(photoPath: string) : Promise<void> {
  await RNFS.mkdir(directory);
  const filePath = `${directory}/${Date.now()}.jpg`;
  await RNFS.copyFile(photoPath, filePath);
}

export async function fetchFiles() : Promise<string[] | null> {
  const exists = await RNFS.exists(directory);

  if (!exists) {
    return null;
  }

  const files = await RNFS.readDir(directory);
  return files.filter(file => file.isFile()).map(file => `file://${file.path}`) as string[];
}
