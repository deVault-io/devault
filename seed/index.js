const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const Tool= require('../models/Tool.model');
const MONGO_URL = 'mongodb+srv://admin:admin@cluster0.bm9ztay.mongodb.net/devault-app-db';
const tools= require('../data/tools');

mongoose.connect(MONGO_URL)
  .then(response => { console.log(`Connected to the database ${response.connection.name}`)
  return Tool.deleteMany();
})

  .then(() => {
    return Tool.create(tools)
  })
  .then(createdTools => console.log(`Inserted ${createdTools.length} tools in the database`))
  .then(() => mongoose.connection.close())
  .catch(err => console.error(err))