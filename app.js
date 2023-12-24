// this is simple node js server for backend 
require('dotenv').config();
const express = require('express');
// ADDING THE CORS MIDDLE WARE TO ALLOW THE PROXY WEB API HITS FROM THE REACT FRONTEND 
const cors = require('cors');
const app = express();
const path = require("path")
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const userModel = require('./models/User');
const auth = require("./middlewares/auth");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const ideaModel = require("./models/ideas");
console.log("hi this is node js backend server code for building the backend using nodejs for solveit-app")

const port = 8000;


// ADDING THE MIDDLEWARE FOR THE CORS POLICY 
// app.use(cors());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));



app.use(bodyParser.urlencoded({extended: true,}))
app.use(bodyParser.json())
app.use(cookieParser());




app.get("/", async (req, res)=>{
    // console.log("The cookie that i get from the user is as follows \n");
    let ideas = await ideaModel.find();
    // console.log("The list of ideas that are stored in the database are as follows \n");
    // console.log(ideas);
   
    let users = await userModel.find();
    // console.log("The list of users are as follows \n");
    // console.log(users);

    // SO WE WILL ALSO SEND  THIS INFO TO THE FRONTEND ALONG WITH THE OTHER DETAILS FOR THIS PURPOSE 
    try{
        
        const token = req.cookies.token;
        let curr_user = jwt.verify(token, process.env.SECRET_KEY);
        curr_user = await userModel.findOne({_id : curr_user._id});


        res.status(200).json({status : 200, message : "ok", curr_user, ideas : ideas, users : users});
    }catch(error){
        res.json({status : 401, message : "so not ok", ideas : ideas, users: users});
        // res.end();
        return;
    }
   
    
})


  
  
// ADDING THE ROUTE TO HANDLE THE IDEA UPLOAD SECTION 
app.get("/upload", auth, async(req, res)=>{
    const token = req.cookies.token;


    let curr_user = jwt.verify(token, process.env.SECRET_KEY);
    curr_user = await userModel.findOne({_id : curr_user._id});


    res.status(200).json({status : 200, message : "ok", curr_user});
})






// HANDLING THE REGISTER ROUTE FOR THIS PURPOSE 
app.post("/signin", async (req, res) =>{
    console.log("came inside the signing option \n", req.body);
    let user = await userModel.findOne({email : req.body.email});

    if(!user)
    {
        res.json({status : 401 , message : "not ok"})
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);


    // GENERATING THE TOKEN WHILE LOGGING IN 
    if(!isMatch)
    {
        res.json({status : 401 , message : "not ok"})
    }
    console.log("the password matched with the current user for this purpose \n");

    const token = await user.generateAuthToken();
    
    console.log("we have got the token. The token is as follows \n", token);

    res.cookie('token', token, {maxAge: 10*60*1000, sameSite: 'none', secure: true , httpOnly : true});
    
    
    res.json({status : 200 , success : "ok", curr_user:user, token : token});
})





// DEFINING THE ROUTE TO REGISTER THE NEW USER 
app.post("/register", async (req,res)=>{
    // FIRST WE HAVE TO CHECK WHETHER THE USER WITH THIS EMAIL ALREADY EXISTS OR NOT 
    const user = await userModel.findOne({email : req.body.email});

    if(user) 
    {
        res.send("User already exists\n");
    }

    const hashed_pswd = await bcrypt.hash(req.body.password, 12);

    // DEFINING THE NEW DOCUMENT TO BE STORED INTO THE DATABASE 
    const newUser = userModel(
        {
            username :req.body.username,
            firstname : req.body.firstname, 
            lastname : req.body.lastname,
            email : req.body.email, 
            phone : req.body.phone,
            password : hashed_pswd,
            upvotes : [],
            shared  : [],
            saved : []
        }
    )
    
    const response = await newUser.save()
    res.status(200).json({status : 200, message : "ok"});
})





