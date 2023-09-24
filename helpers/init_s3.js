const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");



//Initializing S3 object
const s3 = new S3Client({
        credentials:{
                accessKeyId: process.env.ACCESS_KEY,
                secretAccessKey:process.env.SECRET_ACCESS_KEY,
        },
        region: process.env.BUCKET_REGION
})


module.exports = s3