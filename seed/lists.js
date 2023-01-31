const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const Lists = require('../models/Lists.model');
const MONGO_URL = 'mongodb+srv://admin:admin@cluster0.bm9ztay.mongodb.net/devault-app-db';
const lists = require('../data/lists');

mongoose.connect(MONGO_URL)
  .then(response => { console.log(`Connected to the database ${response.connection.name}`)
  return Lists.deleteMany();
})
  .then(() => {
    return Lists.create(lists)
  })
  .then(createdLists => console.log(`Inserted ${createdLists.length} lists in the database`))
  .then(() => mongoose.connection.close())
  .catch(err => console.error(err))