const Image = require('../models/Image')
const jwt = require("jsonwebtoken")

const getImg = async(req,res)=>{
        try{
                //Retrieving Images from DB.
                const param = req.query.imgId
                try{
                        const allImages = param ? await Image.findOne({imgId : {$eq: param}}) : await Image.find()  
                        
                        //Check if user is admin
                        const authHeader = req.headers.token
                        if(authHeader){
                                const token = authHeader.split(" ")[1]
                                jwt.verify(token, process.env.JWT_SECRET_KEY, (err,user)=>{
                                        if(err){
                                                return res.status(403).json("Invalid Token")
                                        }else{
                                                return res.status(200).json(allImages)
                                        }
                                })


                        }else{

                                if(allImages.length > 1){
                                        const allImagesForPublic = []
                                        for(let i=0;i<allImages.length;i++){
                                                const {imgId, imgUrl, ...rest} = allImages[i]._doc
                                                allImagesForPublic.push({imgId, imgUrl})
                                        }
                                        return res.status(200).json(allImagesForPublic)

                                }else{
                                        return res.status(404).json("No images available")
                                }
                        }

                }catch(err){
                        return res.status(500).json("Error while fetching images from db.")
                }

        }catch(err){
                return res.status(500).json(err)
        }        
}

module.exports = {getImg}