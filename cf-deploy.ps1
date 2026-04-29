$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$stagePath = Join-Path ([System.IO.Path]::GetTempPath()) "portfolio-cloudflare-workers"

& (Join-Path $scriptDir "cf-build.ps1")
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Set-Location $stagePath
Write-Host "Deploying to Cloudflare Workers"
npx opennextjs-cloudflare deploy
exit $LASTEXITCODE
