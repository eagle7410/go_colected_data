#!/bin/bash

echo "--!!!For install need bower!!!--"
npm install -g bower
npm install
bower install --allow-root
npm install -g grunt-cli
echo "Complete!"
