const express=require("express");
const router=express.Router();
const Listing=require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema} =require("../schema.js");
const {isloggedIn}=require("../middleware.js");
const multer=require("multer");
const {storage}=require("../cloudConfig.js");
const upload=multer({storage});
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errorMessage = error.details.map(err => err.message).join(", ");
        throw new ExpressError(400, errorMessage);
    }
    next();
};

router.get("/",wrapAsync(async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));
router.get("/new",isloggedIn,(req,res)=>{
   res.render("listings/new.ejs")
});
router.put("/:id", isloggedIn, upload.single("listing[image]"), validateListing, wrapAsync(async (req, res) => {
   let { id } = req.params;
   const listing = await Listing.findById(id);
   
   if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
   }

   // Update listing details
   listing.set(req.body.listing);

   // If a new image is uploaded, update it
   if (req.file) {
      listing.image = req.file.path;
   }

   await listing.save();
   req.flash("success", "Listing Updated!");
   res.redirect(`/listings/${id}`);
}));


// router.post("/",validateListing,wrapAsync(async(req,res,next)=>{
//    const  newlisting=new Listing(req.body.listing);
//    newlisting.owner=req.user._id;
//    await newlisting.save();
//    req.flash("success","New Listing Created!");
//    res.redirect("/listings");

// }));
router.post("/", isloggedIn, upload.single("listing[image]"), validateListing, wrapAsync(async(req, res) => {
   const newListing = new Listing(req.body.listing);
   newListing.owner = req.user._id;
   newListing.image = req.file.path; // Store the image URL
   await newListing.save();
   req.flash("success", "New Listing Created!");
   res.redirect("/listings");
}));


router.get("/:id",wrapAsync(async (req,res)=>{
   let {id} =req.params;
   const listing1=await Listing.findById(id).populate({
      path:"reviews",
      populate:{
         path:"author",
      },
   }).populate("owner");
   if(!listing1){
     req.flash("error","Listing you requested for does not exist!");
     res.redirect("/listings")
   }   
   res.render("listings/show.ejs",{listing1});
}));

router.get("/:id/edit",isloggedIn,wrapAsync(async(req,res)=>{
let {id}=req.params;
const listing=await Listing.findById(id);
req.flash("success","Listing Updated!");
if(!listing){
   req.flash("error","Listing you requested for does not exist!");
   res.redirect("/listings")
 }  
res.render("listings/edit.ejs",{listing});
}));

router.delete("/:id",isloggedIn,wrapAsync(async (req,res)=>{
   let {id}=req.params;
   await Listing.findByIdAndDelete(id);
   req.flash("success","Listing Deleted!");
   res.redirect("/listings");
}));

// router.post("/uploads", upload.single("Listing[image]"), (req, res) => {
//    res.send(req.file);
// });
const { isValidObjectId } = require("mongoose");

router.get("/listings/location", async (req, res) => {
   let { location } = req.query;
 
   if (!location) {
     req.flash("error", "Please enter a valid location!");
     return res.redirect("/listings");
   }
 
   try {
     const escapedLocation = escapeStringRegexp(location); // Sanitize input
     const listings = await Listing.find({
       location: { $regex: new RegExp(escapedLocation, "i") },
     });
 
     if (!listings.length) {
       req.flash("error", `No listings found for "${location}"!`);
       return res.redirect("/listings");
     }
 
     res.render("listings/index.ejs", { listings });
   } catch (error) {
     console.error("Error fetching listings:", error);
     res.status(500).json({ error: "Internal Server Error" });
   }
 });
module.exports=router;