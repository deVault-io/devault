const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const Favs = require('../models/Favs.model');
const MONGO_URL = 'mongodb+srv://admin:admin@cluster0.bm9ztay.mongodb.net/devault-app-db';
const tools= require('../data/favs');

mongoose.connect(MONGO_URL)
  .then(response => { console.log(`Connected to the database ${response.connection.name}`)
  return Favs.deleteMany();
})
  .then(() => {
    return Favs.create(tools)
  })
  .then(createdFavs => console.log(`Inserted ${createdFavs.length} favs in the database`))
  .then(() => mongoose.connection.close())
  .catch(err => console.error(err))