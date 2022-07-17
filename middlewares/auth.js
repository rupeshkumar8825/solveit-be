// this is authorization page for the user 
const jwt = require("jsonwebtoken");
const userModel  = require("../models/User");


// DEFINING THE MIDDLEWARE THIS WILL HAVE 3 ARGUMENT NEXT AS WELL 
const auth = async (req, res, next)=>{

    try{
        console.log(req.cookies);
        const token = req.cookies.token;
        console.log('The cookies from token in authorisation is as follows\n');
        console.log(token);
        // if(!token)
        // {
        //     res.status(401).json({status : 401, message  :"not ok"});
        // }
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        // if(!verifyUser)
        // {
        //     res.status(401).json({status : 401, message  :"not ok"});

        // }

        console.log("The user which is trying to access the page is as follows \n");
        console.log(verifyUser)
        next();
    }catch(error){
        res.json({status: 401, message : "not ok"})
    }

    // CALLING THE NEXT FUNCTION FOR THIS PRURPOSE 

}

// EXPORTING THE MODULE FOR THIS PURPOSE 
module.exports = auth;