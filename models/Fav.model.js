const { Schema, model } = require('mongoose');
 
const favSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'List name is required.'],
      default: 'My Favorites'
    },
    image: {
      type: String,
      trim: true
    },
    list: {
      
    },
    tool:{

    }
  },
  {
    timestamps: true
  }
);
 
const Fav = model('Fav', favSchema);
module.exports = Fav;
