'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronsLeftRight } from 'lucide-react'

interface ComparisonSliderProps {
    beforeImage: string
    afterImage: string
    aspectRatio?: string // e.g. "1/1", "3/4"
    beforeLabel?: string
    afterLabel?: string
}

export function ComparisonSlider({
    beforeImage,
    afterImage,
    aspectRatio = "1/1",
    beforeLabel = "Original",
    afterLabel = "AI Portrait"
}: ComparisonSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50)
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
        const percent = Math.max(0, Math.min((x / rect.width) * 100, 100))
        setSliderPosition(percent)
    }, [])

    const onMouseDown = () => setIsDragging(true)
    const onTouchStart = () => setIsDragging(true)

    const onMouseUp = () => setIsDragging(false)
    const onTouchEnd = () => setIsDragging(false)

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return
        handleMove(e.clientX)
    }

    const onTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return
        handleMove(e.touches[0].clientX)
    }

    useEffect(() => {
        const handleGlobalUp = () => setIsDragging(false)
        const handleGlobalMove = (e: MouseEvent) => {
            if (isDragging) handleMove(e.clientX)
        }

        window.addEventListener('mouseup', handleGlobalUp)
        window.addEventListener('mousemove', handleGlobalMove)

        return () => {
            window.removeEventListener('mouseup', handleGlobalUp)
            window.removeEventListener('mousemove', handleGlobalMove)
        }
    }, [isDragging, handleMove])

    return (
        <div
            ref={containerRef}
            className="relative w-full overflow-hidden rounded-xl shadow-xl cursor-col-resize select-none touch-none aspect-square" // Default square, can be overridden by style
            style={{ aspectRatio }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onMouseUp={onMouseUp}
            onTouchEnd={onTouchEnd}
            onMouseMove={onMouseMove}
            onTouchMove={onTouchMove}
        >
            {/* After Image (Background) */}
            <img
                src={afterImage}
                alt="After"
                className="absolute top-0 left-0 w-full h-full object-cover"
            />

            {/* Before Image (Clipped) */}
            <div
                className="absolute top-0 left-0 h-full w-full overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
            >
                <img
                    src={beforeImage}
                    alt="Before"
                    className="absolute top-0 left-0 w-full h-full object-cover max-w-none"
                    style={{ width: '100%', height: '100%' }} // Ensure it matches container despite clipping
                />
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize z-10"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-amber-500">
                    <ChevronsLeftRight className="w-5 h-5" />
                </div>
            </div>

            {/* Labels */}
            {beforeLabel && (
                <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                    {beforeLabel}
                </div>
            )}
            {afterLabel && (
                <div className="absolute top-4 right-4 bg-amber-500/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                    {afterLabel}
                </div>
            )}
        </div>
    )
}
