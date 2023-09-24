const Joi = require('@hapi/joi')


const updateSchema = Joi.object({
        username : Joi.string(),
        email: Joi.string(),
        password : Joi.string()
})

module.exports = updateSchema

 