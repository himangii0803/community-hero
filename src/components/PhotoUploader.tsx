/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Camera, Image as ImageIcon, X, Sparkles, Upload } from 'lucide-react';

interface PhotoUploaderProps {
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

// Preset test images with Unsplash IDs representing different issues
const PRESET_TEST_IMAGES = [
  {
    name: "Road Pothole",
    url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
    category: "potholes"
  },
  {
    name: "Water Pipeline Leak",
    url: "https://images.unsplash.com/photo-1542013936693-8848e574047e?auto=format&fit=crop&q=80&w=600",
    category: "water leakage"
  },
  {
    name: "Hanging Exposed Wire",
    url: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=600",
    category: "exposed wiring"
  },
  {
    name: "Broken Streetlight",
    url: "https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&q=80&w=600",
    category: "broken streetlights"
  }
];

export default function PhotoUploader({ onPhotosChange, maxPhotos = 5 }: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handlePhotosAdded = (newUrls: string[]) => {
    const combined = [...photos, ...newUrls].slice(0, maxPhotos);
    setPhotos(combined);
    onPhotosChange(combined);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    
    // Process each file with FileReader
    const loadPromises = filesArray.map((file: any) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(loadPromises).then(base64Urls => {
      handlePhotosAdded(base64Urls);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesArray = Array.from(e.dataTransfer.files);
      const loadPromises = filesArray.map((file: any) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(loadPromises).then(base64Urls => {
        handlePhotosAdded(base64Urls);
      });
    }
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    onPhotosChange(updated);
  };

  const addPreset = (url: string) => {
    if (photos.includes(url)) return;
    handlePhotosAdded([url]);
  };

  return (
    <div className="space-y-4" id="photo-uploader-component">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 text-center flex flex-col items-center justify-center ${
          dragActive 
            ? "border-sky-500 bg-sky-50/50" 
            : "border-slate-200 hover:border-slate-300 bg-slate-50/40"
        }`}
        id="photo-drag-drop-area"
      >
        <input
          type="file"
          id="photo-file-input"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={photos.length >= maxPhotos}
        />
        
        <label 
          htmlFor="photo-file-input" 
          className={`flex flex-col items-center cursor-pointer ${photos.length >= maxPhotos ? "pointer-events-none opacity-50" : ""}`}
        >
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-xs border border-slate-100 text-slate-500 mb-2.5">
            <Upload className="h-5 w-5 text-slate-500" />
          </div>
          <p className="text-xs text-slate-700 font-semibold mb-1">
            Drag & drop or <span className="text-sky-600 underline hover:text-sky-700">browse photos</span>
          </p>
          <p className="text-[10px] text-slate-400 font-medium">
            Supports PNG, JPG, or HEIC (Up to {maxPhotos} photos)
          </p>
        </label>
      </div>

      {/* Thumbnail Previews */}
      {photos.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-slate-500 font-semibold">
              Selected Photos ({photos.length}/{maxPhotos})
            </span>
            <button 
              type="button" 
              onClick={() => { setPhotos([]); onPhotosChange([]); }}
              className="text-[10px] text-rose-600 hover:underline font-medium"
            >
              Clear all
            </button>
          </div>
          
          <div className="grid grid-cols-5 gap-2.5" id="photo-thumbnail-grid">
            {photos.map((url, idx) => (
              <div 
                key={idx} 
                className="relative aspect-square rounded-lg overflow-hidden group border border-slate-200 shadow-2xs"
              >
                <img 
                  src={url} 
                  alt={`Civic report detail ${idx + 1}`} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center shadow transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-black/40 text-[9px] text-white text-center py-0.5 font-medium">
                  #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instant Presets for Easy Testing */}
      <div className="p-3 bg-indigo-50/40 border border-indigo-100/80 rounded-xl space-y-2">
        <div className="flex items-center gap-1 text-[11px] text-indigo-800 font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>Need test photos? Click to instantly load presets:</span>
        </div>
        
        <div className="flex flex-wrap gap-1.5" id="preset-buttons-container">
          {PRESET_TEST_IMAGES.map((preset, idx) => {
            const isAdded = photos.includes(preset.url);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => addPreset(preset.url)}
                disabled={isAdded || photos.length >= maxPhotos}
                className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                  isAdded
                    ? "bg-slate-100 border-slate-200 text-slate-400"
                    : "bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-100 shadow-2xs active:scale-95"
                }`}
              >
                <ImageIcon className="h-3 w-3 shrink-0" />
                <span>+ {preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
