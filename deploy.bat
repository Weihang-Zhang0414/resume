@echo off
title Portfolio Deployer
echo Preparing to deploy to GitHub...
set PATH=%~dp0node;%PATH%
git add .
git diff --cached --quiet
if errorlevel 1 (
    git commit -m "Update portfolio content"
    if errorlevel 1 (
        echo.
        echo [ERROR] Git commit failed. Please check git user.name and user.email.
        pause
        exit /b 1
    )
) else (
    echo No new changes to commit, checking push...
)
git push origin main
if errorlevel 1 (
    echo.
    echo [ERROR] Git push failed. Please check your GitHub login or network connection.
    pause
    exit /b 1
)
echo.
echo Changes pushed to GitHub!
echo The website will automatically update in about 1 minute.
pause
