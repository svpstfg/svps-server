const path = require('path');
const jwt = require('jsonwebtoken')
const Notice = require('../models/Notice')
const randomStr = require('../helpers/random_string_generator')
const addNoticeSchema = require('../helpers/validation_schema_add_notice')

const  multer = require('multer')
const {upload} = require('../helpers/init_multer')


const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");

const s3 = require('../helpers/init_s3')


const addNotice = async(req,res)=>{
        try{
                try{
                        console.log(req.body.body)
                        const bdy = JSON.parse(req.body.body)
                        await addNoticeSchema.validateAsync(bdy)
                }catch(err){
                        return res.status(500).json("Payload not allowed")
                }

                console.log("req.body",req.body )
                console.log("req.file",req.files) 
        
        
                const noticeId =  randomStr.generateRandomString(32)

                const numberOfFiles = req.files.length;
                console.log('Number of files uploaded:', numberOfFiles);

                
                const attachments = []
                if(numberOfFiles > 0){
                        for (let i = 0; i < req.files.length; i++) {
                                console.log(req.files[i].originalname)

                                const rand = randomStr.generateRandomString(16)
                                const nid = noticeId.toString()

                                const attachmentId = rand + nid.substring(0,16)
                                const attachmentTitle = req.files[i].originalname
                                const attachmentUrl = "https://svps-storage.s3.ap-south-1.amazonaws.com/" + attachmentId

                                attachments.push({ attachmentId, attachmentTitle, attachmentUrl})

                                //Uploading file to S3
                                const params = {
                                        Bucket: process.env.BUCKET_NAME,
                                        Key: attachmentId,
                                        Body: req.files[i].buffer,
                                        ContentType: req.files[i].mimetype
                                }
                                const command = new PutObjectCommand(params)
                                await s3.send(command)
                        }

                }

                console.log(attachments)

                //Saving Notice to DB
                const data = JSON.parse(req.body.body)
        
                const newNotice = new Notice({
                        noticeId: noticeId,
                        title: data.title.toString(),
                        description: data.description.toString(),
                        attachments: [
                                ...attachments
                        ]
                })

                console.log(newNotice)

                try{
                        const savedNotice = await newNotice.save()
                        // return res.status(201).json(savedNotice)
                        return res.status(201).json("Notice saved successfully")
                }catch(err){
                        return res.status(500).json(err)
                }

        }catch(err){
                return res.status(500).json(err)
        }        
}

module.exports = {addNotice}