const express=require("express");
const router=express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {reviewSchema} =require("../schema.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const { isloggedIn } = require("../middleware.js");
const { isReviewAuthor } = require("../middleware.js");

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errorMessage = error.details.map(err => err.message).join(", ");
        throw new ExpressError(400, errorMessage);
    }
    next();
};
router.post("/",isloggedIn,validateReview,wrapAsync(async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);
    newReview.author=req.user._id;
     listing.reviews.push(newReview);
     await newReview.save();
     await listing.save();
     req.flash("success","New review created");
      res.redirect(`/listings/${listing._id}`);
 }))
 
router.delete("/:reviewId",isloggedIn,isReviewAuthor,wrapAsync(async(req,res)=>{
     let{id,reviewId}=req.params;
     await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
     await Review.findByIdAndDelete(reviewId);
     req.flash("success","Review deleted!");
     res.redirect(`/listings/${id}`);
 }))

 module.exports=router;