const { Schema, model } = require('mongoose');
 
const listSchema = new Schema(
  {
    default: {
      type: Boolean,
      default: false,
    },
    listName: {
      type: String,
      trim: true,
      required: [true, 'List name is required.'],
      default: 'My Favourites',
    },
    image: {
      type: String,
      default: 'https://i.imgur.com/ExgDzpE.png',
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
  },
  {
    timestamps: true
  }
);
 
const List = model('List', listSchema);
module.exports = List;
