require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const api = require('./routes/api');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', api);

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/studybuddy';

mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log('Server running on port', PORT));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
