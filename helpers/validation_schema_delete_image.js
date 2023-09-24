const Joi = require('@hapi/joi')

const deleteImageSchema = Joi.object({
        imgIds : Joi.array().items(Joi.object({
                imgId: Joi.string()
        }))  
})

module.exports = deleteImageSchema