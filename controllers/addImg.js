const path = require('path');
const jwt = require('jsonwebtoken')
const Image = require('../models/Image')
const randomStr = require('../helpers/random_string_generator')

const  multer = require('multer')
const {upload_img} = require('../helpers/init_multer')


const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");

const s3 = require('../helpers/init_s3')


const addImg = async(req,res)=>{
        try{
                if(req.files && req.files.length > 0){
                        const numberOfFiles = req.files.length;
                        console.log('Number of files uploaded:', numberOfFiles);


                        try{
                                const noei = await Image.countDocuments({}); //number of existing images
                                const isPossibleToUpload = (9-noei) >= numberOfFiles ? true : false  //check if there is space to add more attachments
                                if(!isPossibleToUpload){
                                        return res.status(400).json(`Too many images. Maximum Capacity = 9 files. Existing Files = ${noei}`)
                                }

                        }catch(err){
                                return res.status.json("Error while accessing notice data.")

                        }

                        const addedSuccessfully =[]
                        for(let i=0;i<numberOfFiles; i++){
                                const imgId = "gallery_"+ randomStr.generateRandomString(32)
                                const imgUrl = "https://notice-svps-demo.s3.ap-south-1.amazonaws.com/" + imgId

                                //Uploading image to S3
                                try{
                                        const params = {
                                                Bucket: process.env.BUCKET_NAME,
                                                Key: imgId,
                                                Body: req.files[i].buffer,
                                                ContentType: req.files[i].mimetype
                                        }
                                        const command = new PutObjectCommand(params)
                                        await s3.send(command)
                                }catch(err){
                                        const errMsg = `Error while uploading ${imgId} to S3`
                                        return res.status(500).json({errMsg, addedSuccessfully})
                                }

                                //Saving Image to DB
                                const newImage = new Image({
                                        imgId: imgId,
                                        imgUrl: imgUrl
                                })

                                try{
                                        const savedImage = await newImage.save()
                                        addedSuccessfully.push(newImage)

                                }catch(err){
                                        const errMsg = `Error while saving ${imgId} to DB`
                                        return res.status(500).json({errMsg, addedSuccessfully})
                                }

                        }

                        const resMsg = "All Images added successfully"
                        return res.status(200).json({resMsg, addedSuccessfully})
                }
                return res.status(400).json("No Images attached")

        }catch(err){
                return res.status(500).json(err)
        }        
}

module.exports = {addImg}