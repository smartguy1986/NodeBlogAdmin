const express = require('express')
const ObjectId = require('mongodb').ObjectID;
const Admin = require('./../models/admin')
const router = express.Router()
const path = require('path')
const app = express()

app.use(express.static(path.resolve('./public')));


router.get('/', uncheckUserSession, (req, res) => {
    res.render('admin/login', { admin: new Admin() })
})


router.get('/dashboard', checkUserSession, (req, res) => {
    res.render('admin/dashboard')
})


function checkUserSession( req, res, next )
{
    if( req.session.user_id )
    {
        next()
    }
    else
    {
        res.redirect('/')
    }
}//checkUserSession()

function uncheckUserSession( req, res, next )
{
    if( req.session.user_id )
    {
        res.redirect('/dashboard')
    }
    else
    {
        next()
    }
}//uncheckUserSession()

module.exports = router