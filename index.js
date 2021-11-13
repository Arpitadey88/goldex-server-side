const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.port || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sqkcw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db('goldexWatchShop');
        const productsCollection = database.collection('products');
        const orderCollection = database.collection('orders');
        const reviewCollection = database.collection('reviews');

        // GET API
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        // GET SINGLE PRODUCT
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific product', id);
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        });

        // Post API
        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log('hit the post api', product);

            const result = await productsCollection.insertOne(product);
            console.log(result);
            res.json(result);
        });

        // Post Orders API In Database By POST
        app.post('/orders', async (req, res) => {
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder);
            // console.log('got new order', req.body);
            // console.log('added order', result);
            res.json(result);
        });

        //  MyOrder
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            console.log(query);
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        });

        // Post Review API
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            console.log('hit the post api', review);

            const result = await reviewCollection.insertOne(review);
            console.log(result);
            res.json(result);
        });

        // GET REVIEW API
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello ! Goldex Watches!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})