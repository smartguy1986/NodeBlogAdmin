const mongoose = require('mongoose')
const marked = require('marked')
const slugify = require('slugify')
const createDomPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const dompurify = createDomPurify(new JSDOM().window)

mongoose.connect('mongodb://root:1986@blog-shard-00-00-eip6j.mongodb.net:27017,blog-shard-00-01-eip6j.mongodb.net:27017,blog-shard-00-02-eip6j.mongodb.net:27017/test?ssl=true&replicaSet=blog-shard-0&authSource=admin&retryWrites=true&w=majority', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
})

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    featuredimage:{
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    slug:{
        type: String,
        required: true,
        unique: true
    },   
})

categorySchema.pre('validate', function(){
    if(this.name){
        this.slug = slugify(this.name, {lower: true, strict: true})
    }

    // if(this.markdown){
    //     this.sanitizedHTML = dompurify.sanitize(marked(this.markdown))
    // }
})

module.exports = mongoose.model('Category', categorySchema)