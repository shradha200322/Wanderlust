const mongoose=require("mongoose");
const initData=require("./data.js");
const listing=require("../models/listing.js");

main().then(()=>{
    console.log("connected to db");

 }).catch((err)=>{
    console.log(err);
 })
async function main(){
     await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
}

const initDB=async()=>{
    await listing.deleteMany({});
    const updatedData=initData.data.map((obj)=>({
        ...obj,owner:"67a46b19c43a89eddfeb40c9",
    }));
    await listing.insertMany(updatedData);
    console.log("data was initialized");

};

initDB();