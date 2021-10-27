# Python
rm -rf layer/core/
mkdir -p layer/core/python
cp -r snail layer/core/python
cp -r utils layer/core/python
[[ ! -d layer/python_libs ]] && sh .scripts/layer-build.sh

# NodeJS

rm -rf core/
mkdir -p core/nodejs/node_modules

rm -rf dependencies/nodejs
mkdir -p dependencies/nodejs

#rm -rf node_modules/models
#cp -r models node_modules
#
#rm -rf node_modules/utils
#cp -r utils node_modules
#
#rm -rf node_modules/constants
#cp -r constants node_modules

yarn install --production  --modules-folder dependencies/nodejs/node_modules
#cp -r models core/nodejs/node_modules
cp -r utils core/nodejs/node_modules
#cp -r constants core/nodejs/node_modules
