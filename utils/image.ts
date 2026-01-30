export const resizeImage = (file: File | Blob, maxDimension = 1024, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target?.result as string
            img.onload = () => {
                let width = img.width
                let height = img.height

                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width)
                        width = maxDimension
                    } else {
                        width = Math.round((width * maxDimension) / height)
                        height = maxDimension
                    }
                }

                const canvas = document.createElement('canvas')
                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'))
                    return
                }

                ctx.drawImage(img, 0, 0, width, height)

                // Convert to base64 string (remove prefix)
                const dataUrl = canvas.toDataURL('image/jpeg', quality)
                const base64 = dataUrl.split(',')[1]
                resolve(base64)
            }
            img.onerror = (error) => reject(error)
        }
        reader.onerror = (error) => reject(error)
    })
}
