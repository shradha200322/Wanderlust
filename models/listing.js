const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review.js");
const User=require("./user.js");

const listingSchema= new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
        default:"https://img.freepik.com/free-photo/stunning-fantasy-videogame-landscape_23-2150927865.jpg?t=st=1727793250~exp=1727796850~hmac=51b585737cdd2842a2bb46cb68b3a410788a4437c3b8b0c8aa39a0db22d66c37&w=360",
        type:String,
        set: (v)=>v === ""? "https://img.freepik.com/free-photo/stunning-fantasy-videogame-landscape_23-2150927865.jpg?t=st=1727793250~exp=1727796850~hmac=51b585737cdd2842a2bb46cb68b3a410788a4437c3b8b0c8aa39a0db22d66c37&w=360":v,
      
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ],
    owner:{
        type: Schema.Types.ObjectId,
        ref:"User",
    },
});

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in:listing.reviews}})
    }
})

const Listing=mongoose.model("Listing",listingSchema);

module.exports=Listing;