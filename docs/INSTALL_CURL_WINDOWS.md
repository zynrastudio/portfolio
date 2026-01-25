# Installing curl on Windows

Windows 10/11 includes a `curl` command, but it's actually an alias for PowerShell's `Invoke-WebRequest`, which has limitations. Here are several ways to install the real curl utility.

## Option 1: Using Chocolatey (Recommended - Easiest)

If you have Chocolatey package manager installed:

```powershell
choco install curl
```

**If you don't have Chocolatey**, install it first:
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

Then install curl:
```powershell
choco install curl
```

---

## Option 2: Using Scoop

If you have Scoop package manager:

```powershell
scoop install curl
```

**If you don't have Scoop**, install it first:
```powershell
# Run PowerShell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

Then install curl:
```powershell
scoop install curl
```

---

## Option 3: Using Winget (Windows 10/11 Built-in)

Windows 10/11 includes winget package manager:

```powershell
winget install curl.curl
```

---

## Option 4: Manual Installation

1. **Download curl**:
   - Visit: https://curl.se/windows/
   - Download the latest version (choose the appropriate architecture: x64 or x86)
   - Or use direct link: https://curl.se/windows/dl-8.6.0_1/curl-8.6.0_1-win64-mingw.zip

2. **Extract the zip file**:
   - Extract to a folder like `C:\curl`

3. **Add to PATH**:
   - Open "Environment Variables" (search in Start menu)
   - Under "System variables", find "Path" and click "Edit"
   - Click "New" and add: `C:\curl\bin` (or wherever you extracted curl)
   - Click "OK" on all dialogs

4. **Restart PowerShell/Terminal**:
   - Close and reopen your terminal
   - Test with: `curl --version`

---

## Option 5: Using Git Bash (If you have Git installed)

If you have Git for Windows installed, Git Bash includes curl:

1. Open Git Bash (search "Git Bash" in Start menu)
2. Use curl directly:
   ```bash
   curl https://zynra.studio/api/poll/notion
   ```

---

## Verify Installation

After installation, verify curl works:

```powershell
# Check version
curl --version

# Test with a simple request
curl https://httpbin.org/get
```

**Expected output:**
```
curl 8.6.0 (Windows) libcurl/8.6.0
...
```

---

## Using curl After Installation

Once installed, you can use curl commands:

```bash
# Test polling service
curl https://zynra.studio/api/poll/notion

# Test webhook
curl -X POST https://hook.eu1.make.com/pdeb0nh0r9hzve2cscxsdzmwqf76p3sa \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-page-id",
    "database_id": "91ba6dd0506a49e4b7f7706db990d872",
    "status": "Qualified",
    "url": "https://notion.so/test",
    "triggered_at": "2026-01-25T12:00:00.000Z",
    "properties": {}
  }'
```

**Note**: In PowerShell, you may need to use backticks (`) for line continuation:
```powershell
curl -X POST https://hook.eu1.make.com/pdeb0nh0r9hzve2cscxsdzmwqf76p3sa `
  -H "Content-Type: application/json" `
  -d '{\"id\":\"test\",\"status\":\"Qualified\"}'
```

---

## Alternative: Use PowerShell (No Installation Needed)

If you prefer not to install curl, you can use PowerShell's `Invoke-RestMethod` which works well:

```powershell
# Test polling service
Invoke-RestMethod -Uri https://zynra.studio/api/poll/notion

# Test webhook
$body = @{
    id = "test-page-id"
    database_id = "91ba6dd0506a49e4b7f7706db990d872"
    status = "Qualified"
    url = "https://notion.so/test"
    triggered_at = "2026-01-25T12:00:00.000Z"
    properties = @{}
} | ConvertTo-Json

Invoke-RestMethod -Uri https://hook.eu1.make.com/pdeb0nh0r9hzve2cscxsdzmwqf76p3sa `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

---

## Recommended Method

**For most users**: Use **Option 3 (winget)** - it's built into Windows 10/11 and requires no additional setup:

```powershell
winget install curl.curl
```

Then restart your terminal and test:
```bash
curl --version
```

---

## Troubleshooting

### Issue: "curl is not recognized"
- **Solution**: Restart your terminal/PowerShell after installation
- If still not working, verify PATH environment variable includes curl's bin directory

### Issue: Still using PowerShell alias
- **Solution**: Use full path: `C:\curl\bin\curl.exe` (or wherever you installed it)
- Or use `curl.exe` instead of `curl` to force the executable

### Issue: Installation fails
- **Solution**: Try a different method (winget, chocolatey, or manual installation)
- Make sure you're running PowerShell as Administrator if required
