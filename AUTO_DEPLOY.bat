@echo off
echo ========================================
echo AUTOMATIC DEPLOYMENT SCRIPT
echo ========================================
echo.

echo Step 1: Pushing to GitHub...
git add .
git commit -m "Ready for deployment"
git push
echo ✓ Code pushed to GitHub
echo.

echo ========================================
echo NEXT STEPS (Just click these links):
echo ========================================
echo.

echo 1. CREATE DATABASE TABLES
echo    Open: https://supabase.com/dashboard/project/wuysrqpstqfxzwdkhwwl/sql/new
echo    Copy SQL from: DEPLOY_NOW_SIMPLE.md
echo    Click Run
echo.

echo 2. DEPLOY BACKEND TO RENDER
echo    Click: https://render.com/deploy?repo=https://github.com/AkarshYash/IP-Project
echo    Or visit: https://dashboard.render.com/
echo.

echo 3. DEPLOY FRONTEND TO VERCEL  
echo    Click: https://vercel.com/new/clone?repository-url=https://github.com/AkarshYash/IP-Project/tree/main/react-frontend
echo    Or visit: https://vercel.com/new
echo.

echo ========================================
echo YOUR PROJECT: https://github.com/AkarshYash/IP-Project
echo ========================================
echo.

pause
start https://github.com/AkarshYash/IP-Project
start https://supabase.com/dashboard/project/wuysrqpstqfxzwdkhwwl
start https://render.com/
start https://vercel.com/
