const path = require('path');
const jwt = require('jsonwebtoken')
const Notice = require('../models/Notice')
const randomStr = require('../helpers/random_string_generator')

const updateNoticeSchema = require('../helpers/validation_schema_update_notice')

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");



//Initializing S3 object
const s3 = new S3Client({
        credentials:{
                accessKeyId: process.env.ACCESS_KEY,
                secretAccessKey:process.env.SECRET_ACCESS_KEY,
        },
        region: process.env.BUCKET_REGION
})


const updateNotice = async(req,res)=>{
        try{   
                const noticeId = req.query.noticeId
                if(!noticeId){
                        return res.status(400).json("Please add noticeId to req.")
                }

                const existsNotice = await Notice.findOne({noticeId : {$eq : noticeId}})
                console.log(existsNotice, existsNotice)
                if(!existsNotice){
                        return res.status(404).json("Invalid notice Id")
                }
                

                if(!req.body.body && !req.files){
                        return res.status(400).json("No Payload or file attached")
                }



                //Deleting attachments from S3 and DB
                if(req.body.body){
                        const bdy = JSON.parse(req.body.body)
                        console.log(bdy)
                        try{
                             await updateNoticeSchema.validateAsync(bdy)
                        }catch(err){
                             return res.status(500).json("Payload not allowed")
                        }

                        const atr = bdy.attachmentsToBeRemoved
                        const attachmentIdsToBeRemoved = []
                        const deletedFileCount =0
                        if(atr && atr.length > 0){
                                for(let i=0; i< atr.length; i++){
                                        const atri = atr[i].attachmentId
                                        console.log(atri)
        
                                        const fileKey = atr[i].attachmentId
                                        attachmentIdsToBeRemoved.push(fileKey)
        
                                        //Deleting attachments from S3
                                        try{
                                                const params= {
                                                        Bucket : process.env.BUCKET_NAME,
                                                        Key: fileKey
                                                }
                
                                                const command =  new DeleteObjectCommand(params)
                                                await s3.send(command)
                                        }catch(err){
                                                return res.status(400).json("Error while deleteing attachment from S3")
                                        }

        
        
                                        //Deleting attachments from DB
                                        try{
                                                const nnn = await Notice.findOneAndUpdate(
                                                        {
                                                          noticeId : {$eq: noticeId}
                                                        },
                                                        {
                                                          $pull: {
                                                          attachments: {
                                                                  attachmentId: {$eq: fileKey}
                                                            }
                                                          }
                                                        },
                                                        { new: true }
                                                  )
                  
                                                  console.log(nnn)
                                        }catch(err){
                                                res.status(500).json("Error while deleting attachment from DB.")
                                        }

                                }
                        }
                }



                //Adding new attachments
                if(req.files && req.files.length > 0){
                        console.log("req.file",req.files) 
                        try{
                                const noOfExistingAttachments = await Notice.aggregate([
                                        {
                                                $match: { noticeId: noticeId }, 
                                        },
                                        {
                                          $project: {
                                            numberOfObjects: { $size: '$attachments' }, // Calculate the number of objects in the array field
                                          },
                                        },
                                ]);

                                const noea = noOfExistingAttachments.length > 0 ?  //number of existing files
                                noOfExistingAttachments[0].numberOfObjects : 0
                
                                const nofp = req.files.length //number of files in payload
                
                                console.log("noea", noea)
                                console.log("nofp", nofp)
                
                                const isPossibleToUpload = (3-noea) >= nofp ? true : false  //check if there is space to add more attachments
                                if(!isPossibleToUpload){
                                        return res.status(400).json(`Too many files. Maximum Capacity = 3 files. Existing Files = ${noea}`)
                                }
                        }catch(err){
                                return res.status.json("Error while accessing notice data.")
                        }




                        //Upload Attachments to S3
                        const attachments = []
                        for (let i = 0; i < req.files.length; i++) {
                                const rand = randomStr.generateRandomString(16)
                                const nid = noticeId.toString()

                                const attachmentId = rand + nid.substring(0,16)
                                const attachmentTitle = req.files[i].originalname
                                const attachmentUrl = "https://notice-svps-demo.s3.ap-south-1.amazonaws.com/" + attachmentId

                                attachments.push({ attachmentId, attachmentTitle, attachmentUrl})
                                const params = {
                                        Bucket: process.env.BUCKET_NAME,
                                        Key: attachmentId,
                                        Body: req.files[i].buffer,
                                        ContentType: req.files[i].mimetype
                                }
                                const command = new PutObjectCommand(params)
                                await s3.send(command)
                        }


                        //Update attachments in db
                        try{
                                const attToDb = await Notice.findOneAndUpdate(
                                        {
                                                noticeId : {$eq: noticeId}
                                        },
                                        {
                                          $push: {
                                            attachments: {
                                              $each: attachments,
                                            },
                                          },
                                        },
                                        { new: true }
                                      );

                                console.log(attToDb)
                        }
                        catch(err){
                                return res.status(500).json("some error occured while saving attachments to db.")
                        }                        
                }


                //Check fields exist in body
                if(req.body.body){
                        const bdy = JSON.parse(req.body.body)
                        const {attachmentsToBeRemoved , ...rest} = bdy

                        if(rest.title || rest.description){
                                console.log(bdy)
                                
                                //updating to db
                                try{
                                        const updatedNotice = await Notice.findOneAndUpdate(
                                        {
                                                noticeId : {$eq: noticeId}
                                        },
                                        {
                                                $set: rest
                                        }, {new:true})

                                        // return res.status(200).json(updatedNotice)
                                        return res.status(200).json("Notice updated successfully")
                                }catch(err){
                                        return res.status(400).json("Some problem occured while updating DB.")
                                }
                        }
                }

                try{
                        const updatedNotice = await Notice.findOne({noticeId : {$eq : noticeId}})
                        // return res.status(200).json(updatedNotice)
                        return res.status(200).json("Notice updated successfully")

                }catch(err){
                        return res.status(500).json("Some error occurred")
                }


        }catch(err){
                return res.status(500).json(err)
        }
}

module.exports = {updateNotice}