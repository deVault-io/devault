const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const User = require('../models/User.model');
const MONGO_URL = 'mongodb+srv://admin:admin@cluster0.bm9ztay.mongodb.net/devault-app-db';
const users = require('../data/users');

mongoose.connect(MONGO_URL)
  .then(response => { console.log(`Connected to the database ${response.connection.name}`)
  return User.deleteMany();
})
  .then(() => {
    return User.create(users)
  })
  .then(createdUsers => console.log(`Inserted ${createdUsers.length} lists in the database`))
  .then(() => mongoose.connection.close())
  .catch(err => console.error(err))