const mongoose  = require('mongoose')

mongoose.set('strictQuery', true)

mongoose.connect(process.env.MONGODB_URI,{
        dbName:process.env.DB_NAME,
        useNewUrlParser : true,
        useUnifiedTopology : true
})
.then(()=>{
       console.log("🟢 mongodb connected") 
})
.catch((err)=>{
        console.log(err.message)
})


mongoose.connection.on("connected",()=>{
        console.log("mongoose connected to db")
})

mongoose.connection.on("error",(err)=>{
        console.log(err.message)
})

mongoose.connection.on("disconnected",()=>{
        console.log("mongoose disconnected")
})

//To close/disconnect mongoose from database
process.on('SIGINT',async()=>{
        await mongoose.connection.close()
        process.exit(0)
})