const express = require('express')
const app = express()

app.get("/",(req,res)=>{
        res.send("SVPS server working!")
})

app.listen(7080, ()=>{
        console.log("Server started")
})