const express = require('express')
const ObjectId = require('mongodb').ObjectID;
const session = require('express-session')
const Article = require('./../models/article')
const router = express.Router()
const path = require('path')
const fs = require('fs');
//const passwordHash = require('password-hash');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express()

app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true }))
app.use(express.static(path.join('./public')));

router.get('/', checkUserSession, async (req, res) => {
    const articles = await Article.find().sort({ createdAt: 'desc' })
    //console.log(articles)
    res.render('articles/index', { articles: articles })
})

router.get('/new', checkUserSession, (req, res) => {
    res.render('articles/new', { article: new Article() })
})

router.get('/edit/:id', checkUserSession, async (req, res) => {
    const article = await Article.findById(req.params.id)
    res.render('articles/edit', { article: article })
})

router.get('/:slug', checkUserSession, async (req, res) => {
    const article2 = await Article.findOne({ 'slug': req.params.slug })
    if (article2 == null) {
        res.redirect('/')
    }
    res.render('articles/show', { article: article2 })
})

router.post('/save', checkUserSession, async (req, res, next) => {
    console.log(req);
    req.article = new Article()
    var file = req.files.featuredimage,
        name = file.name,
        type = file.mimetype
    var uploadpath = './public/uploads/' + name
    file.mv(uploadpath, function (err) {
        if (err) {
            console.log("File Upload Failed", name, err)
        }
        else {
            console.log("File Uploaded", name)
        }
    })
    var imageName = req.files.featuredimage.name
    console.log(req.files.featuredimage.name)
    let article = req.article
    article.title = req.body.title
    article.description = req.body.description
    article.markdown = req.body.markdown
    article.featuredimage = imageName
    try {
        article = await article.save()
        res.redirect(`/articles/${article.slug}`)
    } catch (e) {
        res.render(`articles/${path}`, { article: article })
    }
})

router.put('/:id', checkUserSession, async (req, res, next) => {
    req.article = await Article.findById(req.params.id)
    article.title = req.body.title
    article.description = req.body.description
    article.markdown = req.body.markdown
    article.featuredimage = imageName
    try {
        article = await article.save()
        res.redirect(`/articles/${article.slug}`)
    } catch (e) {
        res.render(`articles/${path}`, { article: article })
    }
})

router.delete('/:id', async (req, res) => {
    const article = await Article.findById(req.params.id)
    fs.unlink('./public/uploads/' + article.featuredimage, function (err) {
        if (err) throw err;
        console.log('File deleted!');
    });
    await Article.findByIdAndDelete(req.params.id)
    res.redirect('/articles/')
})

function checkUserSession(req, res, next) {
    if (req.session.users) {
        next()
    }
    else {
        res.redirect('/')
    }
}//checkUserSession()

function uncheckUserSession(req, res, next) {
    if (req.session.users) {
        res.redirect('/admin/dashboard')
    }
    else {
        next()
    }
}//uncheckUserSession()

module.exports = router