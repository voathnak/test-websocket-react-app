DOC_PATH="/Users/vlim/Research/poc/chatApp/documentations/api/reference/chatApp.yaml"
rm -rf api-gen/test
openapi-generator generate -i $DOC_PATH \
-g python \
-o api-gen/test \
--additional-properties=withSeparateModelsAndApi=true


#openapi-generator generate -i $DOC_PATH \
#-g python \
#-o api-gen/test \
#--additional-properties=withSeparateModelsAndApi=true,\
#apiPackage="api/",\
#modelPackage="model/"