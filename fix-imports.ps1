$rootPath = "c:\Users\Shree\Downloads\Website Sitemap UI_UX Mockup\components"

# Get all tsx files in components directory
$files = Get-ChildItem -Path $rootPath -Recurse -Filter "*.tsx"

foreach ($file in $files) {
    Write-Host "Processing $($file.Name)"
    $content = Get-Content $file.FullName -Raw
    
    # Remove version numbers from package imports
    $content = $content -replace '@[0-9]+\.[0-9]+\.[0-9]+', ''
    $content = $content -replace '@[0-9]+\.[0-9]+', ''
    
    # Fix component import paths
    $content = $content -replace '"@/components/utils"', '"@/components/ui/utils"'
    $content = $content -replace '"@/components/button"', '"@/components/ui/button"'
    $content = $content -replace '"@/components/dialog"', '"@/components/ui/dialog"'
    $content = $content -replace '"@/components/label"', '"@/components/ui/label"'
    $content = $content -replace '"@/components/use-mobile"', '"@/components/ui/use-mobile"'
    $content = $content -replace '"@/components/separator"', '"@/components/ui/separator"'
    $content = $content -replace '"@/components/sheet"', '"@/components/ui/sheet"'
    $content = $content -replace '"@/components/skeleton"', '"@/components/ui/skeleton"'
    $content = $content -replace '"@/components/tooltip"', '"@/components/ui/tooltip"'
    $content = $content -replace '"@/components/toggle"', '"@/components/ui/toggle"'
    $content = $content -replace '"@/components/input"', '"@/components/ui/input"'
    
    Set-Content $file.FullName $content
}

Write-Host "All files processed successfully!"