// DEFINING THE API TO HANDLE THE LOGOUT REQUEST TO THE USER 
app.get("/logout", auth, async(req, res) =>{
    try {
        // console.log("The user is trying to logout from the application\n");
        res.cookie('token', "", {maxAge: 0, sameSite: 'none', secure: true , httpOnly : true});
        // console.log("logout successfully\n");

        await req.user.save();
        res.status(200).json({status : 200, message : "ok"});
        res.end();

    } catch (error) {
        res.status(401).json({status : 401, message : "ok"});
        res.end();
    }

})




// DEFINING THE MIDDLEWARE TO UPLOAD THE FILE IN THE LOCAL SERVER 
const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "./uploads")
    },
    filename : (req, file, cb) => {
        cb(null, Date.now()  + file.originalname);
    },
});




const upload = multer({storage : fileStorageEngine});





// DEFINING THE ROUTE TO UPLOAD THE FILES IN THE LOCAL COMPUTER AND THEN SERVING THEM 
app.post("/upload", upload.single("image"), async (req, res) => {
    // console.log("The information about the files is as follows\n");
    // console.log(req.cookies);
    const token = req.cookies.token;
    let curr_user = jwt.verify(token, process.env.SECRET_KEY);
    curr_user = await userModel.findOne({_id : curr_user._id});
    // console.log("The current user is ", curr_user);
    const user_id = curr_user._id;
    const file_path = req.file.path;
    const newIdea = ideaModel({
        user_id : user_id,
        ideaname : req.body.idea,
        category : req.body.category,
        othersknow : req.body.otherknow,
        rating : req.body.rating,
        description : req.body.description,
        thumbnail : file_path,
        upvotes : 0,
        shares : 0
    });
    await newIdea.save();

    // console.log(req.file);
    // console.log("The body that i got from the frontend client side is as follows\n");
    // console.log(req.body);
    // console.log("The user has uploaded something on the server\n");
    res.json({status : 200, message : "ok"});

})


// MAKING AN ENDPOINT TO SEND THE PHOTO REQUEST BY THE FRONTEND FOR THIS PURPOSE 
app.get("/image", (req, res)=>{
    // console.log("The frontend wants this image and hence i  will be sending to the frontend \n")
    // console.log("The body is as follows \n");
    // console.log(req.query);

    // NOW ONCE WE GOT THE PARAMS WE HAVE TO SENT BACK THIS IMAGE TO THE FRONTEND THAT WILL BE STORED
    let fileLocation = path.join(__dirname,`./${req.query.path}`);
    // console.log("The location of the file is as follows \n\n");
    // console.log(fileLocation);    

    // res.json({message : "Got and sent the image"})
    res.sendFile(`${fileLocation}`);
})



// DEFINING THE ENDPOINT TO UPDATE THE NUMBER OF UPVOTES OF THE IDEA 
app.post("/upvote", auth, async(req, res)=>{
    console.log("Got the post request to upvote the idea and add this to the users upvoting list\n");
    console.log(req.body);
    const userID = req.body.userID;
    const ideaID = req.body.ideaID;
    
    const user = await userModel.updateOne({_id : userID}, 
        {
            $push : {
                upvotes : {
                    ideasID : ideaID
                }
            }
        });
    // console.log("the response after inserting the new ideaid in the upvotes section is ", user);
    let idea = await ideaModel.findOne({_id : ideaID});
    let currUpvotes = idea.upvotes;

    idea = await ideaModel.updateOne({_id : ideaID}, {$set : {upvotes : currUpvotes+1}});
    // console.log('The response after incrementing the count of upvotes is as follows\n', idea);
    
    res.status(200).json({status : "200", message : "ok"});
})

// DEFINING THE END POINT TO SEND THE LIST OF USERS AND THE CORRESPONDING UPVOTED IDEAS FOR THIS PURPOSE 
app.get("/upvotedList", async (req, res)=>{
    console.log("Got the requet to send the list of upvoted ideas by the particular user\n");
    
    const users = await userModel.find();
    let usersUpvotedSavedList = [];

    // using the for loop for this purpose 
    users.forEach(element => {
        const data = {
            userId : element._id,
            upvotesList : element.upvotes,
            savedList  : element.saved
        }

        usersUpvotedSavedList.push(data);
    });

    console.log("The list of upvoted ideas corresponding to the user is as follows\n\n");
    console.log(usersUpvotedSavedList);

    // NOW WE HAVE TO SEND THE RESPONSE FOR THIS PURPOSE 
    res.status(200).json({status : 200 , message : "ok", usersUpvotedSavedList});
})



