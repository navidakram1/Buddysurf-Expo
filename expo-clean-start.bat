@echo off

echo Installing all dependencies...
npm install

echo Killing any running node or Expo processes...
taskkill /F /IM node.exe /T
taskkill /F /IM expo.exe /T

echo.
echo Clearing Expo/Metro cache and starting Expo...
npx expo start -c

pause 