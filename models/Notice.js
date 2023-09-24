const { array } = require('@hapi/joi')
const mongoose = require('mongoose')
const Attachment = require('./Attachment')

const NoticeSchema = new mongoose.Schema({
        noticeId : {
                type:String,
                required: true,
                unique: true
        },
        title : {
                type:String,
                required: true,
                unique: true
        },
        description : {
                type:String
        },
        attachments : {
                type: []
        }
},{
        timestamps:true
})

module.exports = mongoose.model("Notice", NoticeSchema)