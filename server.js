const express = require('express')
const mongoose = require('mongoose')
const flash = require('express-flash')
const session = require('express-session')
const Article = require('./models/article')
const Admin = require('./models/admin')
const adminRouter = require('./routes/admin')
const articleRouter = require('./routes/articles')
const methodOverride = require('method-override')
const fileUpload = require('express-fileupload')
const path = require('path')
const fs = require('fs');

const app = express()
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true}))
app.use(express.static(path.join(__dirname, 'public')));


mongoose.connect('mongodb://root:1986@blog-shard-00-00-eip6j.mongodb.net:27017,blog-shard-00-01-eip6j.mongodb.net:27017,blog-shard-00-02-eip6j.mongodb.net:27017/test?ssl=true&replicaSet=blog-shard-0&authSource=admin&retryWrites=true&w=majority', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
})

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

app.use(flash())

app.use(methodOverride('_method'))

app.use(fileUpload())


app.get('/', async (req, res) => {
    res.redirect('/admin/login')
})

app.use('/articles/', articleRouter)
app.use('/admin/', adminRouter)

app.listen(process.env.PORT || 8080)