if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
const express = require('express');
const app = express();
const userRouter = require('./routes/user');
const https = require('https')
const cors = require('cors');
//process.binding('http_parser').HTTPParser = require('http-parser-js').HTTPParser;
const request = require('request');
const bodyParser = require('body-parser')
const delivery = require('./routes/delivery')
const myapis = require('./routes/payment')
const axios = require('axios')
const PORT = process.env.PORT || 3005
const mongoose = require('mongoose')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.set('view engine', 'ejs');
app.use( express.static( "public" ) );
app.use(express.urlencoded({extended: false}));
app.use(cors());

// //connect to mongodb
// mongoose.set("strictQuery", false);
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const db = mongoose.connection;

// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// db.once('open', () => {
//   console.log('Connected to MongoDB');
// });

app.use('/user', userRouter);
app.use('/delivery', delivery)
app.use('/myapis', myapis)

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(PORT, ()=> {
    console.log(`Server started on ${PORT}`)
})