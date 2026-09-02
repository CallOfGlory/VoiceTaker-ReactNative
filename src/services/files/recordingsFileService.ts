import { Directory, File, Paths } from 'expo-file-system';
import { generateId } from '../../utils/id';

const recordingsDirectory = new Directory(Paths.document, 'voicenotes');

function ensureDirectoryExists(): void {
  if (!recordingsDirectory.exists) {
    recordingsDirectory.create({ intermediates: true });
  }
}

function getExtension(uri: string): string {
  const match = uri.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1] : 'm4a';
}

function persistRecording(temporaryUri: string): { uri: string; sizeBytes: number } {
  ensureDirectoryExists();
  const extension = getExtension(temporaryUri);
  const fileName = `note-${Date.now()}-${generateId().slice(0, 8)}.${extension}`;
  const source = new File(temporaryUri);
  const destination = new File(recordingsDirectory, fileName);
  source.move(destination);
  // Read back from `destination`, not `source`: its uri is fixed at construction time,
  // so it is correct regardless of whether move() mutates the object it was called on.
  return { uri: destination.uri, sizeBytes: destination.exists ? destination.size ?? 0 : 0 };
}

function deleteRecordingFile(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // File already missing or inaccessible — nothing to clean up.
  }
}

function getStorageUsage(): { count: number; totalBytes: number } {
  ensureDirectoryExists();
  let count = 0;
  let totalBytes = 0;
  for (const item of recordingsDirectory.list()) {
    if (item instanceof File) {
      count += 1;
      totalBytes += item.size ?? 0;
    }
  }
  return { count, totalBytes };
}

function clearAllRecordings(): void {
  if (recordingsDirectory.exists) {
    recordingsDirectory.delete();
  }
  ensureDirectoryExists();
}

export const recordingsFileService = {
  ensureDirectoryExists,
  persistRecording,
  deleteRecordingFile,
  getStorageUsage,
  clearAllRecordings,
};
