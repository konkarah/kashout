const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

router.get('/', (req, res) => {
    res.send("hello world");
});
router.post('/posts', verifyToken, (req,res)=> {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err){
            res.sendStatus(403)
        }else{

    res.json({
        message: "Post 1",
        authData
    })
        }
    })
})

router.post('/login', (req,res)=>{
    //Mock user
    const user = {
        id: 1,
        name: "Thindi",
        email: "thindi@gmail.com"
    }

    jwt.sign({user}, 'secretkey', {expiresIn : '1h'},(err, token) => {
        res.json({
            token
        })
    })
})

function verifyToken(req, res , next){
    //get auth header value
    const bearerHeader = req.headers['authorization']

    //check if bearer is defined
    if(typeof bearerHeader !== 'undefined' ){
        //split at the space
        const bearer = bearerHeader.split(' ')

        //get the token from array
        const bearerToken = bearer[1]

        //set the token
        req.token = bearerToken

        //next middleware
        next()
    }else{
        //forbidden
        res.sendStatus(403)
    }
}

module.exports = router
