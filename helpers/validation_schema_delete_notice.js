const Joi = require('@hapi/joi')

const deleteNoticeSchema = Joi.object({
        noticeIds : Joi.array().items(Joi.object({
                noticeId: Joi.string()
        }))  
})

module.exports = deleteNoticeSchema