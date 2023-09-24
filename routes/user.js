const express = require('express')
const { verifyTokenAndAdmin } = require('../middlewares/verifyToken')
const updateSchema = require('../helpers/validation_schema_update')
const User = require('../models/User')
const router = express.Router()
const CryptoJs = require('crypto-js')



//GET
router.get("/",verifyTokenAndAdmin, async(req,res)=>{
        try{
                const adminData = await User.find()
                res.status(200).json(adminData[0])
        }catch(err){
                return res.status(404).json("No users found")
        }
})


//UPDATE
router.put("/",verifyTokenAndAdmin,async(req,res)=>{
        try{
                await updateSchema.validateAsync(req.body)
        }catch(err){
                return res.status(403).json("Payload not allowed")
        }

        if(req.body.password){
                const passwordRegex = /^.{6,}$/;
                const match = passwordRegex.test(req.body.password)
                if(!match){
                        return res.status(500).json("Min 6 chars required for password")
                }
                req.body.password = CryptoJs.AES.encrypt(
                        req.body.password,
                        process.env.JWT_SECRET_KEY
                ).toString()
        }

        try{
                const id = req.user.id
                const updatedUser = await User.findByIdAndUpdate(id,{
                        $set: req.body
                }, {new:true})

                return res.status(200).json(updatedUser)
        }catch(err){
                return res.status(500).json(err)
        }
})

module.exports = router