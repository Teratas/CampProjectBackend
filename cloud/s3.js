const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const region = process.env.BUCKET_REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const sessionToken = process.env.SESSION_TOKEN;
const bucketName = process.env.BUCKET_NAME;
const client = new S3Client({
  region,
  credentials : {
    accessKeyId,
    secretAccessKey,
    sessionToken,
  }
});

exports.uploadFile = async (fileBuffer, fileName, mimetype) => {
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentTypes: mimetype,
    }
    const command = new PutObjectCommand(params)
    return client.send(command)
}

exports.createSignedUrl = async (key) => {
    const params = {
        Bucket: bucketName,
        Key: key,
    }

    const command = new GetObjectCommand(params)
    const expiresTime = 3600
    const url = await getSignedUrl(client, command, {
        expiresIn: expiresTime
    })

    return url
}


