$dirs = @(
  'c:\Users\Marwan\Desktop\smartupfV2\frontend\src\pages\professor',
  'c:\Users\Marwan\Desktop\smartupfV2\frontend\src\pages\super-admin',
  'c:\Users\Marwan\Desktop\smartupfV2\frontend\src\components\admin'
)

foreach ($dir in $dirs) {
  Get-ChildItem "$dir\*.tsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $changed = $false

    # Hardcoded hex colors
    if ($content -match '#0A192F|#112240|#D33682|cyan-') {
      $content = $content -replace '#0A192F', 'upf-primary'
      $content = $content -replace '#112240', 'upf-primary'
      $content = $content -replace '#D33682', 'upf-accent'
      $content = $content -replace 'bg-\[upf-primary\]', 'bg-upf-primary'
      $content = $content -replace 'bg-\[upf-accent\]', 'bg-upf-accent'
      $content = $content -replace 'text-\[upf-primary\]', 'text-upf-primary'
      $content = $content -replace 'text-\[upf-accent\]', 'text-upf-accent'
      $content = $content -replace 'border-\[upf-primary\]', 'border-upf-primary'
      $content = $content -replace 'from-\[upf-primary\]', 'from-upf-primary'
      $content = $content -replace 'to-\[upf-primary\]', 'to-upf-primary'
      $content = $content -replace 'to-\[upf-accent\]', 'to-upf-accent'
      $content = $content -replace 'from-\[upf-accent\]', 'from-upf-accent'
      $content = $content -replace 'shadow-\[upf-primary\]', 'shadow-upf-primary'
      # cyan -> upf-primaryLight
      $content = $content -replace 'cyan-600', 'upf-primaryLight'
      $content = $content -replace 'cyan-500', 'upf-primaryLight'
      $content = $content -replace 'cyan-400', 'upf-primaryLight'
      $content = $content -replace 'cyan-300', 'upf-primaryLight'
      $content = $content -replace 'cyan-100', 'upf-primaryLight/20'
      $content = $content -replace 'cyan-50', 'upf-primaryLight/10'
      $changed = $true
    }

    if ($changed) {
      Set-Content $_.FullName $content
      Write-Host "Fixed: $($_.Name)"
    }
  }
}
Write-Host "Done."
