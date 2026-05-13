@echo off
title Portfolio Deployer
echo Preparing to deploy to GitHub...
set PATH=E:\Program\Resume\node;%PATH%
git add .
git commit -m "Update portfolio content"
git push origin main
echo.
echo Changes pushed to GitHub! 
echo The website will automatically update in about 1 minute.
pause
