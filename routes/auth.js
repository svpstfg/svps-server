const express = require('express')
const router = express.Router()
const CryptoJs = require('crypto-js')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const loginSchema = require('../helpers/validation_schema_login')


//LOGIN
router.post("/login",async(req,res)=>{
        try{

                //validate req body
                try{
                        await loginSchema.validateAsync(req.body)
                }catch(err){
                        return res.status(500).json("Payload not allowed")
                }



                //Filtering Username - Regex
                const emailOrUsernameRegex = /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$|^[a-zA-Z0-9_-]{3,30}$/;
                const match = emailOrUsernameRegex.test(req.body.username)
                const errorMsg = {message: "Invalid characters in username/email", status: 401}
                if(!match){
                        return res.status(500).json(errorMsg)
                }


                //Retrieving user from db
                const user = await User.findOne({$or : [{username: req.body.username }, {email:req.body.username}]})
                if(!user){
                        return res.status(401).json("username/email does not exist")
                }


                //decrypt password
                const hashedPassword = CryptoJs.AES.decrypt(user.password, process.env.JWT_SECRET_KEY)
                const psswrd = hashedPassword.toString(CryptoJs.enc.Utf8)

                if(psswrd  !== req.body.password){
                        return res.status(401).json("username/password incorrect")
                }




                //generating access token
                const accessToken = jwt.sign(
                        {
                                id: user._id,
                                isAdmin : user.isAdmin
                        },
                        process.env.JWT_SECRET_KEY,
                        {
                                expiresIn:"15d"
                        }
                )

                const{password, ...others} = user._doc

                return res.status(200).json({...others, accessToken})

        }catch(err){
                return res.status(500).json(err)
        }
})

module.exports = router