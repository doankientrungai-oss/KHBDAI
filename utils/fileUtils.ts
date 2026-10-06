import mammoth from 'mammoth';
import { AttachedFile } from '../types';

export const processFile = async (file: File): Promise<AttachedFile> => {
  const fileId = Math.random().toString(36).substring(2, 9);
  const fileName = file.name;
  const fileSize = file.size;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  let fileType: 'pdf' | 'image' | 'docx' | 'other' = 'other';
  if (ext === 'pdf' || file.type === 'application/pdf') {
    fileType = 'pdf';
  } else if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext) || file.type.startsWith('image/')) {
    fileType = 'image';
  } else if (['docx', 'doc'].includes(ext) || file.type.includes('wordprocessingml') || file.type.includes('msword')) {
    fileType = 'docx';
  }

  const mimeType = file.type || (
    fileType === 'pdf' 
      ? 'application/pdf' 
      : fileType === 'image' 
        ? `image/${ext === 'jpg' ? 'jpeg' : ext}` 
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );

  const attachedFile: AttachedFile = {
    id: fileId,
    name: fileName,
    size: fileSize,
    type: fileType,
    mimeType: mimeType,
    isLoading: true,
  };

  try {
    if (fileType === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      attachedFile.extractedText = result.value || '';
      const base64 = await fileToBase64(file);
      attachedFile.dataBase64 = base64;
      attachedFile.isLoading = false;
    } else if (fileType === 'pdf' || fileType === 'image') {
      const base64 = await fileToBase64(file);
      attachedFile.dataBase64 = base64;
      attachedFile.isLoading = false;
    } else {
      try {
        const text = await file.text();
        attachedFile.extractedText = text;
      } catch {
        const base64 = await fileToBase64(file);
        attachedFile.dataBase64 = base64;
      }
      attachedFile.isLoading = false;
    }
  } catch (err: any) {
    console.error(`Error reading file ${fileName}:`, err);
    attachedFile.error = 'Không thể đọc nội dung file';
    attachedFile.isLoading = false;
  }

  return attachedFile;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data url prefix e.g. "data:application/pdf;base64,"
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
