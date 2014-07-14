#!/bin/sh


cd ./node_modules/grunt-jasmine-node/node_modules/jasmine-node;
echo "changing jasmine-reporter version";
sed 's/>=0.2.0/0.4.1/g' package.json > tmp;
mv tmp package.json;
echo "updating package"
npm update;
cd -;
echo 'done';
