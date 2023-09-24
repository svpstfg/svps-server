const Image = require("../models/Image")
const deleteImageSchema = require('../helpers/validation_schema_delete_image')
const s3 = require("../helpers/init_s3")
const { DeleteObjectCommand } = require('@aws-sdk/client-s3')


const deleteImg = async(req,res)=>{
        try{
                if(!req.body.imgIds){
                        return res.status(400).json("No req body available")
                }
                try{
                        await deleteImageSchema.validateAsync(req.body)
                }catch(err){
                        console.log(err)
                        return res.status(500).json("Invalid Payload")
                }

                const imgIds = req.body.imgIds
                if(imgIds.length < 1){
                        return res.status(400).json("No Images found to be deleted")
                }


                const deleteSuccessful = []
                const deleteFailed = []
                //Deleting Image from S3 and DB
                for(let i=0;i<imgIds.length;i++){
                        const imgId = imgIds[i].imgId

                        //Deleting from S3
                        try{
                                const params = {
                                        Bucket : process.env.BUCKET_NAME,
                                        Key: imgId
                                }

                                const command =  new DeleteObjectCommand(params)
                                await s3.send(command)
                        }catch(err){
                                const errMsg = { msg : `Some error occured while deleteing image ${imgId} from S3.`}
                                for(let j=i;j<imgIds.length;j++){
                                        deleteFailed.push({imgId : imgIds[i].imgId})
                                }
                                return res.status(500).json({errMsg, deleteSuccessful, deleteFailed})
                        }


                        //Deleting from DB
                        try{
                                const deleteNotice = await Image.findOneAndDelete(
                                        { imgId : {$eq : imgId}}
                                )

                                deleteNotice ? deleteSuccessful.push({imgId : imgId}) :deleteFailed.push({imgId : imgId})
                        }catch(err){
                                const errMsg = { msg : `Some error occured while deleteing image ${imgId} from DB.`}
                                for(let j=i;j<imgIds.length;j++){
                                        deleteFailed.push({imgId : imgIds[i].imgId})
                                }
                                return res.status(500).json({errMsg, deleteSuccessful, deleteFailed})
                        }

                }

                return res.status(200).json({deleteSuccessful,deleteFailed})

        }catch(err){
                return res.status(500).json(err)
        }
}

module.exports = {deleteImg}