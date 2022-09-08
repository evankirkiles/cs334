#!/bin/bash

# 1. get into the git repository
cd ~/Desktop/cs334

# 2. get the IP address into the ip.md file
ifconfig > ~/Desktop/cs334/raspberrypi/ip.md

# 2. push to the git repository
git add -A
git commit -m "AUTO: Raspi IP address [$(date)]"
git push origin master

