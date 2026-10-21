# Servidor local para Cumpleaños Dominga N°1
$port = 8085
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Servidor del Cumpleaños corriendo en http://localhost:$port/" -ForegroundColor Green
Write-Host " Invitación:   http://localhost:$port/index.html" -ForegroundColor Yellow
Write-Host " Organizador:  http://localhost:$port/organizador.html" -ForegroundColor Magenta
Write-Host " Presiona Ctrl+C para detener el servidor." -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

# Abrir automáticamente en el navegador predeterminado
Start-Process "http://localhost:$port/index.html"

$mime = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png"  = "image/png"
    ".svg"  = "image/svg+xml"
    ".mp4"  = "video/mp4"
    ".webm" = "video/webm"
}

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $path = [System.Uri]::UnescapeDataString($request.Url.LocalPath)
    if ($path -eq "/" -or $path -eq "") { $path = "/index.html" }
    
    $filePath = Join-Path (Get-Location) ($path.TrimStart("/").Replace("/", "\"))
    
    if (Test-Path $filePath -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $contentType = $mime[$ext]
        if (-not $contentType) { $contentType = "application/octet-stream" }
        
        $response.ContentType = $contentType
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $response.StatusCode = 404
        $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $response.OutputStream.Write($notFound, 0, $notFound.Length)
    }
    $response.Close()
}