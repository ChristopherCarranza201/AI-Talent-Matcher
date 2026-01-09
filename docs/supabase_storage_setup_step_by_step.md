# Step-by-Step Guide: Creating Supabase Storage Bucket for Avatars

## Step 1: Access Supabase Dashboard

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Log in to your account
3. Select your project (AI-Talent-Matcher or your project name)

## Step 2: Navigate to Storage

1. In the left sidebar, click on **"Storage"** (it has a folder icon)
2. You should see a page with "Buckets" section

## Step 3: Create New Bucket

1. Click the **"New bucket"** button (usually in the top right)
2. A modal/dialog will appear

## Step 4: Configure Bucket Settings

Fill in the following information:

### Basic Settings:
- **Name**: `avatars` (must be exactly this name, lowercase)
- **Public bucket**: ✅ **Check this box** (this makes images accessible via public URLs)
- **File size limit**: `5242880` bytes (5MB) or select "5 MB" from dropdown if available
- **Allowed MIME types**: 
  - Click "Add MIME type" or enter manually:
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/gif`
  - `image/webp`

### Advanced Settings (if available):
- Leave other settings as default

## Step 5: Create the Bucket

1. Click **"Create bucket"** or **"Save"** button
2. Wait for confirmation that the bucket was created
3. You should now see `avatars` in your buckets list

## Step 6: Set Up Row Level Security (RLS) Policies

After creating the bucket, you need to set up security policies:

### Option A: Using Supabase Dashboard (Recommended)

1. Click on the `avatars` bucket you just created
2. Go to the **"Policies"** tab
3. Click **"New Policy"** or **"Add Policy"**

#### Policy 1: Allow authenticated users to upload
- **Policy name**: `Users can upload their own avatars`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**: 
```sql
(bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
```

#### Policy 2: Allow public read access
- **Policy name**: `Public can view avatars`
- **Allowed operation**: `SELECT`
- **Target roles**: `public`
- **Policy definition**:
```sql
(bucket_id = 'avatars')
```

#### Policy 3: Allow users to update their own avatars
- **Policy name**: `Users can update their own avatars`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
```

#### Policy 4: Allow users to delete their own avatars
- **Policy name**: `Users can delete their own avatars`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
```

### Option B: Using SQL Editor

1. Go to **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Paste the following SQL:

```sql
-- Policy 1: Allow authenticated users to upload
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow public read access
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy 3: Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

4. Click **"Run"** to execute the SQL

## Step 7: Verify Bucket Creation

1. Go back to **Storage** → **Buckets**
2. You should see `avatars` listed
3. Click on it to verify settings:
   - ✅ Public bucket: Yes
   - ✅ File size limit: 5MB
   - ✅ MIME types: image/jpeg, image/jpg, image/png, image/gif, image/webp

## Step 8: Test the Upload

After creating the bucket and policies:

1. Go to your application
2. Navigate to Settings (Recruiter or Candidate)
3. Try uploading a profile picture
4. It should work without the 404 error

## Troubleshooting

### If you still get "bucket not found":
- Double-check the bucket name is exactly `avatars` (lowercase, no spaces)
- Make sure you're using the correct Supabase project
- Verify the bucket appears in the Storage dashboard

### If you get permission errors:
- Make sure all 4 RLS policies are created
- Verify policies are enabled (not disabled)
- Check that the user is authenticated

### If upload works but image doesn't display:
- Verify the bucket is set as **Public**
- Check that the public read policy is active
- Verify the URL format in the response
