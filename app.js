// Import required modules
import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
// Create Express app
const app = express();

// Define a route
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

const uri =
  "mongodb+srv://Jasper:1234@cluster0.d8n0tir.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

// Start the server
const PORT = process.env.PORT || 3065;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
