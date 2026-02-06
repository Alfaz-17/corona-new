"use client"

import { useState, useRef } from "react"
import { Cropper, ReactCropperElement } from "react-cropper"
import "cropperjs/dist/cropper.css"
import { X, Check, RotateCcw } from "lucide-react"

interface ImageCropperModalProps {
  image: string // Data URL or URL
  onCrop: (croppedImage: Blob) => void
  onClose: () => void
  aspectRatio?: number
}

export function ImageCropperModal({ 
  image, 
  onCrop, 
  onClose, 
  aspectRatio = 1 // Default to square
}: ImageCropperModalProps) {
  const cropperRef = useRef<ReactCropperElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper
    if (cropper) {
      setIsProcessing(true)
      // Get cropped canvas
      cropper.getCroppedCanvas({
        maxWidth: 2048,
        maxHeight: 2048,
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      }).toBlob((blob: Blob | null) => {
        if (blob) {
          onCrop(blob)
        }
        setIsProcessing(false)
      }, 'image/jpeg', 0.9)
    }
  }

  const handleReset = () => {
    cropperRef.current?.cropper.reset()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0E2A47]/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#0E2A47]/10">
          <h3 className="font-serif text-xl text-[#0E2A47]">Adjust Image</h3>
          <button 
            onClick={onClose}
            className="p-2 text-[#0E2A47]/50 hover:text-[#0E2A47] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative bg-[#F7F7F5] flex-1 min-h-[400px]">
          <Cropper
            src={image}
            style={{ height: 500, width: "100%" }}
            initialAspectRatio={aspectRatio}
            aspectRatio={aspectRatio}
            guides={true}
            ref={cropperRef}
            viewMode={1}
            background={false}
            responsive={true}
            autoCropArea={1}
            checkOrientation={false}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#0E2A47]/10 bg-white">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-[#0E2A47]/60 text-xs uppercase tracking-wider hover:text-[#0E2A47] transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-[#0E2A47]/60 text-xs uppercase tracking-wider hover:bg-[#F7F7F5] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCrop}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-[#0E2A47] text-white px-8 py-2.5 text-xs uppercase tracking-wider font-medium hover:bg-[#1a3d5c] transition-colors disabled:opacity-50 shadow-lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin h-3 w-3 border-2 border-white/30 border-t-white rounded-full" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Apply Crop
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
