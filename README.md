# Devault
<p align="center">
<img width="100%" src="https://i.imgur.com/ERXlgdx.png">
</p>

## Description

This is a project devoloped by Guillermo García and Jorge Méndez for the second module at Ironhack Fullstack web developmenet bootcamp. The purpose of this webapp is to save,comment,rate and share your web development/design tools. 

## Wireframes & concept board

<p align="center">
<img width="100%" src="https://i.imgur.com/iepIstu_d.jpg?maxwidth=520&shape=thumb&fidelity=high">
</p>

## User stories (MVP)
Tribe stories
- User can sign up and create and account
- User can login
- User can log out
- User can post a new Tool
- User can edit (title,field,category image and description) of posted tool
- User can delete a tool


## User stories (Backlog)

- User can see related tools according the tool description that is seeing
- User can comment a tool
- User delete and edit a comment
- User can add a tool to favorites
- User can create personalized lists
- User can rate tools 
- User can use an advanced search filter

## Models
  User Model
  ```js
  const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: [true, 'Username is required.'],
      unique: true
    },
    email: { 
      type: String,
      required: [true, 'Please add a valid email'],
      unique: [true, 'Email already registered'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
    },
    hashedPassword: {
      type: String,
      required: [true, 'Please add a password'] 
    },
    image: {
      type: String,
      default: 'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg'
    },
    aboutMe:{
      type: String,
    }, 
    googleID: {
      type: String, 
    },
    source: {
      type: String,
      default: 'deVault' 
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
  ```
  List Model
  ```js
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
      default: 'BackBkg',
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

  Favourite Model
```js 

const favSchema = new Schema(
  {
    tool: {
        type: Schema.Types.ObjectId,
        ref: 'Tool'
      },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    list: {
      type: Schema.Types.ObjectId,
      ref: 'List',
    }
  },
  {
    timestamps: true
  }
);
 
```


