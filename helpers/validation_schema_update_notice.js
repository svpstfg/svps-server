const Joi = require('@hapi/joi')


const updateNoticeSchema = Joi.object({
        title: Joi.string(),
        description : Joi.string(),
        attachmentsToBeRemoved : Joi.array().items(Joi.object({
                attachmentId : Joi.string().required()
        }))
})

module.exports = updateNoticeSchema

 