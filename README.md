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
  Tool Model
  ```js
  const toolSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Tool Name is required.'],
      unique: true
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
      lowercase: true,
      trim: true
    },
    url: {
      type: String,
      required: [true, 'URL is required.']
    },
    imageFile: {
      type: String,
      default:'https://i.imgur.com/ExgDzpE.png',
    }, 
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    field:{
        type: [String],
        enum : ['UX UI','Front End','Data Science','Back End','Task Management','Mobile','Cloud Computing','DevOps', 'Cyber Security','Machine Learning','Other','Blockchain','Productivity'],
        required:true,
    },
    tag:{
        type: [String],
        enum : ['AI powered','Open Source','Color Theory','3D','Code Assistant','Investment','Story teller','Text processer','CSS3','HTML','Javascript','Python','Educational','Learning Resources','Documentation','Productivity','Presentations','Low-Code/No-Code','Inspiration','Community','Graphic design','Testing tool'],
        required:true,
        min: [3, 'At least 3 tags are required.']
    },
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
```
Votes Model
```js
const voteSchema = new Schema(
  {
    tool: {
        type: Schema.Types.ObjectId,
        ref: 'Tool'
      },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: [true, 'Please rate'],
      default: 5,
    },
  },
  {
    timestamps: true
  }
);
```
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
Reviews Model

```js 
const reviewSchema = new Schema(
  {
    tool: {
        type: Schema.Types.ObjectId,
        ref: 'Tool'
      },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    review: {
      type: String,
      required: [true, 'Please write a review'],
    },
  },
  {
    timestamps: true
  }
);
```
User Routes 
| Description                   | Method | Route               | Access  | req.body or req.params            |
|-------------------------------|--------|---------------------|---------|-----------------------------------|
| Profile view                  | GET    | `/profile`          | Private |                                   |
| Edit profile view             | GET    | `/profile/edit`     | Private |                                   |
| Edit profile view post        | POST   | `/profile/edit`     | Private | `{ username, email }`             |
| Edit profile avatar view      | GET    | `/profile/editAvatar`| Private |                                   |
| Edit profile avatar view post | POST   | `/profile/editAvatar`| Private | `{ image }` (file in req.file.path)|
| Lists of favorites view       | GET    | `/profile/lists`    | Private |                                   |
| Delete profile                | GET    | `/profile/delete`   | Private |                                   |

Tool Routes 

| Description                                  | Method | Route                           | Access  | req.body or req.params                 |
|----------------------------------------------|--------|---------------------------------|---------|----------------------------------------|
| New tool view                                | GET    | `/tools/new`                    | Private |                                        |
| My tools view                                | GET    | `/tools/myTools`                | Private |                                        |
| Discover tools view                          | GET    | `/tools/discover`               | Public  |                                        |
| Tool detail view                             | GET    | `/tools/:toolId`                | Public  | `{ toolId }`                           |
| Create a new tool                            | POST   | `/tools/new`                    | Private | `{ name, description, image, url, field, tag }` (file in req.file.path) |
| Edit one tool form                           | POST   | `/tools/:toolId/edit`           | Private | `{ toolId, name, description, image, url, field, tag }` |
| Delete one tool                              | GET    | `/tools/:toolId/delete`         | Private | `{ toolId }`                           |
| Take inputs from the search form             | POST   | `/tools/finesearch`             | Public  | `{ textToSearch, nameToSearch, fieldToSearch, tagToSearch, timeToSearch, rating }` |
| Takes inputs from params                     | GET    | `/tools/tools/search/:itemToSearch`| Public  | `{ itemToSearch }` |
| Edit one list form                           | POST   | `/tools/:toolId/vote`           | Private | `{ toolId, rating, secondRating }`    |
| Post new review                              | POST   | `/tools/:toolId/review`         | Private | `{ toolId, review }`                  |
| Edit one review view                         | GET    | `/tools/:toolId/:reviewId/edit` | Private | `{ toolId, reviewId }`                |
| Edit one review form                         | POST   | `/tools/:toolId/:reviewId/edit` | Private | `{ toolId, reviewId, review }`        |
| Delete one review                            | GET    | `/tools/:toolId/:reviewId/delete`| Private | `{ toolId, reviewId }`                |

List/Fav routes

| Description                             | Method | Route                   | Access  | req.body or req.params            |
|-----------------------------------------|--------|-------------------------|---------|------------------------------------|
| Lists of favorites view                 | GET    | `/`                     | Private |                                    |
| New list view                           | GET    | `/new`                  | Private |                                    |
| Create a new list                       | POST   | `/new`                  | Private | `{ listName, image }` (file in req.file.path) |
| Get one list                            | GET    | `/:listId`              | Private | `{ listId }`                      |
| Tool select list to add                 | GET    | `/:toolId/fav`          | Private | `{ toolId }`                      |
| Add one tool to fav                     | GET    | `/:toolId/:listId/add`  | Private | `{ toolId, listId }`              |
| Tools to add to list                    | GET    | `/:listId/add`          | Private | `{ listId }`                      |
| Take inputs from the search form        | POST   | `/:listId/search`       | Public  | `{ listId, textToSearch, nameToSearch, fieldToSearch, tagToSearch, timeToSearch }` |
| Edit one list view                      | GET    | `/lists/:listId/edit`   | Private | `{ listId }`                      |
| Edit one list form                      | POST   | `/lists/:listId/edit`   | Private | `{ listId, listName, image }`     |
| Delete one list                         | GET    | `/lists/:listId/delete` | Private | `{ listId }`                      |

Index route

| Description                             | Method | Route                   | Access  | req.body or req.params            |
|-----------------------------------------|--------|-------------------------|---------|------------------------------------|
| App home page                           | GET    | `/`                     | Public  |                                    |

Auth Routes
| Description                                  | Method | Route                             | Access   | req.body or req.params                        |
|----------------------------------------------|--------|-----------------------------------|----------|----------------------------------------------|
| Displays form view to sign up                | GET    | `/auth/signup`                    | Public   |                                              |
| Sends user auth data to create a new user    | POST   | `/auth/signup`                    | Public   | `username, email, password, image, aboutMe`  |
| Displays form view to log in                 | GET    | `/auth/login`                     | Public   |                                              |
| Sends user auth data to authenticate user    | POST   | `/auth/login`                     | Public   | `email, password`                            |
| Displays form view to Login PassportJS       | GET    | `/auth/passportLogin`             | Public   |                                              |
| Sends user auth data to authenticate user    | POST   | `/auth/passportLogin`             | Public   | `email, password`                            |
| Authenticates google loggin                  | GET    | `/auth/google`                    | Public   |                                              |
| Authenticates google loggin                  | GET    | `/auth/google/callback`           | Public   |                                              |
| Destroy user session and log out             | GET    | `/auth/logout`                    | Private  |                                              |


## Useful links

- [Github Repo](https://github.com/deVault-io/devault)
- [Trello](https://github.com/deVault-io/devault)
- [Deployed version](https://devault-app.fly.dev/)

## Screenshots

## Screenshots

<p align="center">
<img width="60%" src="https://i.imgur.com/3MAO4JX_d.jpg">
</p>
<p align="center">
<img width="60%" src="https://i.imgur.com/ILGkCXZ_d.jpg">
</p>
<p align="center">
<img width="60%" src="https://i.imgur.com/IjqJEjM_d.jpg">
</p>


