#!/bin/bash

# 1. get into the git repository
cd ~/Desktop/cs334
git pull origin master

# 2. get the IP address into the ip.md file
hostname -I >~/Desktop/cs334/misc/raspberrypi/ip.md

# 2. push to the git repository
git add -A
git commit -m "AUTO: Raspi IP address [$(date)]"
git push origin master
