const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const Post = require('./models/NewPost')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads/" });
const fs = require('fs')

const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

app.use(express.json());

app.use(cookieParser());

app.use('/uploads', express.static(__dirname+'/uploads'))

mongoose
  .connect(
    "mongodb+srv://sivajirayapu:bpW0dYM3E9ck7JbI@cluster0.hgke5wy.mongodb.net/?retryWrites=true&w=majority"
  )
  .then((success) => console.log("Db Connected"))
  .catch((e) => console.log(e.message));

const salt = bcrypt.genSaltSync(10);

const secrete = "SivajiRayapu";

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  //console.log(username, password)
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(400).json(e);
  }
});

app.post("/login", async (req, res) => {
  // console.log('Sivaji Login')
  const { username, password } = req.body;
  const userData = await User.findOne({ username });
  const comparePassword = bcrypt.compareSync(password, userData.password);

  if (comparePassword) {
    jwt.sign({ username, id: userData.id }, secrete, {}, (error, token) => {
      res.cookie("token", token).json({
        id: userData._id,
        username,
      });
    });
  } else {
    res.status(400).json("wrong credentials");
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;

  jwt.verify(token, secrete, {}, (error, info) => {
    if (error) {
      res.json(error);
    }
    res.json(info);
  });

  // res.json(req.cookies)
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("Token is empty");
});



app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
    const {originalname, path} = req.file
    const part = originalname.split('.')
    const ext = part[part.length - 1]
    const newPath = path+'.'+ext
    fs.renameSync(path, newPath)

    const { token } = req.cookies;

    jwt.verify(token, secrete, {}, async (error, info) => {
      if (error) {
        res.json(error);
      }
      const {title, summary, content} = req.body
      const postDoc = await Post.create({
          title,
          summary,
          content,
          cover: newPath,
          author: info.id
      })
      res.json(postDoc);
    });


});


app.put('/post', uploadMiddleware.single("file"), (req, res) => {
  let newPath = null
  if (req.file){
    const {originalname, path} = req.file
    const part = originalname.split('.')
    const ext = part[part.length - 1]
    newPath = path+'.'+ext
    fs.renameSync(path, newPath)
  }

  const { token } = req.cookies;

  jwt.verify(token, secrete, {}, async (error, info) => {
    if (error) {
      res.json(error);
    }
    const {id, title, summary, content} = req.body
    const postDoc = await Post.findById(id)
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id)

    if (!isAuthor){
      return res.status(400).json('you are not author')
    }

    await postDoc.updateOne({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover
    })

    res.json(postDoc);
  });


})


app.get('/post', async (req, res) => {
  res.json(await Post.find()
  .populate('author', ['username'])
  .sort({createdAt: -1})
  .limit(20)
  )
})


app.get('/post/:id', async (req,res) => {
  const {id} = req.params
  const userDoc = await Post.findById(id).populate('author', ['username'])
  res.json(userDoc)
})

app.delete('/post/:id', async (req, res) => {
  const {id} = req.params
  
  const { token } = req.cookies;

  jwt.verify(token, secrete, {}, async (error, info) => {
    if (error) {
      res.json(error);
    }
    // const {id, title, summary, content} = req.body

    const postDoc = await Post.findById(id)
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id)

    if (!isAuthor){
      return res.status(400).json('you are not author')
    }

    await postDoc.deleteOne({
      _id:id
    })

    res.json('Post Deleted');
  });
  // res.json(userDoc)
})



app.listen(4000, () => {
  console.log("Server Running at Localhost:4000");
});

//bpW0dYM3E9ck7JbI
//mongodb+srv://sivajirayapu:bpW0dYM3E9ck7JbI@cluster0.hgke5wy.mongodb.net/?retryWrites=true&w=majority
