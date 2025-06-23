# Build script for the devices backend Docker image (PowerShell)

param(
    [string]$Tag = "latest"
)

Write-Host "Building devices backend Docker image..." -ForegroundColor Yellow

# Get the current directory (should be the project root)
$ProjectRoot = Split-Path -Parent $PSScriptRoot

# Build the image
docker build `
    -f "$ProjectRoot\apps\backend\devices\Dockerfile" `
    -t "iot-sphere-devices:$Tag" `
    $ProjectRoot

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Devices backend Docker image built successfully!" -ForegroundColor Green
    Write-Host "Image: iot-sphere-devices:$Tag" -ForegroundColor Yellow
} else {
    Write-Host "❌ Failed to build Docker image" -ForegroundColor Red
    exit 1
} 