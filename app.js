// Import required modules
import express from "express";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";
import cheerio from "cheerio";
// Create Express app
const app = express();
app.use(bodyParser.json({ limit: "10mb" }));
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
async function addCommentToList(listId, commentData) {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }
    const listsCollection = client.db("Cluster0").collection("lists");

    const result = await listsCollection.updateOne(
      { _id: listId },
      { $push: { comments: commentData } }
    );
    return result;
  } catch (error) {
    console.error("Error adding comment to list:", error);
    throw error;
  }
}
app.post("/lists/:listId/comments", async (req, res) => {
  try {
    const listId = new ObjectId(req.params.listId);
    const commentData = req.body;
    const result = await addCommentToList(listId, commentData);
    res.status(201).json({ message: "Comment added to the list", result });
  } catch (error) {
    console.error("Failed to add comment to list:", error);
    res.status(500).json({ message: "Failed to add comment to list" });
  }
});
async function addLikeToList(listId, username) {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }
    const listsCollection = client.db("Cluster0").collection("lists");

    const result = await listsCollection.updateOne(
      { _id: listId },
      { $addToSet: { likes: username } } // Use $addToSet to add username only if it's not already in the array
    );
    return result;
  } catch (error) {
    console.error("Error adding like to list:", error);
    throw error;
  }
}
app.post("/lists/:listId/like", async (req, res) => {
  try {
    const listId = new ObjectId(req.params.listId);
    const { username } = req.body; // Assuming the username is sent in the request body
    const result = await addLikeToList(listId, username);
    res.status(201).json({ message: "Like added to the list", result });
  } catch (error) {
    console.error("Failed to add like to list:", error);
    res.status(500).json({ message: "Failed to add like to list" });
  }
});
async function getPageTitle(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const title = $("title").text();

    return title;
  } catch (error) {
    console.error("Error retrieving page title:", error);
    throw error;
  }
}
async function addLinkToList(listId, linkData) {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }
    const listsCollection = client.db("Cluster0").collection("lists");
    const title = await getPageTitle(linkData.link_url);
    linkData.link_name = title;

    const result = await listsCollection.updateOne(
      { _id: listId },
      { $push: { links: linkData } }
    );
    return result;
  } catch (error) {
    console.error("Error adding link to list:", error);
    throw error;
  }
}

// Route to handle adding a new link to a list
app.post("/lists/:listId/links", async (req, res) => {
  try {
    const listId = new ObjectId(req.params.listId);
    const linkData = req.body;
    const result = await addLinkToList(listId, linkData);
    res.status(201).json({ message: "Link added to the list", result });
  } catch (error) {
    console.error("Failed to add link to list:", error);
    res.status(500).json({ message: "Failed to add link to list" });
  }
});
async function deleteLinkFromList(listId, linkUrl) {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }
    const listsCollection = client.db("Cluster0").collection("lists");

    const result = await listsCollection.updateOne(
      { _id: listId },
      { $pull: { links: { link_url: linkUrl } } } // Remove the link with the specified link_url
    );
    return result;
  } catch (error) {
    console.error("Error deleting link from list:", error);
    throw error;
  }
}

// Route to handle deleting a link from a list by its URL
app.delete("/lists/:listId/links/:linkUrl", async (req, res) => {
  try {
    const listId = new ObjectId(req.params.listId);
    const linkUrl = req.params.linkUrl;

    const result = await deleteLinkFromList(listId, linkUrl);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Link not found in the list" });
    }
    res.json({ message: "Link deleted from the list" });
  } catch (error) {
    console.error("Failed to delete link from list:", error);
    res.status(500).json({ message: "Failed to delete link from list" });
  }
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
async function updateListDetails(listId, updatedData) {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }
    const listsCollection = client.db("Cluster0").collection("lists");

    const result = await listsCollection.updateOne(
      { _id: listId },
      {
        $set: {
          list_name: updatedData.name,
          list_description: updatedData.description,
          image: updatedData.image,
          list_public: updateListDetails.public,
        },
      }
    );
    return result;
  } catch (error) {
    console.error("Error updating list details:", error);
    throw error;
  }
}

// Route to handle updating list details
app.put("/lists/:listId/edit", async (req, res) => {
  try {
    const listId = new ObjectId(req.params.listId);
    const updatedData = req.body;
    const result = await updateListDetails(listId, updatedData);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "List not found" });
    }
    res.json({ message: "List details updated successfully" });
  } catch (error) {
    console.error("Failed to update list details:", error);
    res.status(500).json({ message: "Failed to update list details" });
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
async function getUserLikedLists(userId) {
  try {
    // Ensure client is connected before running operations
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }
    const listsCollection = client.db("Cluster0").collection("lists");
    const userLikedLists = await listsCollection
      .find({ likes: userId })
      .toArray();
    return userLikedLists;
  } catch (error) {
    console.error("Error fetching user liked lists:", error);
    throw error; // Rethrow the error to be caught by the calling function
  }
}

// Route to fetch all lists liked by a specific user
app.get("/lists/liked/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const userLikedLists = await getUserLikedLists(userId);
    res.status(200).json(userLikedLists);
  } catch (error) {
    console.error("Failed to fetch user liked lists:", error);
    res.status(500).json({ message: "Failed to fetch user liked lists" });
  }
});
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
async function getAllPublicLists() {
  try {
    // Ensure client is connected before running operations
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }
    const listsCollection = client.db("Cluster0").collection("lists");
    const publicLists = await listsCollection
      .find({ list_public: true })
      .toArray();
    return publicLists;
  } catch (error) {
    console.error("Error fetching user lists:", error);
    throw error; // Rethrow the error to be caught by the calling function
  }
}

// Route to fetch all public lists
app.get("/listss/public", async (req, res) => {
  try {
    const publicLists = await getAllPublicLists();
    res.status(200).json(publicLists);
  } catch (error) {
    console.error("Failed to fetch public lists:", error);
    res.status(500).json({ message: "Failed to fetch public lists" });
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
