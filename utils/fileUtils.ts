import { ImageFile } from '../types';

export const processFile = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 data and mime type
      // result format: "data:image/jpeg;base64,/9j/4AAQSw..."
      const match = result.match(/^data:(.+);base64,(.+)$/);
      if (match) {
        resolve({
          file,
          previewUrl: result,
          mimeType: match[1],
          base64: match[2],
        });
      } else {
        reject(new Error("Failed to parse file data"));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};