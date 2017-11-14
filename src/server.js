const bodyParser = require('body-parser');
const express = require('express');

const STATUS_OK = 200;
const STATUS_NOT_FOUND = 404;
const STATUS_USER_ERROR = 422;
const STATUS_SERVER_ERROR = 500;

const sendUserError = (msg, res) => {
  res.status(STATUS_USER_ERROR);
  res.json({ Error: msg });
  return;
};

// This array of posts persists in memory across requests. Feel free
// to change this to a let binding if you need to reassign it.
const posts = [];

const server = express();
// to enable parsing of json bodies for post requests
server.use(bodyParser.json());

// TODO: your code to handle requests
server.get('/posts', (req, res) => {
  const term = req.query.term;
  if (!term) {
    const returnedPosts = posts;
    res.status(STATUS_OK).json(returnedPosts);
  } else {
    const filteredPosts = posts.filter(post => post.contents.toLowerCase().includes(term) || post.title.toLowerCase().includes(term));
    res.status(STATUS_OK).json(filteredPosts);
  }
});

server.get('/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const filteredPosts = posts.filter(post => post.id === id);
  if (filteredPosts.length === 0) {
    return sendUserError('No post with that ID in database', res);
  }
  res.status(STATUS_OK).json(filteredPosts);
});

let postId = 1;
server.post('/posts', (req, res) => {
  const { title, contents } = req.body;
  const newPost = { title, contents, id: postId };
  if (!title || !contents) {
    return sendUserError(
        'Title & Contents are Required. Please try again.',
        res
    );
  }

  posts.push(newPost);
  postId++;
  res.json(newPost);
});

server.put('/posts', (req, res) => {
  const { id, title, contents } = req.body;
  if (!id || !title || !contents) {
    return sendUserError(
        'ID, Title, & Contents are Required. Please try again.',
        res
    );
  }
  const findPostById = (post) => {
    return post.id === id;
  };
  const foundPost = posts.find(findPostById);
  if (!foundPost) {
    return sendUserError('No post found with that ID', res);
  } else {
    if (title) foundPost.title = title;
    if (contents) foundPost.contents = contents;
    res.json(foundPost);
  }
});

server.delete('/posts', (req, res) => {
  const { id } = req.id;
  let foundPost;
  const findPostById = (post) => {
    foundPost = post;
    return post.id === id;
  };
  if (posts.find(findPostById)) {
    posts.forEach((post, i) => {
      if (post.id === id) {
        posts.splice(i, 1);
        return res.status(200).json({ success: true });
      }
    });
  } else {
    return sendUserError('No post with that ID exists', res);
  }
});

module.exports = { posts, server };
