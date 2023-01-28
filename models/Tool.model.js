const { Schema, model } = require('mongoose');
 
const toolSchema = new Schema(
  // Add whichever fields you need for your app
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Username is required.'],
      unique: true
    },
    description: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true
    },
    url: {
      type: String,
      required: [true, 'Password is required.']
    },
    image: {
        type: String,
        required: [true, 'Password is required.']
      },
    owner: {
        type: String,
        required: [true, 'Password is required.']
      }

  },
  {
    timestamps: true
  }
);
 
const Tool = model('Tool', toolSchema);
module.exports = Tool;