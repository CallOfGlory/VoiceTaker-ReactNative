import { Directory, File, Paths } from 'expo-file-system';
import { generateId } from '../../utils/id';

const songsDirectory = new Directory(Paths.document, 'songs');

function ensureDirectoryExists(): void {
  if (!songsDirectory.exists) {
    songsDirectory.create({ intermediates: true });
  }
}

function getExtension(url: string): string {
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
  return match ? match[1] : 'm4a';
}

async function downloadPreview(remoteUrl: string): Promise<{ uri: string; sizeBytes: number }> {
  ensureDirectoryExists();
  const extension = getExtension(remoteUrl);
  const fileName = `song-${Date.now()}-${generateId().slice(0, 8)}.${extension}`;
  const destination = new File(songsDirectory, fileName);
  const output = await File.downloadFileAsync(remoteUrl, destination);
  return { uri: output.uri, sizeBytes: output.exists ? output.size ?? 0 : 0 };
}

function deleteSongFile(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // File already missing or inaccessible — nothing to clean up.
  }
}

function clearAllSongs(): void {
  if (songsDirectory.exists) {
    songsDirectory.delete();
  }
  ensureDirectoryExists();
}

function getStorageUsage(): { count: number; totalBytes: number } {
  ensureDirectoryExists();
  let count = 0;
  let totalBytes = 0;
  for (const item of songsDirectory.list()) {
    if (item instanceof File) {
      count += 1;
      totalBytes += item.size ?? 0;
    }
  }
  return { count, totalBytes };
}

export const songsFileService = {
  ensureDirectoryExists,
  downloadPreview,
  deleteSongFile,
  clearAllSongs,
  getStorageUsage,
};
