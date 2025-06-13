import express from 'express';
import dotenv from 'dotenv';
import { initDB } from './config/db.js';
import rateLimiter from './middleware/rateLimiter.js';

import transactionsRoute from './routes/transactionsRoute.js';
import job from './config/cron.js';

dotenv.config();
// Initialize express app
const app = express();

if(process.env.NODE_ENV == "production") job.start(); // Start the cron job to send GET requests every 14 minutes

//middle wares
app.use(rateLimiter); // Apply rate limiting middleware
app.use(express.json()); // Middleware to parse JSON bodies
const PORT = process.env.PORT || 5001;

app.get("/api/health",(req,res)=>{
    res.status(200).json({
        message: "API is running smoothly",
        status: "Ok"
    })
})

app.use("/api/transactions", transactionsRoute);


initDB().then(()=>{
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    }); 
})