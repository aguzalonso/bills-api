import express from 'express'

const router = express.Router()

router.post('/', async (req, res) => {
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

export default router