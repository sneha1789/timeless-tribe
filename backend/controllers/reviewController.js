const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { uploadToCloudinary } = require('../utils/cloudinary');

const addReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const product = await Product.findById(req.params.productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString(),
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer),
    );
    const uploadResults = await Promise.all(uploadPromises);
    imageUrls = uploadResults.map((result) => result.secure_url);
  }

  const isFullyVerified = req.user.isEmailVerified && req.user.isMobileVerified;

  const review = {
    user: req.user._id,
    userName: req.user.name,
    rating: Number(rating),
    title,
    comment,
    images: imageUrls,
    isVerified: isFullyVerified,
  };

  product.reviews.push(review);

  await product.save();

  const createdReview = product.reviews[product.reviews.length - 1];

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    review: createdReview,
  });
});

const getProductReviews = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (product) {
    res.json({ success: true, reviews: product.reviews });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

const updateReview = asyncHandler(async (req, res) => {
  const { rating, title, comment, existingImages } = req.body;

  const product = await Product.findOne({ 'reviews._id': req.params.reviewId });

  if (!product) {
    res.status(404);
    throw new Error('Review not found');
  }

  const review = product.reviews.id(req.params.reviewId);

  if (review.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this review');
  }

  let finalImageUrls = existingImages
    ? Array.isArray(existingImages)
      ? existingImages
      : [existingImages]
    : [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer),
    );
    const uploadResults = await Promise.all(uploadPromises);
    const newImageUrls = uploadResults.map((result) => result.secure_url);
    finalImageUrls = [...finalImageUrls, ...newImageUrls];
  }

  review.rating = rating || review.rating;
  review.title = title || review.title;
  review.comment = comment || review.comment;
  review.images = finalImageUrls;

  const updatedProduct = await product.save();
  const updatedReview = updatedProduct.reviews.id(req.params.reviewId);

  res.json({ success: true, message: 'Review updated', review: updatedReview });
});

const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const product = await Product.findOne({ 'reviews._id': reviewId });

  if (!product) {
    res.status(404);
    throw new Error('Review not found.');
  }

  const review = product.reviews.find((r) => r._id.toString() === reviewId);

  if (!review || review.user.toString() !== userId.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this review.');
  }

  await product.updateOne({
    $pull: { reviews: { _id: reviewId } },
  });

  const updatedProduct = await Product.findById(product._id);
  updatedProduct.updateProductRating();
  await updatedProduct.save();

  res.json({ success: true, message: 'Review deleted successfully' });
});

const markReviewHelpful = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { helpful } = req.body;
  const userId = req.user._id;

  const product = await Product.findOne({ 'reviews._id': reviewId });

  if (!product) {
    res.status(404);
    throw new Error('Review not found');
  }

  const review = product.reviews.id(reviewId);
  const voteType = helpful ? 'helpful' : 'notHelpful';
  const oppositeVoteType = helpful ? 'notHelpful' : 'helpful';

  const existingVoteIndex = review.voters.findIndex(
    (voter) => voter.userId.toString() === userId.toString(),
  );

  if (existingVoteIndex > -1) {
    const existingVote = review.voters[existingVoteIndex];

    if (existingVote.vote === voteType) {
      review[voteType]--;
      review.voters.splice(existingVoteIndex, 1);
    } else {
      review[existingVote.vote]--;
      review[voteType]++;
      existingVote.vote = voteType;
    }
  } else {
    review[voteType]++;
    review.voters.push({ userId, vote: voteType });
  }

  await product.save();

  res.json({
    success: true,
    message: 'Vote recorded',
    helpfulCount: review.helpful,
    notHelpfulCount: review.notHelpful,
  });
});

const getTopReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;

    const topReviews = await Product.aggregate([
      { $unwind: '$reviews' },
      { $sort: { 'reviews.rating': -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'reviews.user',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $project: {
          _id: '$reviews._id',
          rating: '$reviews.rating',
          title: '$reviews.title',
          comment: '$reviews.comment',
          userName: '$reviews.userName',
          profilePicture: { $arrayElemAt: ['$userDetails.profilePicture', 0] },

          user: {
            isEmailVerified: {
              $arrayElemAt: ['$userDetails.isEmailVerified', 0],
            },
            isPhoneVerified: {
              $arrayElemAt: ['$userDetails.isMobileVerified', 0],
            },
          },
        },
      },
    ]);

    res.json(topReviews);
  } catch (error) {
    console.error('Error fetching top reviews:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getTopReviews,
};
