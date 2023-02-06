const { Schema, model, SchemaType } = require('mongoose');
 
const userSchema = new Schema(
  // Add whichever fields you need for your app
  {
    username: {
      type: String,
      trim: true,
      /* required: [true, 'Username is required.'], */
      unique: true
    },
    email: { 
      type: String,
      /* required: [true, 'Please add a valid email'], */
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
    },
    hashedPassword: {
      type: String,
      /* required: [true, 'Please add a password'] */
    },
    image: {
      type: String,
    },
    aboutMe:{
      type: String,
    }, 
    googleID: {
      type: String, 
    },
    darkMode:{
      type: Boolean,
      default: false,
    },
    list: {
      type: Schema.Types.ObjectId,
      ref: 'List'
    },
    status:{
      type: String,
      enum : ['ACTIVE','DELETED'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);
 
const User = model('User', userSchema);

module.exports = User;