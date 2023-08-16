#!/usr/bin/env bash

# Script is for easy integration with crontab

cd $(dirname $0)/..
export PATH=$HOME/node/bin:$PATH
yarn send &> ./cron.log