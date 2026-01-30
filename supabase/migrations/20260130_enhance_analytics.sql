-- 20260130_enhance_analytics.sql
-- Add analytics columns to generated_images table

ALTER TABLE public.generated_images 
ADD COLUMN IF NOT EXISTS is_free_tier BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS format TEXT,
ADD COLUMN IF NOT EXISTS shot_type TEXT;

-- Optional: Add index for faster analytics
CREATE INDEX IF NOT EXISTS idx_generated_images_is_free ON generated_images(is_free_tier);
CREATE INDEX IF NOT EXISTS idx_generated_images_theme ON generated_images(theme);
