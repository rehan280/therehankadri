$ErrorActionPreference = "Stop"

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$tempRoot = [System.IO.Path]::GetTempPath()
$stageId = Get-Date -Format "yyyyMMdd-HHmmss"
$stagePath = Join-Path $tempRoot "portfolio-cloudflare-workers-$stageId"
$stagePathFile = Join-Path $projectPath ".cf-stage-path"

if (-not $stagePath.StartsWith($tempRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  Write-Error "Refusing to use an unexpected staging path: $stagePath"
  exit 1
}

Write-Host "Staging project into $stagePath"

New-Item -ItemType Directory -Path $stagePath | Out-Null
Set-Content -LiteralPath $stagePathFile -Value $stagePath -NoNewline

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
