const { Schema, model } = require('mongoose');
 
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
 
const Review = model('Review', reviewSchema);
module.exports = Review;