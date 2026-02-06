"use client"

import React, { useState, useCallback } from 'react'
import Cropper, { Point, Area } from 'react-easy-crop'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Crop } from 'lucide-react'
import getCroppedImg from '@/lib/utils/cropImage'

interface CropModalProps {
  image: string
  onCropComplete: (croppedImage: File) => void
  onCancel: () => void
  aspect?: number
}

const ASPECT_RATIOS = [
  { label: 'Original', value: undefined },
  { label: '1:1', value: 1 / 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
]

const CropModal: React.FC<CropModalProps> = ({ 
  image, 
  onCropComplete, 
  onCancel,
  aspect: initialAspect = 4 / 3
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspect, setAspect] = useState<number | undefined>(initialAspect)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropChange = (crop: Point) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom: number) => {
    setZoom(zoom)
  }

  const onCropCompleteInternal = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const [isCropping, setIsCropping] = useState(false)

  const handleCrop = async () => {
    if (croppedAreaPixels) {
      setIsCropping(true)
      try {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels)
        if (croppedImage) {
          onCropComplete(croppedImage)
        }
      } catch (error) {
        console.error('Failed to crop image:', error)
      } finally {
        setIsCropping(false)
      }
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-2xl h-[85vh] flex flex-col relative overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 text-primary">
                <Crop className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Crop Image</h2>
            </div>
            <button onClick={onCancel} className="text-muted-foreground hover:text-red-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Ratio Selector */}
          <div className="flex items-center gap-2 p-4 bg-muted/10 border-b border-border overflow-x-auto no-scrollbar">
            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mr-2 shrink-0">Ratio</span>
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.label}
                onClick={() => setAspect(ratio.value)}
                className={`px-4 py-2 text-[8px] font-bold uppercase tracking-widest transition-all shrink-0 ${
                  aspect === ratio.value 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-white border border-border text-muted-foreground hover:border-accent hover:text-accent'
                }`}
              >
                {ratio.label}
              </button>
            ))}
          </div>

          {/* Cropper area */}
          <div className="flex-grow relative bg-muted/20">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteInternal}
              onZoomChange={onZoomChange}
            />
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-white space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-12">Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-grow h-1 bg-muted rounded-full appearance-none accent-primary cursor-pointer"
              />
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={onCancel}
                className="flex-1 py-4 border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCrop}
                disabled={isCropping}
                className="flex-1 py-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isCropping ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" 
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Save Crop
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default CropModal
