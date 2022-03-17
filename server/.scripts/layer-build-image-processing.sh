#!/bin/bash -x

set -e
#mkdir -p layer/core/python/
#cp -r utils layer/core/python/
cp image-processing-requirements.txt build-requirements.txt
rm -rf layer/image_processing_libs
docker build -t requests-lambda-layer/python_libs .
CONTAINER=$(docker run -d requests-lambda-layer/python_libs false)
docker cp $CONTAINER:/opt layer/image_processing_libs
docker rm $CONTAINER
touch layer/python_libs/.slsignore
cat > layer/python_libs/.slsignore << EOF
**/*.a
**/*.la
share/**
include/**
bin/**
EOF

