# 🧪 Testing Guide - Lost & Found Tracker

## API Endpoint Testing

### Prerequisites
- Server running: `npm run dev`
- Vercel KV configured with valid credentials

---

## 1️⃣ Test POST /api/items

### PowerShell Test

```powershell
# Create a test item
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    itemName = "Black Backpack"
    description = "Found in the cafeteria near table 5. Contains textbooks."
    imageUrl = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62"
    latitude = 40.7128
    longitude = -74.0060
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/items" -Method POST -Headers $headers -Body $body
$response | ConvertTo-Json -Depth 10
```

### cURL Test (Git Bash)

```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "itemName": "Blue Water Bottle",
    "description": "Found at the gym",
    "imageUrl": "https://images.unsplash.com/photo-1602143407151-7111542de6e8",
    "latitude": 40.7580,
    "longitude": -73.9855
  }'
```

### Expected Response (201 Created)

```json
{
  "message": "Item created successfully",
  "item": {
    "id": "1732445123456-abc123xyz",
    "itemName": "Black Backpack",
    "description": "Found in the cafeteria near table 5. Contains textbooks.",
    "imageUrl": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "createdAt": "2025-11-24T11:25:23.456Z"
  }
}
```

---

## 2️⃣ Test GET /api/items

### PowerShell Test

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/items" -Method GET
$response | ConvertTo-Json -Depth 10
```

### cURL Test

```bash
curl http://localhost:3000/api/items
```

### Expected Response (200 OK)

```json
{
  "items": [
    {
      "id": "1732445123456-abc123xyz",
      "itemName": "Black Backpack",
      "description": "Found in the cafeteria near table 5. Contains textbooks.",
      "imageUrl": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "createdAt": "2025-11-24T11:25:23.456Z"
    }
  ]
}
```

---

## 3️⃣ Test DELETE /api/items/[id]

### PowerShell Test

```powershell
# Replace with actual item ID from GET response
$itemId = "1732445123456-abc123xyz"
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/items/$itemId" -Method DELETE
$response | ConvertTo-Json
```

### cURL Test

```bash
# Replace with actual item ID
curl -X DELETE http://localhost:3000/api/items/1732445123456-abc123xyz
```

### Expected Response (200 OK)

```json
{
  "message": "Item deleted successfully"
}
```

---

## 4️⃣ Validation Testing

### Test: Missing Required Fields

```powershell
$body = @{
    itemName = ""
    description = "Test"
    latitude = 40.7128
    longitude = -74.0060
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/items" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
```

**Expected**: 400 Bad Request with error message

### Test: Invalid Coordinates

```powershell
$body = @{
    itemName = "Test Item"
    description = "Test description"
    latitude = 999  # Invalid
    longitude = -74.0060
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/items" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
```

**Expected**: 400 Bad Request - "Latitude must be between -90 and 90"

### Test: Invalid Image URL

```powershell
$body = @{
    itemName = "Test Item"
    description = "Test description"
    imageUrl = "not-a-url"
    latitude = 40.7128
    longitude = -74.0060
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/items" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
```

**Expected**: 400 Bad Request - "Invalid URL format"

### Test: HTML Injection (Security)

```powershell
$body = @{
    itemName = "<script>alert('xss')</script>Wallet"
    description = "<b>Bold text</b> description"
    latitude = 40.7128
    longitude = -74.0060
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/items" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
$response.item.itemName  # Should NOT contain HTML tags
```

**Expected**: HTML tags stripped, safe text stored

---

## 5️⃣ Browser Testing

### Test Geolocation

1. Open http://localhost:3000
2. Browser should prompt for location permission
3. Allow location access
4. Verify latitude/longitude appears on page

### Test Form Submission

1. Fill in form:
   - Item Name: "Lost Keys"
   - Description: "Set of keys with blue keychain"
   - Image URL: https://images.unsplash.com/photo-1582139329536-e7284fece509
2. Click Submit
3. Verify success message appears
4. Check dashboard for the new item

### Test Dashboard

1. Navigate to http://localhost:3000/dashboard
2. Verify items are displayed
3. Click on Google Maps link - should open correct location
4. Click Delete button
5. Confirm deletion
6. Verify item is removed from list

---

## 6️⃣ Production Testing (Vercel)

### Test Production API

```powershell
# Replace with your Vercel URL
$productionUrl = "https://your-project.vercel.app"

# Test GET
Invoke-RestMethod -Uri "$productionUrl/api/items" -Method GET

# Test POST
$body = @{
    itemName = "Production Test Item"
    description = "Testing production deployment"
    latitude = 40.7128
    longitude = -74.0060
} | ConvertTo-Json

Invoke-RestMethod -Uri "$productionUrl/api/items" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
```

### Verify HTTPS

- All requests should use `https://`
- Geolocation should work (requires HTTPS)
- No mixed content warnings

---

## 7️⃣ Performance Testing

### Load Test (Simple)

```powershell
# Submit 10 items rapidly
1..10 | ForEach-Object {
    $body = @{
        itemName = "Test Item $_"
        description = "Load test item number $_"
        latitude = 40.7128
        longitude = -74.0060
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:3000/api/items" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
    Write-Host "Submitted item $_"
}
```

### Verify All Items Retrieved

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/items" -Method GET
$response.items.Count  # Should be 10 (or more)
```

---

## 8️⃣ Error Handling Testing

### Test Non-Existent Item Delete

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/items/nonexistent-id" -Method DELETE
```

**Expected**: 404 Not Found - "Item not found"

### Test Malformed JSON

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/items" -Method POST -Headers @{"Content-Type"="application/json"} -Body "invalid json"
```

**Expected**: 400/500 error with appropriate message

---

## ✅ Test Checklist

- [ ] POST creates new items successfully
- [ ] GET retrieves all items
- [ ] DELETE removes items
- [ ] Validation rejects invalid input
- [ ] HTML is stripped from user input
- [ ] Geolocation works in browser
- [ ] Form submission works
- [ ] Dashboard displays items
- [ ] Dashboard delete function works
- [ ] Google Maps links are correct
- [ ] Image URLs display correctly
- [ ] Image error handling works (broken URLs)
- [ ] Production deployment works
- [ ] HTTPS is enforced in production
- [ ] API handles errors gracefully

---

## 🐛 Debugging Tips

### Check Vercel KV Connection

```powershell
# Verify environment variables are loaded
$env:KV_REST_API_URL
$env:KV_REST_API_TOKEN
```

### View Next.js Logs

In the terminal where `npm run dev` is running, watch for:
- API route hits
- Error messages
- KV operation logs

### Check Browser Console

Open DevTools (F12) and check:
- Network tab for API calls
- Console for JavaScript errors
- Application tab for location permissions

---

## 📊 Expected Behavior Summary

| Test | Expected Result |
|------|----------------|
| POST valid item | 201 Created |
| POST invalid item | 400 Bad Request |
| GET items | 200 OK with array |
| DELETE existing item | 200 OK |
| DELETE non-existent | 404 Not Found |
| HTML in input | Stripped and sanitized |
| Invalid coordinates | 400 Bad Request |
| Missing required fields | 400 Bad Request |

---

**All tests passing?** You're ready for production! 🚀
