const path = require('path');
const jwt = require('jsonwebtoken')
const Notice = require('../models/Notice')

const deleteNoticeSchema = require('../helpers/validation_schema_delete_notice')

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand , deleteObjects} = require("@aws-sdk/client-s3");
const s3 = require('../helpers/init_s3')


const deleteNotice = async(req,res)=>{
        try{   
                if(!req.body.noticeIds){
                        return res.status(400).json("No req body available")
                }

                try{
                        await deleteNoticeSchema.validateAsync(req.body)
                }
                catch(err){
                        return res.status(500).json("Invalid Payload")
                }

                const noticeIds = req.body.noticeIds
                if(noticeIds.length < 1){
                        return res.status(400).json("No Notices found to be deleted")
                }

                const deleteSuccessful = []
                const deleteFailed = []
                
                for(let i=0;i<noticeIds.length;i++){
                        console.log('noticeId : ',noticeIds[i].noticeId)

                        //Retrieve all attachmentIds of a notice from db
                        const attachmentIdsToBeDeleted = [] 
                        try{
                                const noticeData = await Notice.findOne({noticeId : {$eq : noticeIds[i].noticeId}})
                                if(noticeData){
                                        const attachments = noticeData.attachments
                                        attachments.map((attachment)=>{
                                                attachmentIdsToBeDeleted.push(attachment.attachmentId)
                                        })
                                }else{
                                        const errMsg = { msg : `No notice ${noticeIds[i].noticeId} eixts!`}
                                        for(let j=i;j<noticeIds.length;j++){
                                                deleteFailed.push({noticeId : noticeIds[j].noticeId})
                                        }
                                        return res.status(500).json({errMsg, deleteSuccessful, deleteFailed}) 
                                }

                        }catch(err){
                                const errMsg = { msg : `Some error occured while deleteing notice ${noticeIds[i].noticeId} from DB.`}
                                for(let j=i;j<noticeIds.length;j++){
                                        deleteFailed.push({noticeId : noticeIds[j].noticeId})
                                }
                                return res.status(500).json({errMsg, deleteSuccessful, deleteFailed})
                        }
                        console.log('attachmentIdsToBeDeleted : ',attachmentIdsToBeDeleted)




                        //Delete all related S3 Files
                        if(attachmentIdsToBeDeleted.length > 0){
                                try{
                                        attachmentIdsToBeDeleted.map(async(key)=>{
                                                const params= {
                                                        Bucket : process.env.BUCKET_NAME,
                                                        Key: key
                                                }
                
                                                const command =  new DeleteObjectCommand(params)
                                                await s3.send(command)
                                        })
                        
                                }catch(err){
                                        const errMsg = { msg : `Some error occured while deleteing attachments ${noticeIds[i].noticeId} from S3.`}
                                        for(let j=i;j<noticeIds.length;j++){
                                                deleteFailed.push({noticeId : noticeIds[j].noticeId})
                                        }
                                        return res.status(500).json({errMsg, deleteSuccessful, deleteFailed})
                                }
                        }




                        //Delete from DB
                        try{
                                const deleteNotice = await Notice.findOneAndDelete(
                                        { noticeId : {$eq : noticeIds[i].noticeId}}
                                )

                                deleteNotice ? deleteSuccessful.push({noticeId : noticeIds[i].noticeId}) :deleteFailed.push({noticeId : noticeIds[i].noticeId}) 

                        }catch(err){
                                const errMsg = { msg : `Some error occured while deleteing notice ${noticeIds[i].noticeId} from DB.`}
                                deleteFailed.push({noticeId : noticeIds[i].noticeId})
                                return res.status(500).json({errMsg, deleteSuccessful, deleteFailed})
                                
                        }
                }

                return res.status(200).json({deleteSuccessful,deleteFailed})



        }catch(err){
                return res.status(500).json(err)
        }
}

module.exports = {deleteNotice}