const express = require('express')
const ObjectId = require('mongodb').ObjectID;
const session = require('express-session')
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
    const categories = await Category.find().sort({ createdAt: 'desc' })
    //console.log(articles)
    res.render('category/index', { categories: categories })
})

router.get('/new', checkUserSession, async (req, res) => {
    res.render('category/new', { category: new Category() })
})

// router.get('/edit/:id', checkUserSession, async (req, res) => {
//     const article = await Article.findById(req.params.id)
//     res.render('category/edit', { article: article })
// })

// router.get('/:slug', checkUserSession, async (req, res) => {
//     const article2 = await Article.findOne({ 'slug': req.params.slug })
//     if (article2 == null) {
//         res.redirect('/')
//     }
//     res.render('category/show', { article: article2 })
// })

router.post('/save', checkUserSession, async (req, res) => {
    console.log(req);
    req.category = new Category()
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
    let category = req.category
    category.name = req.body.name
    category.featuredimage = imageName
    try {
        category = await category.save()
        res.redirect(`/category/`)
    } catch (e) {
        res.render(`category/new`, { category: category })
    }
})

// router.put('/:id', checkUserSession, async (req, res) => {
//     const article = await Article.findById(req.params.id)
//     // console.log(article)
//     console.log('===========================')
//     console.log(article._id)
//     console.log('===========================')
//     console.log(article.slug)
//     console.log('===========================')
//     console.log(req.body.title)
//     console.log('===========================')
//     try {
//         console.log('I am trying')
//         await Article.updateOne(
//             { "_id": article._id }, { "title": req.body.title, "description": req.body.description, "markdown": req.body.markdown }
//         )
//         res.redirect(`/category/${category.slug}`)
//     } catch (e) {
//         console.log('I am catching')
//         res.redirect(`/category/edit/${category._id}`)
//     }
// })

router.delete('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id)
    fs.unlink('./public/uploads/' + category.featuredimage, function (err) {
        if (err) throw err;
        console.log('File deleted!');
    });
    await Category.findByIdAndDelete(req.params.id)
    res.redirect('/category/')
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