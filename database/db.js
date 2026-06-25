require('dotenv').config()
const mongoose = require('mongoose')

const MONGO_URI = process.env.MONGO_URI

const connectDB = async() => {
    try{
        await mongoose.connect(MONGO_URI);
        console.log('MongoDb connected successfully');
        
    } catch(e){
        console.log('MongoDB connection failed');
        process.exit(1)
        
    }
}

module.exports = connectDB