const path = require('path');
const jwt = require('jsonwebtoken')
const Notice = require('../models/Notice')

const getNotice = async(req,res)=>{
        try{   
                //Latest notice
                const lat = req.query.latest
                if(lat === 'true'){
                        const latestNotice = await Notice.find().sort({ _id: -1 }).limit(1)
                        return res.status(200).json(latestNotice)

                }

                //DB Query
                const param = req.query.noticeId
                const allNotices = param ? await Notice.findOne({noticeId : {$eq: param}}) : await Notice.find() 

                console.log(allNotices)

                //Check if user is admin
                const authHeader = req.headers.token
                if(authHeader){
                        const token = authHeader.split(" ")[1]
                        jwt.verify(token, process.env.JWT_SECRET_KEY, (err,user)=>{
                                if(err){
                                        return res.status(403).json("Invalid Token")
                                }else{
                                        return res.status(200).json(allNotices)
                                }
                        })


                }else{
                        const keysToRemove = ['_id', '__v', 'createdAt', 'updatedAt'];
                
                        if(allNotices.length >= 0){
                                console.log("FLAG #####")
                                const allNoticesForPublic = []
                                for(let i=0;i<allNotices.length;i++){
                                        const {_id, __v, ...rest} = allNotices[i]._doc
                                        allNoticesForPublic.push(rest)
                                }
                                return res.status(200).json(allNoticesForPublic)

                        }
                        else if(allNotices){
                                const {_id, __v, ...rest} = allNotices._doc
                                return res.status(200).json(rest)

                        }else{

                                return res.status(404).json("No notice available")
                        }

 
                }

        }catch(err){
                return res.status(500).json(err)
        }
}

module.exports = {getNotice}