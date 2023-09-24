const mongoose = require('mongoose')

const AttachmentSchema = new mongoose.Schema({
        attachmentId : {
                type:String,
                required: true,
                unique: true
        },
        attachmentTitle : {
                type:String,
                required: true
        },
        attachmentUrl : {
                type: String
        }
},{
        timestamps:true
})

module.exports = mongoose.model("Attachment", AttachmentSchema)