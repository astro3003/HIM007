import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Check, RefreshCw, Image, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface PhotoUploadModalProps {
  product: Product | null;
  onClose: () => void;
  onSavePhoto: (productId: string, photoDataUrl: string) => void;
  onResetPhoto: (productId: string) => void;
  currentPhoto?: string;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  product,
  onClose,
  onSavePhoto,
  onResetPhoto,
  currentPhoto,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!product) return null;

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (.jpg, .jpeg, .png, .webp)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreviewUrl(dataUrl);
      setFileDetails({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleConfirm = () => {
    if (previewUrl) {
      onSavePhoto(product.id, previewUrl);
      onClose();
    }
  };

  const handleReset = () => {
    onResetPhoto(product.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-xl bg-white border border-[#E7E7E7] rounded-3xl shadow-2xl overflow-hidden text-[#0A0029]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#F7F4F1] border-b border-[#E7E7E7] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Camera className="w-4 h-4 text-[#E31B23]" />
            <span className="font-editorial text-base font-bold text-[#0A0029]">
              Custom Product Photography // {product.specCode}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-[#6C757D] hover:text-[#0A0029] hover:bg-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="border border-[#E7E7E7] bg-[#F7F4F1] rounded-2xl p-4 text-xs text-[#6C757D] flex items-center justify-between">
            <div>
              <span className="text-[#0A0029] font-bold text-sm">{product.name}</span>
              <div className="text-[11px] text-[#6C757D] mt-0.5">SKU: {product.sku}</div>
            </div>
            <span className="px-3 py-1 bg-white border border-[#E7E7E7] text-[#E31B23] text-[11px] font-bold rounded-full">
              {product.badge}
            </span>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
              dragOver
                ? 'border-[#E31B23] bg-[#E31B23]/5'
                : 'border-[#E7E7E7] hover:border-[#E31B23] bg-[#F7F4F1]/60'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
              accept="image/*"
              className="hidden"
            />

            {previewUrl ? (
              <div className="space-y-3">
                <div className="relative max-h-56 mx-auto overflow-hidden rounded-xl border border-[#E7E7E7]">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-56 mx-auto object-contain bg-white"
                  />
                  <div className="absolute top-2 right-2 px-2.5 py-0.5 bg-[#0A0029] text-white text-[10px] font-bold rounded-full">
                    READY TO APPLY
                  </div>
                </div>
                {fileDetails && (
                  <div className="text-xs text-[#6C757D] flex justify-center space-x-4">
                    <span>NAME: <strong className="text-[#0A0029]">{fileDetails.name}</strong></span>
                    <span>SIZE: <strong className="text-[#0A0029]">{fileDetails.size}</strong></span>
                  </div>
                )}
                <div className="text-[11px] text-[#6C757D]">
                  Click or drag another photo to change
                </div>
              </div>
            ) : currentPhoto ? (
              <div className="space-y-3">
                <div className="relative max-h-48 mx-auto overflow-hidden rounded-xl border border-[#E7E7E7]">
                  <img 
                    src={currentPhoto} 
                    alt="Current Active Photo" 
                    className="max-h-48 mx-auto object-contain bg-white"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-0.5 bg-[#0A0029]/90 text-white text-[10px] rounded-full">
                    CURRENT ACTIVE PHOTO
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center pt-2">
                  <Upload className="w-6 h-6 text-[#E31B23] mb-2" />
                  <p className="text-xs text-[#0A0029] font-bold">
                    Click or drag new image to replace
                  </p>
                  <p className="text-[11px] text-[#6C757D] mt-1">
                    Supports high-resolution JPG, PNG, WEBP photoshoot files
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white border border-[#E7E7E7] flex items-center justify-center mb-3 shadow-xs">
                  <Upload className="w-6 h-6 text-[#E31B23]" />
                </div>
                <p className="text-sm text-[#0A0029] font-bold">
                  Drop product photograph here
                </p>
                <p className="text-xs text-[#6C757D] mt-1">
                  or click to select from your device
                </p>
                <div className="mt-3 px-3 py-1 bg-white border border-[#E7E7E7] text-[10px] text-[#E31B23] font-semibold rounded-full">
                  High-Resolution Commercial Stills
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-white hover:bg-[#F7F4F1] border border-[#E7E7E7] text-[#6C757D] hover:text-[#0A0029] text-xs font-semibold rounded-full flex items-center transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Restore Default
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#F7F4F1] hover:bg-[#E7E7E7] text-[#6C757D] hover:text-[#0A0029] text-xs font-semibold rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!previewUrl}
                className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full flex items-center transition-all ${
                  previewUrl
                    ? 'bg-[#0A0029] hover:bg-[#E31B23] text-white shadow-md'
                    : 'bg-[#E7E7E7] text-[#6C757D] cursor-not-allowed'
                }`}
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Apply Photo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
