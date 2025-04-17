import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import stripeRouter from './route.js'
const app = express()

app.use(express.json())
app.use('/api', stripeRouter)
app.use(cors())

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Update with your frontend URL
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})