# 🧪 Testing Guide: Local File Download Fix

## Prerequisites

✅ Services running:
- Student Portal (http://localhost:3009)
- Auth Service API (http://localhost:3008)
- PostgreSQL database

## Test Case 1: Download Local File

### Setup
1. Create a test PDF file on your local system:
   - Path: `C:\Users\youbitech\Downloads\test-resource.pdf`
   - Or any existing file on your machine

2. Create a resource in the database with a local file path:
   ```sql
   INSERT INTO resources (
     resource_id, 
     title, 
     description, 
     resource_type, 
     subject_id, 
     file_path, 
     created_at
   ) VALUES (
     'RES_LOCAL_001',
     'Local Test Document',
     'Testing local file downloads',
     'pdf',
     'SCI001',
     'C:/Users/youbitech/Downloads/test-resource.pdf',
     NOW()
   );
   ```

### Test Steps
1. Open Student Portal: http://localhost:3009
2. Navigate to Resources section
3. Find the "Local Test Document" resource
4. Click the "Download" button
5. Verify the file downloads successfully

### Expected Result
✅ File should download with the correct filename
✅ No HTML error pages
✅ Browser console should show: `📄 Téléchargement du fichier via API:`

---

## Test Case 2: Download External URL Resource

### Setup
1. Create a resource with an external URL:
   ```sql
   INSERT INTO resources (
     resource_id, 
     title, 
     description, 
     resource_type, 
     subject_id, 
     external_url, 
     created_at
   ) VALUES (
     'RES_EXT_001',
     'External Tutorial',
     'Link to external resource',
     'link',
     'SCI001',
     'https://example.com/tutorial.pdf',
     NOW()
   );
   ```

### Test Steps
1. Open Student Portal: http://localhost:3009
2. Navigate to Resources section
3. Find the "External Tutorial" resource
4. Click the resource to open it
5. Verify it opens in a new tab

### Expected Result
✅ External link opens in new tab
✅ Correct URL in address bar

---

## Test Case 3: File Not Found Error

### Setup
1. Create a resource with a non-existent file path:
   ```sql
   INSERT INTO resources (
     resource_id, 
     title, 
     description, 
     resource_type, 
     subject_id, 
     file_path, 
     created_at
   ) VALUES (
     'RES_MISSING_001',
     'Missing File Test',
     'Testing 404 errors',
     'pdf',
     'SCI001',
     'C:/Users/youbitech/Downloads/nonexistent-file.pdf',
     NOW()
   );
   ```

### Test Steps
1. Open Student Portal: http://localhost:3009
2. Navigate to Resources section
3. Find the "Missing File Test" resource
4. Click the "Download" button
5. Check browser console for error

### Expected Result
✅ Download fails gracefully
✅ Console shows error message: `404` or `Fichier non trouvé`
✅ No HTML error page is returned

---

## Test Case 4: Resource with No File

### Setup
1. Create a resource with no file or URL:
   ```sql
   INSERT INTO resources (
     resource_id, 
     title, 
     description, 
     resource_type, 
     subject_id, 
     created_at
   ) VALUES (
     'RES_NOFILE_001',
     'Text Only Resource',
     'This resource has only description',
     'link',
     'SCI001',
     NOW()
   );
   ```

### Test Steps
1. Open Student Portal: http://localhost:3009
2. Navigate to Resources section
3. Find the "Text Only Resource" resource
4. Click the "Download" button (if available)

### Expected Result
✅ Appropriate error message appears
✅ User can still view the resource description

---

## Test Case 5: Mark as Viewed

### Setup
Use any existing resource

### Test Steps
1. Open Student Portal: http://localhost:3009
2. Download a resource
3. Refresh the page
4. Check if the resource shows as "viewed"

### Expected Result
✅ Resource is marked as viewed after download
✅ Visual indicator shows it's been accessed

---

## API Endpoint Testing

### Test Download Endpoint Directly

**Using cURL:**
```bash
# Get a resource ID first
curl http://localhost:3008/resources

# Download the file
curl -O http://localhost:3008/resources/RES_LOCAL_001/download
```

**Using Postman:**
1. Create GET request to: `http://localhost:3008/resources/RES_LOCAL_001/download`
2. Click "Send"
3. Check "Preview" tab for file content

**Expected Response:**
```
Status: 200 OK
Headers:
  Content-Disposition: attachment; filename="Local Test Document"
  Content-Type: application/octet-stream
Body: [Binary file content]
```

---

## Browser Console Logging

### Expected Console Messages

✅ **Local File Download:**
```
📄 Téléchargement du fichier via API: C:/Users/youbitech/Downloads/test-resource.pdf
```

✅ **External Link:**
```
📥 Téléchargement initié: External Tutorial
```

✅ **Error:**
```
❌ Erreur lors du téléchargement: 404 Fichier non trouvé
```

---

## Troubleshooting

### Issue: "File not found" error

**Solution:**
1. Verify file path is correct
2. Ensure file exists at the location
3. Check file permissions
4. Use forward slashes `/` in paths (e.g., `C:/Users/.../file.pdf`)

### Issue: Download doesn't trigger

**Solution:**
1. Check browser console for errors
2. Verify API is running on port 3008
3. Check CORS settings in browser
4. Try in different browser

### Issue: HTML error page instead of file

**Solution:**
This is now fixed! The new endpoint handles local files properly.

---

## Performance Testing

### Load Test: Multiple Downloads

```bash
# Test 10 concurrent downloads
for i in {1..10}; do
  curl -O http://localhost:3008/resources/RES_LOCAL_001/download &
done
wait
```

**Expected:** All downloads succeed without API overload

---

## Security Testing

### Test 1: File Traversal Prevention

Try to access files outside intended directory:
```bash
curl http://localhost:3008/resources/RES_001/download?path=../../../../etc/passwd
```

**Expected:** 404 or access denied (API should validate resource exists in DB)

### Test 2: Missing File Validation

Try downloading a non-existent resource:
```bash
curl http://localhost:3008/resources/RES_FAKE_001/download
```

**Expected:** 404 error

---

## Integration Testing

### Full User Flow

1. ✅ Teacher creates resource with local file path
2. ✅ Student opens portal
3. ✅ Student sees resource in their subject
4. ✅ Student clicks download
5. ✅ File downloads successfully
6. ✅ Resource marked as viewed
7. ✅ Teacher sees viewing statistics

---

## Regression Testing

### Verify Existing Features Still Work

- [ ] Create new resource
- [ ] Edit resource metadata
- [ ] Delete resource
- [ ] Search resources
- [ ] Filter by type
- [ ] Filter by difficulty
- [ ] Filter by subject
- [ ] View resource details

---

## Success Criteria

✅ All test cases pass
✅ No console errors
✅ Files download with correct names
✅ API responds with proper status codes
✅ Error handling is graceful
✅ Performance is acceptable
✅ No regressions in other features

---

## Cleanup

After testing, remember to:
1. Delete test resources from database
2. Remove test files from file system
3. Reset database if needed

```sql
DELETE FROM resources WHERE resource_id LIKE 'RES_%_001';
```

---

**Last Updated**: 2024-01-XX
**Status**: Ready for Testing ✅
