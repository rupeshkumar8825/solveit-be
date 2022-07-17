// IN THIS WE  WILL MAKE THE MODEL FOR THE IDEAS THAT WILL BE STORED IN THE DB CORRESPONDING TO EVERY USER 
const mongoose = require('mongoose');


// DEFINING THE NEW USER SCHEMA 
const ideaSchema = mongoose.Schema({
    user_id : {
        type : String , 
        required : true,
    },
    
})