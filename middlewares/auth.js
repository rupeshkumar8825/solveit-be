// this is authorization page for the user 
const jwt = require("jsonwebtoken");
const userModel  = require("../models/User");


// DEFINING THE MIDDLEWARE THIS WILL HAVE 3 ARGUMENT NEXT AS WELL 
const auth = async (req, res, next)=>{

    try{
        const token = req.cookies.token;
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        const user = await userModel.findOne({_id : verifyUser._id});
        req.token = token;
        req.user = user;
        next();
    }catch(error){
        res.json({status: 401, message : "not ok"})
    }


}

// EXPORTING THE MODULE FOR THIS PURPOSE 
module.exports = auth;