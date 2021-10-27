# Run these command from inside an EC2 Amazon Linux Lambda AMI or from the LambciDocker Container.
# If you run into any troubles due to this script, either email me at contato.carmando@gmail.com or over here on github.
# Please, do not open a case with AWS Premium Support about third party tutorials such as this one.
# In case you wish to run this as docker image, please launch it with
docker run -it --rm --entrypoint bash lambci/lambda:build-python3.7

# If you wish to use the EC2 Lambda AMI, use the link bellow to launch it
# https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html

#you may require to run the yum install as sudo
yum install -y yum-utils rpmdevtools wget
mkdir layer
wget https://downloads.wkhtmltopdf.org/0.12/0.12.5/wkhtmltox-0.12.5-1.centos7.x86_64.rpm
wget http://download-ib01.fedoraproject.org/pub/fedora/linux/releases/29/Everything/x86_64/os/Packages/l/libpng15-1.5.30-6.fc29.x86_64.rpm
rpmdev-extract *rpm
mv wkhtmltox*/usr/local/* layer/
mv libpng*/usr/lib64/* layer/lib/
rm -rf libpng* wkh*
cd layer/
rm -rf include share
rm -rf lib/libwkhtmltox.so lib/libwkhtmltox.so.0 lib/libwkhtmltox.so.0.12 lib/libpng15.so.15
mv lib/libwkhtmltox.so.0.12.5 lib/libwkhtmltox.so
mv lib/libpng15.so.15.30.0 lib/libpng15.so.15
zip -r9 ~/wkhtmltopdf.zip *

# Now either retrieve the file using scp(If using Amazon Linux AMI) or using docker cp (If using docker)
# The wkhmtltopdf.zip layer will be at /home/ec2-user if you are using Amazon Linux or /root/ if you are using docker.
# In case you compiled using any other Linux Distribution, the zip package will be at the home of the used user.
# You may need to upload this layer to s3 since it weights around 130~mbs and the limit upload size in layers is 50mb.