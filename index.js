const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.izhds6e.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const toyCollection = client.db('danyDB').collection('toys');

        // const index = await toyCollection.createIndex({name: 1});

        // app.get('/toy', async(req, res)=>{
        //     const result = await toyCollection.find({name: {$search: "Atlas"}})
        //     console.log(result);
        //     res.send({result});
        // })

        // Toy GET request
        app.get('/toys', async(req, res) => {
            const limit = parseInt(req.query.limit);
            if (limit) {
                const result = await toyCollection.find().limit(limit).toArray();   
                return res.send(result);
            }
            else{
                const result = await toyCollection.find().toArray(); 
                return res.send(result);
            }
        })

        app.get('/toy/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await toyCollection.findOne(query);
            res.send(result);
        } )

        app.get('/my-toys', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const result = await toyCollection.find(query).toArray();
            res.send(result); 
        });

        // Toy POST request
        app.post('/add-toy', async(req, res) => {
            const body = req.body;
            const result = await toyCollection.insertOne(body);
            res.send(result);
        });

        // MyToy Edit
        app.put('/my-toys/edit/:id', async(req, res) => {
            const id = req.params.id;
            const body = req.body;
            console.log(body);
            const filter = {_id: new ObjectId(id)};
            const updateToys = {
                $set: {
                    price: body.price,
                    quantity: body.quantity,
                    description: body.description
                }
            }
            const result = await toyCollection.updateOne(filter, updateToys);
            res.send(result)
        });

        // MyToys Delete
        app.delete('/my-Toys/delete/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await toyCollection.deleteOne(query);
            res.send(result);
        });



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Welcome to Dany Server!");
})

app.listen(port, () => {
    console.log("Server is running on port " + port);
})