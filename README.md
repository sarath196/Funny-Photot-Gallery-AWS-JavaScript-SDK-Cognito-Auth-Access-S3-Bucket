# Funny-Photot-Gallery-AWS-JavaScript-SDK-Cognito-Auth-Access-S3-Bucket
Simple Photo Gallery application using AWS JavaScript SDK for front-end, Cognito Identity for Authentication, S3 Service to store photos 

Demo webpage link: http://gallerywebhosting.s3-website-us-east-1.amazonaws.com/

Cognito JS SDK Authentication reference documentation:
https://aws.amazon.com/blogs/mobile/accessing-your-user-pools-using-the-amazon-cognito-identity-sdk-for-javascript/

AWS resource access from browser SDK reference documentation:
https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-browser.html

Figure 1:
![conito1](https://user-images.githubusercontent.com/24523505/82058936-0858c780-96e3-11ea-9c66-962b469b7cd8.PNG)

Figure 2:
![cognito2](https://user-images.githubusercontent.com/24523505/82059021-1f97b500-96e3-11ea-9d62-7f694ba988a5.PNG)

Figure 3:
![Cognito3](https://user-images.githubusercontent.com/24523505/82059100-33431b80-96e3-11ea-8771-4921d24c21d2.PNG)

Bucket Policy for mediagallerys3 s3 bucket:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "DelegateS3Access",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::<your account id>:root"
            },
            "Action": [
                "s3:ListBucket",
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::mediagallerys3/*",
                "arn:aws:s3:::mediagallerys3"
            ]
        }
    ]
}
```

CORS Configuration for mediagallerys3 bucket:
```
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
<CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>DELETE</AllowedMethod>
    <AllowedMethod>HEAD</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
</CORSRule>
</CORSConfiguration>
```
