// IN THIS I WILL BE MAKING THE USERS SCHEMA
// AND ALSO I WILL BE CONNECTING THE DATABASE TO THE BACKEND 
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

mongoose.connect("mongodb://localhost:27017/solveitDB", {
    useNewUrlParser : true,
    useUnifiedTopology : true,
    // useCreateIndex : true,

});


// NOWDEFINING THE SCHEMA FOR STORING THE DATA OF THE USERS OF SOLVE IT 
const userSchema = mongoose.Schema(
    {
        username : {
            type : String, 
            unique : true, 
            required : true,
        },
        firstname : {
            type : String,
            
            required : true,
        },
        lastname :{
            type : String, 
        
            required : true
        },
        email :{
            type : String, 
            unique : true, 
            required : true
        },
        phone :{
            type : String, 
            unique : true,
            required : true
        },
        password :{
            type : String, 
            // unique : true, 
            required : true
        },
        upvotes : [{
            ideasID : {
                type : String, 
            }
        }],
        saved : [{
            ideasID : {
                type : String
            }
        }],
        shared : [{
            ideasID : {
                type : String
            }
        }],
        tokens : [{
            token : {
                type : String, 
                required : true
            }
        }]
        // lastname :{
        //     type : String, 
        //     unique : true, 
        //     required : true
        // }
    }
);


// DEFINING THE MIDDLEWARE HERE FOR GENERATING THE AUTH TOKEN 
userSchema.methods.generateAuthToken = async function(){
    // ADDING THE TRY AND CATCH FOR ERROR HANDLING 
    try{
        // GENERATING THE TOKEN FOR THIS PURPOSE 
        const token = jwt.sign({_id : this._id.toString()}, process.env.SECRET_KEY, {
            expiresIn: 6000,

        });
        this.tokens = await this.tokens.concat({token : token});
        // SAVING THIS CHANGE TO THE DATABASE 
        await this.save();
        // console.log(token);
        return token
    }
    catch(error){
        // res.send("the error part " + error);
        console.log(error);
    }
    // next()
}



// NOW WE HAVE TO EXPORT THIS MODEL TO BE ABLE TO USE THE MODEL TO OTHER FILES AS WELL 
const userModel = mongoose.model("user", userSchema);

module.exports = userModel