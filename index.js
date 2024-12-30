const express = require('express')
const mongoose = require('mongoose')
const userRouter = require('./routes/user')

const app = express()
const PORT = 3000
const DB = 'mongodb+srv://2767987137:msk20020407@cluster0.j7md3.mongodb.net/'

mongoose.connect(DB).then(() => console.log('MongoDB connected')).catch(err => console.log(err))

app.use(express.json())
app.use(userRouter)


app.listen(PORT, '0.0.0.0', () => console.log(`server is running on port ${PORT}!`))