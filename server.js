import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import User from './models/user.js';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const secret = '420cosmico'

await mongoose.connect('mongodb://localhost:27017/auth', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.log);

const app = express();
// app.use(cookieParser());
// app.use(bodyParser.json({ extended: true }));
app.use(express.json())
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}))

app.get('/', (req, res) => {
    res.send('Ok')
})

app.post('/login', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
        password: req.body.password
    })

    if (user) {
        const token = jwt.sign({
            email: req.body.email,
            password: req.body.password
        }, secret)

        return res.json({ status: 'ok', user: token })
    } else {
        return res.json({ status: 'error', user: false })
    }
})


app.post('/register', async (req, res) => {
    // const newUser = await User.create({
    //     email: req.body.email,
    //     password: req.body.password
    // })

    // if (newUser) {
    //     return res.json({ status: 'ok' })
    // }

    // throw new Error("Error creating user")

    // return res.json({ status: 'error', error: 'email already exist' })
    try {
        await User.create({
            email: req.body.email,
            password: req.body.password
        })
        res.json({ status: 'ok' })
    } catch (err) {
        res.json({ status: 'error', error: 'Duplicate email' })
    }

})

app.get('/bills', async (req, res) => {
    const token = req.headers['x-access-token']

    try {
        const currentMonth = new Date().getMonth() + 1
        const decoded = jwt.verify(token, secret)
        const email = decoded.email

        const user = await User.findOne({ email })
        const billsFromCurrentMonth = user.bills.filter(bill => new Date(bill.date).getMonth() + 1 === currentMonth)

        return res.json({ status: 'ok', bills: billsFromCurrentMonth })
    } catch (err) {

        throw res.json({ status: 'error', error: 'invalid token', })
    }
})

app.post('/bills', async (req, res) => {
    const token = req.headers['x-access-token']

    try {
        const decoded = jwt.verify(token, secret)
        const email = decoded.email
        const user = await User.findOne({ email })


        await User.updateOne({ email }, { $set: { bills: [...user.bills, req.body.bills] } })

        return res.json({ status: 'ok' })
    } catch (err) {

        throw res.json({ status: 'error', error: 'invalid token', })
    }
})

app.post('/deleteBills', async (req, res) => {
    const token = req.headers['x-access-token']

    try {
        const decoded = jwt.verify(token, secret)
        const email = decoded.email

        await User.updateOne({ email }, { $set: { bills: [] } })

        return res.json({ status: 'ok' })
    } catch (err) {

        throw res.json({ status: 'error', error: 'invalid token', })
    }
})


app.listen(4000)