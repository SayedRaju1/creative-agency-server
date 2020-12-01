const express = require('express')
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectID;
const cors = require('cors')
const fs = require('fs-extra')
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;

require('dotenv').config()





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sejit.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()
const port = 5000


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('serviceImages'));
app.use(fileUpload());


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const servicesList = client.db("creative-agency").collection("services");
    const reviewList = client.db("creative-agency").collection("reviews");
    const orderList = client.db("creative-agency").collection("orders");
    const adminList = client.db("creative-agency").collection("admins");

    console.log(`database connected`)

    app.get('/services', (req, res) => {
        servicesList.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.get('/reviews', (req, res) => {
        reviewList.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    });

    app.get('/myServices', (req, res) => {
        orderList.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post("/addService", (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        servicesList.insertOne({ title, description, image })
            .then(result => {
                res.send(result.insertedCount > 0)
                console.log(result);
            })

    });

    app.post("/makeAdmin", (req, res) => {
        const admin = req.body;
        adminList.insertOne(admin)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount > 0)
            })

    });

    app.post("/addReview", (req, res) => {
        const review = req.body;
        reviewList.insertOne(review)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount > 0)
            })

    });

    app.post("/addOrder", (req, res) => {
        const order = req.body;
        orderList.insertOne(order)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount > 0)
            })

    });

    app.post("/loadAdmin", (req, res) => {
        const email = req.body.email;
        adminList.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0);
            })

    })

});




app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || port)