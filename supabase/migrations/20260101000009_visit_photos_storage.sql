-- Create visit-photos storage bucket (public, 10MB limit, images only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'visit-photos',
  'visit-photos',
  true,
  10485760,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/heic','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Upload: authenticated users can upload to their own folder
CREATE POLICY "Auth users upload own visit photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'visit-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Select: authenticated users can read their own photos
CREATE POLICY "Auth users read own visit photos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'visit-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Delete: authenticated users can delete their own photos
CREATE POLICY "Auth users delete own visit photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'visit-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