// ADDING THE ROUTE TO SAVE THE GIVEN IDEAID TO THE CORRESPONDING USERID IN THE DB 
app.post("/save", auth, async (req, res)=>{
    console.log("The user has saved something");
    console.log("The details for saving is as follows\n");
    console.log(req.body);

    // const userID
    const userID = req.body.userID;
    const ideaID = req.body.ideaID;
    const user = await userModel.updateOne({_id : userID}, 
        {
            $push : {
                saved : {
                    ideasID : ideaID
                }
            }
        });
    console.log(user);
    // console.log("the response after inserting the new ideaid in the upvotes section is ", user);
    // let idea = await ideaModel.findOne({_id : ideaID});
    // let currUpvotes = idea.upvotes;

    // idea = await ideaModel.updateOne({_id : ideaID}, {$set : {upvotes : currUpvotes+1}});

    // SAY EVERYTHING WENT FINE 
    res.status(200).json({status : 200 , message : "ok"});
})


// DEFINING THE ROUTE TO SEND THE USER DETAILS GIVEN ID 
app.get("/user/:id",  async (req, res)=>{
    console.log("The frontend has made a get request to backend to get the details of the user of current given id\n");
    try {
        let users = await userModel.find();
        let ideas = await ideaModel.find();

        console.log("The current id is \n", req.params);
        let currID = req.params.id;
    
        let currUser = await userModel.findOne({_id : currID});
        console.log("The current user details is ", currUser);
    
        // WE HAVE TO SEND THE IDEA INFORMATION SEPARATE FOR THIS PURPOSE 
        let upvotedIdeaID = currUser.upvotes;
        let savedIdeaID = currUser.saved;
        console.log("The list of upvoted idea is", upvotedIdeaID);
        console.log('The list of saved idea is ', savedIdeaID);
    
        let upvotedIdeaList = [];
        let savedIdeaList = [];
        // USING THE FOR LOOP FOR THIS PURPOSE TO STORE THE DETAILS OF THE IDEA OF THE UPVOTED BY THE CURRENT USER
        for(let i  = 0;i<upvotedIdeaID.length;i++)
        {
            const currIdeaInfo = await ideaModel.findOne({_id : upvotedIdeaID[i].ideasID});
            // console.log(currIdeaInfo);
            upvotedIdeaList.push(currIdeaInfo);
            // console.log("The upvotedidealist is", upvotedIdeaList);
            
        }
        // upvotedIdeaID.forEach(element => {
        //     // console.log(element.ideasID);
        // });
    
    
        // USING THE FOR LOOP FOR STORING THE DETAILS OF THE SAVED IDEA BY THE CURRENT USER 
        // savedIdeaID.forEach(async element =>{
        //     const currIdeaInfo = await ideaModel.findOne({_id : element.ideasID});
        //     savedIdeaList.push(currIdeaInfo);
        // })
        for(let i  = 0;i<savedIdeaID.length;i++)
        {
            const currIdeaInfo = await ideaModel.findOne({_id : savedIdeaID[i].ideasID});
            // console.log(currIdeaInfo);
            savedIdeaList.push(currIdeaInfo);
            // console.log("The upvotedidealist is", upvotedIdeaList);
            
        }
    
        // SAY EVERYTHING WENT FINE 
        // console.log("The details of the upvoted idea is ", upvotedIdeaList);
        // console.log("The details of the saved idea list ", savedIdeaList);
    
        res.status(200).json({status : 200, message : "ok", savedIdeaList : savedIdeaList, upvotedIdeaList : upvotedIdeaList, users, ideas, currUser});
    } catch (error) {
        console.log("Got some error in users info route");
        console.log(error);
        res.json({status : 401, message : "not ok"});

    }
})

// app.get("/ideas", )

// making a simple server here 
app.listen(port, ()=>{
    console.log(`listening at the port ${port}`);
})