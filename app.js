const express = require('express')
const createError = require('http-errors')
const morgan = require('morgan')
const dotenv = require("dotenv")
const cors = require('cors')
dotenv.config() 
require('./helpers/init_mongodb')


const authRoute = require('./routes/auth')
const userRoute = require('./routes/user')
const noticeRoute = require('./routes/notice')
const galleryRoute = require('./routes/gallery')


const app = express()


//logging request routes
app.use(morgan("dev"))

//convert request body to JSON
app.use(express.json())
app.use(cors())




//Test Route
app.get("/api",(req, res)=>{
        res.status(200).send("SKYVIEW SEPTEMBER || Saturday - Checking workflow")
})


app.use('/api/auth',authRoute)

app.use('/api/user',userRoute)

app.use('/api/notice',noticeRoute)

app.use('/api/gallery',galleryRoute)

//test
app.use("/api/test",(req,res)=>{
        return res.status(200).json("The test route is working OK!")
})


//Unavailable routes message
app.use(async(req,res,next)=>{
        res.send(createError.NotFound("This route is not available"))
})


const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>{
        console.log(`Server running at ${PORT} 🚀`)
})


