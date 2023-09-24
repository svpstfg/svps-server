const mongoose= require('mongoose')

const ImageSchema = new mongoose.Schema({
        imgId : {
                type:String,
                required: true,
                unique: true
        },
        imgUrl : {
                type: String
        }
}, {timestamps: true})

module.exports = mongoose.model("Image", ImageSchema)