const { Schema, model } = require('mongoose');
 
const favSchema = new Schema(
  {
    tool: {
        type: [Schema.Types.ObjectId],
        ref: 'Tool'
      },
      //IS USER INCLUDED HERE OR DOES IT COME VIA LIST WHERE USER ID IS ALSO REFERRED
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
  },
  {
    timestamps: true
  }
);
 
const Fav = model('Fav', favSchema);
module.exports = Fav;
