#!/bin/sh

sed 's/>=0.2.0/0.4.1/g' ./node_modules/grunt-jasmine-node/node_modules/jasmine-node/package.json > ./node_modules/grunt-jasmine-node/node_modules/jasmine-node/package.json;
