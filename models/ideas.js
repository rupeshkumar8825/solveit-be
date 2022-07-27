// IN THIS WE  WILL MAKE THE MODEL FOR THE IDEAS THAT WILL BE STORED IN THE DB CORRESPONDING TO EVERY USER 
const mongoose = require('mongoose');


// DEFINING  THE NEW USER SCHEMA 
const ideaSchema = mongoose.Schema({
    user_id : {
        type : String , 
        required : true,
    },
    ideaname : {
        type : String, 
        requried : true
    },
    category : {
        type : String, 
        required : true,
    },
    othersknow : {
        type : String, 
        required : true,
    },
    rating : {
        type : Number, 
        required : true
    },
    description : {
        type : String, 
        required : true,
    },
    thumbnail : {
        type : String
    },
    upvotes : {
        type : Number, 
        required : true
    },
    shares : {
        type : Number, 
        required : true
    },
    

    
});


const ideaModel = mongoose.model("idea", ideaSchema);

module.exports = ideaModel;