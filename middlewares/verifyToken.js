const jwt = require('jsonwebtoken')

const verifyToken = (req,res , next)=>{
        const authHeader = req.headers.token
        if(!authHeader){
                return res.status(401).json("Unauthorized to access")
        }else{
                const token = authHeader.split(" ")[1]
                jwt.verify(token, process.env.JWT_SECRET_KEY, (err,user)=>{
                        if(err){
                                const errorMsg = {message: "Token expired", status: 401}
                                return res.status(403).json(errorMsg)
                        }
                        req.user = user
                        next()
                })
        }
}


const verifyTokenAndAdmin = (req,res, next)=>{
        verifyToken(req,res, ()=>{
                if(req.user.isAdmin){
                        next()
                }else{
                        const errorMsg = {message: "Unauthorized to access", status: 401}
                        return res.status(403).json(errorMsg)
                }
        })
}


module.exports = {verifyToken, verifyTokenAndAdmin}