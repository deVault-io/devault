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


