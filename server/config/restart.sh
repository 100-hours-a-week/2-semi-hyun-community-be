#!/bin/bash

echo "===== Restart Script Start ====="

# git pull
git pull origin

# npm install
npm install

# pm2 restart
pm2 restart all


echo "===== Restart Script End ====="