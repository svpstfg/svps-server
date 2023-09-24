const Joi = require('@hapi/joi')

const addImgSchema = Joi.object({
        title : Joi.string().required(),
        description : Joi.string(),
        // attachments : Joi.array().items(Joi.object({
        //         title: Joi.string().required()
        // }))  
})

module.exports = addImgSchema