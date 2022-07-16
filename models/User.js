// IN THIS I WILL BE MAKING THE USERS SCHEMA
// AND ALSO I WILL BE CONNECTING THE DATABASE TO THE BACKEND 
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect("mongodb://localhost:27017/solveitDB", {
    useNewUrlParser : true,
    useUnifiedTopology : true,
    // useCreateIndex : true,

});


// NOWDEFINING THE SCHEMA FOR STORING THE DATA OF THE USERS OF SOLVE IT 
const userSchema = mongoose.Schema(
    {
        firstname : {
            type : String,
            unique : true, 
            required : true,
        },
        lastname :{
            type : String, 
            unique : true, 
            required : true
        },
        email :{
            type : String, 
            unique : true, 
            required : true
        },
        password :{
            type : String, 
            // unique : true, 
            required : true
        },
        // lastname :{
        //     type : String, 
        //     unique : true, 
        //     required : true
        // }
    }
);



// NOW WE HAVE TO EXPORT THIS MODEL TO BE ABLE TO USE THE MODEL TO OTHER FILES AS WELL 
const userModel = mongoose.model("user", userSchema);

module.exports = userModel