if(process.env.NODE_ENV != "production"){
require('dotenv').config();
}


const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsmate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const listings=require("./routes/listing.js");
const session=require("express-session");
const mongoStore=require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const userRoute=require("./routes/user.js");
const dbUrl=process.env.ATLASDB_URL
 main().then(()=>{
    console.log("connected to db");

 }).catch((err)=>{
    console.log(err);
 })
async function main(){
     await mongoose.connect(dbUrl)
}
const Store=mongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});
const sessionOptions ={
    Store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

const reviews=require("./routes/review.js");

app.use(express.static('public'));

app.use(methodOverride("_method"));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.engine('ejs',ejsmate);

app.listen(8080,()=>{
    console.log("server is listening");
})
app.use("/listings",listings);
app.use("/",userRoute);





app.use("/listings/:id/reviews",reviews);


app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!!"));
})

app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong!" } = err;
    if (req.accepts("html")) {
        res.status(status).render("error.ejs", { message });
    } else {
        res.status(status).json({ error: message });
    }
});

