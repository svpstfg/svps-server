const Joi = require('@hapi/joi')

const addNoticeSchema = Joi.object({
        title : Joi.string().required(),
        description : Joi.string(),
        // attachments : Joi.array().items(Joi.object({
        //         title: Joi.string().required()
        // }))  
})

module.exports = addNoticeSchema