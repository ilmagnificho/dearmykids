'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Cropper from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Loader2, Upload, X, Check } from 'lucide-react'
import getCroppedImg from './cropImage' // We need to create this helper

interface ImageUploadProps {
    onImageSelected: (blob: Blob) => void
}

export function ImageUpload({ onImageSelected }: ImageUploadProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
    const [processing, setProcessing] = useState(false)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0]
            const reader = new FileReader()
            reader.addEventListener('load', () => setImageSrc(reader.result as string))
            reader.readAsDataURL(file)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1,
        multiple: false
    })

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleCropSave = async () => {
        try {
            setProcessing(true)
            if (imageSrc && croppedAreaPixels) {
                const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
                onImageSelected(croppedImageBlob)
                // Ideally clear or show success state. For now, we keep it visible or let parent handle.
                setImageSrc(null) // Reset for demo or navigate away
            }
        } catch (e) {
            console.error(e)
        } finally {
            setProcessing(false)
        }
    }

    const handleCancel = () => {
        setImageSrc(null)
    }

    if (imageSrc) {
        return (
            <Card className="p-4 w-full max-w-md mx-auto bg-stone-50 border-stone-200 shadow-lg">
                <div className="relative w-full h-80 bg-gray-900 rounded-lg overflow-hidden mb-4">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1} // Square for profile/headshot
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Zoom</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={handleCancel}>
                            <X className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                        <Button className="flex-1 bg-slate-900 text-white hover:bg-slate-800" onClick={handleCropSave} disabled={processing}>
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Confirm</>}
                        </Button>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300 hover:bg-stone-50'
                }`}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-4 py-8">
                <div className="p-4 rounded-full bg-stone-100 text-stone-400">
                    <Upload className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-lg font-medium text-stone-700">Upload your child's photo</p>
                    <p className="text-sm text-stone-500 mt-1">Drag and drop or click to browse</p>
                    <p className="text-xs text-stone-400 mt-4">Supported formats: JPG, PNG</p>
                </div>
            </div>
        </Card>
    )
}
