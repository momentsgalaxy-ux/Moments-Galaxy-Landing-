<#
.SYNOPSIS
    Moments Galaxy - Zero-Dependency Local Web Server
    Runs a lightweight HTTP server in Windows PowerShell without Node.js or Python.
.DESCRIPTION
    Serves HTML, CSS, JS, SVG, MP4, MP3 with appropriate MIME types.
#>

$port = 8085
$prefix = "http://localhost:$port/"
$basePath = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Error "Failed to start listener on $prefix. Error: $_"
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "  MOMENTS GALAXY - LUXURY LANDING PAGE & ADMIN PANEL" -ForegroundColor DarkYellow
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "  Server is running at: $prefix" -ForegroundColor Green
Write-Host "  Landing Page: $prefix" -ForegroundColor Cyan
Write-Host "  Admin Panel:  $($prefix)admin.html" -ForegroundColor Magenta
Write-Host "  Default Admin PIN: admin123" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server.`n"

# Launch default browser
Start-Process $prefix

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".webp" = "image/webp"
    ".mp3"  = "audio/mpeg"
    ".wav"  = "audio/wav"
    ".mp4"  = "video/mp4"
    ".webm" = "video/webm"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/" -or $urlPath -eq "") {
            $urlPath = "/index.html"
        }

        $localFilePath = Join-Path $basePath ($urlPath.TrimStart('/').Replace('/', '\'))

        if (Test-Path $localFilePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localFilePath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }

            $bytes = [System.IO.File]::ReadAllBytes($localFilePath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    } catch {
        # Catch aborts or client disconnects
    }
}
