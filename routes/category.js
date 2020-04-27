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
    const categories = await Category.find().sort({ createdAt: 'desc' })
    //console.log(articles)
    res.render('category/index', { categories: categories })
})

router.get('/new', checkUserSession, async (req, res) => {
    res.render('category/new', { category: new Category() })
})

// ========================== Webservice ================================ //
router.get('/list', async (req, res) => {
    const categories = await Category.find().sort({ createdAt: 'desc' })
    //console.log(categories.legth)
    if (categories == null) {     
        res.send({ 'query': 'get category list', 'time': Date.now(), 'status': 0, 'response': 'failure', 'content': 'No Categories Found' })
    }
    else {
        const combinedArray =[]
        categories.forEach(function(cats){ 
            console.log(cats.name)
            const article3 = Article.find({ 'category': cats.name })
            //console.log(article3.length)
            var arr = {'category': cats, 'count': article3.length} 
            console.log(arr)
            combinedArray.push(arr)
            //contents.concat(arr)
        })
        console.log(combinedArray)
        res.send({ 'query': 'get category list', 'time': Date.now(), 'status': 1, 'response': 'success', 'content': combinedArray })
    }
})

// ===================================================================== //

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