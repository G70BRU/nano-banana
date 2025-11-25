import React, { useRef, useState } from 'react';
import { processFile } from '../utils/fileUtils';
import { ImageFile } from '../types';

interface ImageUploadProps {
  onImageSelected: (image: ImageFile) => void;
  selectedImage: ImageFile | null;
  onClear: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected, selectedImage, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const imageFile = await processFile(e.target.files[0]);
        onImageSelected(imageFile);
      } catch (error) {
        console.error("Error processing file", error);
        alert("Failed to process image. Please try another file.");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        try {
          const imageFile = await processFile(file);
          onImageSelected(imageFile);
        } catch (error) {
          console.error("Error processing file", error);
        }
      }
    }
  };

  if (selectedImage) {
    return (
      <div className="relative group w-full h-full min-h-[300px] bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center border border-gray-700">
        <img 
          src={selectedImage.previewUrl} 
          alt="Original" 
          className="max-w-full max-h-[60vh] object-contain"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <button 
            onClick={onClear}
            className="bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm transition-all"
            title="Remove image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md px-3 py-1 rounded text-xs text-white">
          Original Image
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-full h-full min-h-[300px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
        isDragging ? 'border-banana-400 bg-banana-500/10' : 'border-gray-600 hover:border-banana-500 hover:bg-gray-800'
      }`}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      <div className="p-4 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400 mx-auto mb-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <p className="text-gray-300 font-medium">Click to upload or drag & drop</p>
        <p className="text-gray-500 text-sm mt-1">Supports JPG, PNG, WEBP</p>
      </div>
    </div>
  );
};

export default ImageUpload;