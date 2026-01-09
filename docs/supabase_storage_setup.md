# Supabase Storage Setup for Avatar Uploads

## 1. Create Storage Bucket

In your Supabase dashboard:

1. Go to **Storage** section
2. Click **New bucket**
3. Create a bucket named: `avatars`
4. Set it as **Public bucket** (so images can be accessed via public URLs)
5. Enable **File size limit**: 5MB (or your preferred limit)
6. Enable **Allowed MIME types**: `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`

## 2. Set Up RLS Policies

For the `avatars` bucket, you need to set up Row Level Security policies:

### Policy 1: Allow authenticated users to upload
```sql
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 2: Allow public read access
```sql
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

### Policy 3: Allow users to update their own avatars
```sql
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 4: Allow users to delete their own avatars
```sql
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## 3. Database Migration

Run the SQL migration to add the `avatar_url` column:

```sql
-- See: docs/migrations/add_avatar_url_to_profiles.sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL;
```

## 4. Verify Setup

After setup, test the upload functionality:
- Users should be able to upload images up to 5MB
- Images should be accessible via public URLs
- Only the owner should be able to modify/delete their avatars
