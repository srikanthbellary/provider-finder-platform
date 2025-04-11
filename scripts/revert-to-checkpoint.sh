#!/bin/bash
# Provider Finder Platform - Checkpoint Restore Script
# ----------------------------------------------------------
# This script reverts your working directory to the stable checkpoint v0.1

echo -e "\e[36mProvider Finder Platform - Revert to Checkpoint v0.1\e[0m"
echo -e "\e[36m--------------------------------------------------------\e[0m"
echo ""

# Check if there are unsaved changes
if [[ -n $(git status --porcelain) ]]; then
    echo -e "\e[33mWarning: You have unsaved changes in your working directory!\e[0m"
    echo -e "\e[33mThese changes will be lost when reverting to the checkpoint.\e[0m"
    echo ""
    
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "\e[32mRevert cancelled. Your changes are safe.\e[0m"
        exit 0
    fi
fi

# Revert to the checkpoint tag
echo -e "\e[36mReverting to checkpoint v0.1...\e[0m"
git checkout v0.1-checkpoint

# Switch to the main branch
echo -e "\e[36mSwitching to main branch...\e[0m"
git checkout main

echo ""
echo -e "\e[32mCheckpoint restore complete!\e[0m"
echo -e "\e[32mYou are now at the stable v0.1 checkpoint with working map service and Flutter integration.\e[0m"
echo ""
echo -e "\e[36mTo continue development, create a new feature branch:\e[0m"
echo -e "  git checkout -b feature/your-feature-name" 