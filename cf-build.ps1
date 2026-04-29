$ErrorActionPreference = "Stop"

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$tempRoot = [System.IO.Path]::GetTempPath()
$stagePath = Join-Path $tempRoot "portfolio-cloudflare-workers"

if (-not $stagePath.StartsWith($tempRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  Write-Error "Refusing to use an unexpected staging path: $stagePath"
  exit 1
}

Write-Host "Staging project into $stagePath"

if (Test-Path $stagePath) {
  Remove-Item -LiteralPath $stagePath -Recurse -Force
}

New-Item -ItemType Directory -Path $stagePath | Out-Null

robocopy $projectPath $stagePath /MIR /XD .git .next .open-next .vercel /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -gt 7) {
  Write-Error "robocopy failed with exit code $LASTEXITCODE."
  exit 1
}

Set-Location $stagePath
Write-Host "Running OpenNext Cloudflare build from $stagePath"

npx opennextjs-cloudflare build
if ($LASTEXITCODE -ne 0) {
  Write-Error "opennextjs-cloudflare build failed."
  exit 1
}

Write-Host "Cloudflare build complete."
