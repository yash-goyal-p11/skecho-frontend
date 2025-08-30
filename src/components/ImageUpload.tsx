import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  onUpload: (files: File[]) => void;
  onRemove: (index: number) => void;
  images: string[];
  maxImages?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  onRemove,
  images,
  maxImages = 5
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Filter files that are images and within size limit (5MB)
      const validFiles = acceptedFiles.filter(
        file => 
          file.type.startsWith('image/') && 
          file.size <= 5 * 1024 * 1024
      );

      if (validFiles.length > 0) {
        onUpload(validFiles);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: maxImages,
    multiple: maxImages > 1,
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div
            key={url}
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
          >
            <img
              src={url}
              alt={`Uploaded image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? 'border-skecho-coral bg-skecho-coral/5'
                  : 'border-gray-300 hover:border-skecho-coral/50'
              }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                {isDragActive ? (
                  <p>Drop the images here ...</p>
                ) : (
                  <p>
                    Drag & drop {maxImages > 1 ? 'images' : 'an image'} here, or click to select{' '}
                    {maxImages > 1 ? 'files' : 'a file'}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                className="text-skecho-coral border-skecho-coral/30 hover:bg-skecho-coral/5"
              >
                Choose File
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 