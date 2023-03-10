const { Schema, model } = require('mongoose');
 
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
  },
  {
    timestamps: true
  }
);
 
const Tool = model('Tool', toolSchema);
module.exports = Tool;