// Import required modules
import express from "express";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import bodyParser from "body-parser";
import cors from "cors";

// Create Express app
const app = express();
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection URI
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
// Function to create a list
async function createList(listData) {
  try {
    // Ensure client is connected before running operations
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }
    const listsCollection = client.db("Cluster0").collection("lists");
    const result = await listsCollection.insertOne(listData);
    return result;
  } catch (error) {
    console.error("Error creating list:", error);
    throw error; // Rethrow the error to be caught by the calling function
  }
}

// Route to handle list creation
app.post("/lists", async (req, res) => {
  try {
    const newList = req.body; // Assuming the request body contains list data
    const result = await createList(newList);
    res.status(201).json({
      message: "List created successfully",
      listId: result.insertedId,
    });
  } catch (error) {
    console.error("Failed to create list:", error);
    res.status(500).json({ message: "Failed to create list" });
  }
});
async function getListById(listId) {
  try {
    // Ensure client is connected before running operations
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }
    const listsCollection = client.db("Cluster0").collection("lists");
    const userList = await listsCollection.findOne({
      _id: listId,
    });
    return userList;
  } catch (error) {
    console.error("Error fetching list by ID:", error);
    throw error; // Rethrow the error to be caught by the calling function
  }
}
app.get("/list/:listId", async (req, res) => {
  try {
    const listId = req.params.listId;

    const userList = await getListById(new ObjectId(listId));

    if (!userList) {
      res.status(404).json({ message: "List not found" });
    } else {
      res.status(200).json(userList);
    }
  } catch (error) {
    console.error("Failed to fetch list by ID:", error);
    res.status(500).json({ message: "Failed to fetch list by ID" });
  }
});
async function getUserLists(userId) {
  try {
    // Ensure client is connected before running operations
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }
    const listsCollection = client.db("Cluster0").collection("lists");
    const userLists = await listsCollection.find({ userId: userId }).toArray();
    return userLists;
  } catch (error) {
    console.error("Error fetching user lists:", error);
    throw error; // Rethrow the error to be caught by the calling function
  }
}

// Route to fetch all lists associated with a specific user ID
app.get("/lists/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const userLists = await getUserLists(userId);
    res.status(200).json(userLists);
  } catch (error) {
    console.error("Failed to fetch user lists:", error);
    res.status(500).json({ message: "Failed to fetch user lists" });
  }
});
// Function to create a user account
async function createUser(userData) {
  try {
    // Ensure client is connected before running operations
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }
    const usersCollection = client.db("Cluster0").collection("users");
    const result = await usersCollection.insertOne(userData);
    return result;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error; // Rethrow the error to be caught by the calling function
  }
}
//logging in
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body; // Correctly extracting username and password
    const usersCollection = client.db("Cluster0").collection("users");
    const user = await usersCollection.findOne({
      username: username,
      password: password,
    });
    if (user) {
      // If user is found, you can generate a token or session for authentication
      res.status(200).json({ message: "Login successful", userId: user._id });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Failed to login user:", error);
    res.status(500).json({ message: "Failed to login user" });
  }
});
// Route to fetch user data based on user ID
app.get("/users/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Convert userId string to ObjectId
    const objectId = new ObjectId(userId);

    const usersCollection = client.db("Cluster0").collection("users");

    // Query the database using ObjectId
    const user = await usersCollection.findOne({ _id: objectId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
});
// Route to handle user creation
app.post("/users", async (req, res) => {
  try {
    const newUser = req.body; // Assuming the request body contains user data
    const result = await createUser(newUser);
    res.status(201).json({
      message: "User created successfully",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Failed to create user:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
});

// Function to run the server
async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    // Start the server after successful connection
    const PORT = process.env.PORT || 3013;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

// Run the server
run().catch(console.dir);
