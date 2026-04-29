$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$stagePathFile = Join-Path $scriptDir ".cf-stage-path"

& (Join-Path $scriptDir "cf-build.ps1")
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

if (-not (Test-Path $stagePathFile)) {
  Write-Error "Missing Cloudflare stage path file: $stagePathFile"
  exit 1
}

$stagePath = Get-Content -LiteralPath $stagePathFile -Raw
Set-Location $stagePath
Write-Host "Starting Wrangler preview"
npx wrangler dev
exit $LASTEXITCODE
