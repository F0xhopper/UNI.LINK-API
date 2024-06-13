This project is an Express application connected to a MongoDB database, providing a set of RESTful APIs for managing lists, comments, likes, and users.

Features

User Management: Create, read, update, and delete user accounts.

List Management: Create, read, update, and delete lists.

Comment Management: Add, edit, and delete comments on lists.

Like Management: Toggle likes on lists.

Link Management: Add and delete links associated with lists.

Usage

Clone repo:

git clone https://github.com/F0xhopper/UNI.LINK-API
cd UNI.LINK-API

Install dependencies:

npm install

Add MONGODB URI to .env:

URI_MONGO=mongodb+srv://<username>:<password>@cluster0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority

Start server:

npm start
