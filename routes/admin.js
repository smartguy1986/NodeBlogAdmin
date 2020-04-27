const express = require('express')
const ObjectId = require('mongodb').ObjectID;
const session = require('express-session')
const Admin = require('./../models/admin')
const router = express.Router()
const path = require('path')
const fs = require('fs');
//const passwordHash = require('password-hash');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express()

app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true }))
app.use(express.static(path.resolve('./public')));


router.get('/', uncheckUserSession, (req, res) => {
    console.log('This is Home Page')
    //console.log(req.session.users)
    res.redirect('/admin/login')
})

router.get('/login', uncheckUserSession, (req, res) => {
    console.log('This is login')
    //console.log(req.session.users)
    res.render('admin/login')
})

router.post('/login', uncheckUserSession, async (req, res) => {
    //console.log(req.body)
    const pastUser = await Admin.findOne({ 'emailid': req.body.emailid })
    if (pastUser == null) {
        req.flash('error', 'Invalid Email id')
        res.render(`admin/login`)
    }
    else {
        try {
            if (await bcrypt.compare(req.body.password, pastUser.password)) {
                req.session.users = pastUser
                res.redirect('/articles/')
            }
            else {
                req.flash('error', 'Invalid Password')
                res.render(`admin/login`)
            }
        }
        catch (e) {
            res.render(`admin/login`)
        }
    }

})

router.get('/register', uncheckUserSession, (req, res) => {
    console.log('This is register')
    console.log(req.session.users)
    res.render('admin/register')
})

router.post('/register', async (req, res) => {
    console.log(req.body)
    const salt = await bcrypt.genSalt()
    req.userData = new Admin()
    let userData = req.userData
    userData.fullname = req.body.fullname
    userData.emailid = req.body.emailid
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    userData.password = hashedPassword
    try {
        const pastUser = await Admin.findOne({ 'emailid': req.body.emailid })
        if (pastUser == null) {
            userData = await userData.save()
            req.session.users = userData
            res.redirect('/articles/')
        }
        else {
            req.flash('error', 'Email Id already exists')
            res.render(`admin/register`)
        }
    } catch (e) {
        res.render(`admin/register`, { userData: userData })
    }
})

// router.get('/dashboard', checkUserSession, (req, res) => {
//     console.log('This is dashboard')
//     console.log(req.session.users)
//     res.render('admin/dashboard', { userDetails: req.session.users })
// })

router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
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
        res.redirect('/articles/')
    }
    else {
        next()
    }
}//uncheckUserSession()

module.exports = router