const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sqkcw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);

// middlewars
app.use(cors());
app.use(express.json());

async function run() {
    try {
        await client.connect();
        const database = client.db('goldexWatchShop');
        const productsCollection = database.collection('products');
        const orderCollection = database.collection('orders');
        const usersCollection = database.collection('users');
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

        // Add API by Post
        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log('hit the post api', product);
            const result = await productsCollection.insertOne(product);
            console.log(result);
            res.json(result);
        });

        // Add Orders API By POST
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        });

        //  All Orders
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find();
            const orders = await cursor.toArray();
            res.json(orders);
        });

        // GET API for all orders of *user* by Email
        app.get("/orders/:byEmail", async (req, res) => {
            const email = req.params.byEmail;
            const query = { email };
            const cursor = orderCollection.find(query);
            const myOrders = await cursor.toArray();
            res.json(myOrders);
        });
        // PUT API for update order
        app.put("/order/:id", async (req, res) => {
            const id = req.params.id;
            const updatedOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: updatedOrder.status,
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc);
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.json({ result, orders });
        });

        // Delete Order
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        });

        // Delete product by id Api
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        });

        // Add Save Users
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // Make Users
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // Make Admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // Check Admin or Not
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

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

        // GET Order BY Email ID running code
        // app.get('/myOrder', async (req, res) => {
        //     const email = req.query.email;
        //     const query = { userEmail: email }
        //     const cursor = orderCollection.find(query);
        //     console.log('cc', cursor)
        //     const myOrder = await cursor.toArray();
        //     console.log('myorder', myOrder)
        //     res.json(myOrder);
        // })
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