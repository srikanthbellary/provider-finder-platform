# Provider Finder Platform - Checkpoint Restore Script
# ----------------------------------------------------------
# This script reverts your working directory to the stable checkpoint v0.1

Write-Host "Provider Finder Platform - Revert to Checkpoint v0.1" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan
Write-Host ""

# Check if there are unsaved changes
$status = git status --porcelain
if ($status) {
    Write-Host "Warning: You have unsaved changes in your working directory!" -ForegroundColor Yellow
    Write-Host "These changes will be lost when reverting to the checkpoint." -ForegroundColor Yellow
    Write-Host ""
    
    $confirmation = Read-Host "Do you want to continue? (y/n)"
    if ($confirmation -ne 'y') {
        Write-Host "Revert cancelled. Your changes are safe." -ForegroundColor Green
        exit 0
    }
}

# Revert to the checkpoint tag
Write-Host "Reverting to checkpoint v0.1..." -ForegroundColor Cyan
git checkout v0.1-checkpoint

# Switch to the main branch
Write-Host "Switching to main branch..." -ForegroundColor Cyan
git checkout main

Write-Host ""
Write-Host "Checkpoint restore complete!" -ForegroundColor Green
Write-Host "You are now at the stable v0.1 checkpoint with working map service and Flutter integration." -ForegroundColor Green
Write-Host ""
Write-Host "To continue development, create a new feature branch:" -ForegroundColor Cyan
Write-Host "  git checkout -b feature/your-feature-name" -ForegroundColor White 