import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import stripeRouter from './route.js'
import morgan from 'morgan'

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api', stripeRouter)
app.use(morgan('dev'))

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Request methods you wish to allow
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
    );

    // Request headers you wish to allow
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type,Authorization"
    );

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true);
    if (req.method === "OPTIONS") {
        // Respond to OPTIONS requests
        res.sendStatus(200);
    } else {
        // Pass to next layer of middleware
        next();
    }
});



app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})