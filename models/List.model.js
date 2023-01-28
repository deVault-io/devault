const { Schema, model } = require('mongoose');
 
const listSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'List name is required.'],
      unique: true
    },
    image: {
      type: String,
      trim: true
    },
    owner: {
      
    }
  },
  {
    timestamps: true
  }
);
 
const List = model('List', listSchema);
module.exports = List;
