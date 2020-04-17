const express = require('express')
const ObjectId = require('mongodb').ObjectID;
const session = require('express-session')
const Article = require('./../models/article')
const Category = require('./../models/category')
const router = express.Router()
const path = require('path')
const fs = require('fs');
//const passwordHash = require('password-hash');
const app = express()

app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true }))
app.use(express.static(path.join('./public')));
// app.set('views', path.join(__dirname, 'views'));

router.get('/', checkUserSession, async (req, res) => {
    const articles = await Article.find().sort({ createdAt: 'desc' })
    //console.log(articles)
    res.render('articles/index', { articles: articles })
})

router.get('/new', checkUserSession, async (req, res) => {
    const categories = await Category.find().sort({ name: 'asc' })
    //console.log(categories)
    res.render('articles/new', { article: new Article(), categories: categories })
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

router.post('/save', checkUserSession, async (req, res) => {
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
    article.cat_id = req.body.cat_id
    article.category = req.body.category
    article.title = req.body.title
    article.description = req.body.description
    article.markdown = req.body.markdown
    article.featuredimage = imageName
    try {
        article = await article.save()
        res.redirect(`/articles/${article.slug}`)
    } catch (e) {
        res.render(`articles/new`, { article: article })
    }
})

router.put('/:id', checkUserSession, async (req, res) => {
    const article = await Article.findById(req.params.id)
    // console.log(article)
    console.log('===========================')
    console.log(article._id)
    console.log('===========================')
    console.log(article.slug)
    console.log('===========================')
    console.log(req.body.title)
    console.log('===========================')
    try {
        console.log('I am trying')
        await Article.updateOne(
            { "_id": article._id }, { "title": req.body.title, "description": req.body.description, "markdown": req.body.markdown }
        )
        res.redirect(`/articles/${article.slug}`)
    } catch (e) {
        console.log('I am catching')
        res.redirect(`/articles/edit/${article._id}`)
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

module.exports = router