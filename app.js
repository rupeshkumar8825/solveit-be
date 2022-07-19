// this is simple node js server for backend 
require('dotenv').config();
const express = require('express');
// ADDING THE CORS MIDDLE WARE TO ALLOW THE PROXY WEB API HITS FROM THE REACT FRONTEND 
const cors = require('cors');
const app = express();
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
    try{
        
        // const cookie = req.cookies;
        console.log("got the get request in the home page\n");
        console.log(req.cookies)
        const token = req.cookies.token;
        // console.log(token);
        // console.log("The current user is as follows");
        let curr_user = jwt.verify(token, process.env.SECRET_KEY);
        curr_user = await userModel.findOne({_id : curr_user._id});
        
        // HERE WE HAVE TO FIND THE TOTAL LIST OF AVAILABLE IDEAS IN THE FEED 
        // const ideas = await ideaModel.find();
        // console.log(ideas);
        // const len = ideas.length();
        // console.log("The total number of ideas are as follows ", len);
        // const photo = await Photo.findOne({
        //     photoID: req.params.photo_id,
        // });
        // if (!photo) {
        //     return res.status(404).json({ msg: 'Photo not found' });
        // }
        // const filename = photo.photoFileName;
        // const downloadPath = path.join(__dirname, './uploads', `${filename}`);
        // res.download(downloadPath);

        
        // console.log(curr_user);
        res.status(200).json({status : 200, message : "ok", curr_user});
    }catch(error){
        console.log("got some error in error section")
        res.json({status : 401, message : "so not ok"});
        res.end();
        return;
    }
    console.log("Came here as well");
    
    // res.end();
    
})


app.get("/ideas", (req, res) =>{
    console.log("Got the request to get the list of all ideas from the db\n");
    res.send("done");
})


// app.get('/download/:photo_id', async (req, res) => {
//     try {
//     } catch (err) {
//     }
//     console.error(err.message);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ msg: 'Photo not found' });
//     }
//     res.status(500).send('Server error');
  
//   });
  
  
  // ADDING THE ROUTE TO HANDLE THE IDEA UPLOAD SECTION 
  app.get("/upload", auth, async(req, res)=>{
      // console.log("The user is trying to go to the upload section\n");
      // console.log("The cookie that i get from the user is as follows \n");
    const token = req.cookies.token;
    // console.log(token);
    let curr_user = jwt.verify(token, process.env.SECRET_KEY);
    // console.log("The current user is as follows");
    curr_user = await userModel.findOne({_id : curr_user._id});
    // console.log(curr_user);
    res.status(200).json({status : 200, message : "ok", curr_user});
    // res.status(200).json({status: 200, message:"ok"});
})




// HANDLING THE REGISTER ROUTE FOR THIS PURPOSE 
app.post("/signin", async (req, res) =>{
    // console.log("Got the signin post request to this nodejs backend for solveit application\n");
    // console.log('The request and the credentials that i got is as follows\n\n');
    // console.log(req.body);

    let user = await userModel.findOne({email : req.body.email});

    if(!user)
    {
        res.json({status : 401 , message : "not ok"})
    }
    // console.log("The current user is as follows \n", user);

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    // GENERATING THE TOKEN WHILE LOGGING IN 
    if(!isMatch)
    {
        res.json({status : 401 , message : "not ok"})
    }
    

    const token = await user.generateAuthToken();
    // console.log("The generated token after login is as follows\n");
    // console.log(token);

    

    // res.cookie("token", token, { maxAge: 6000000, httpOnly : true, secure: true,  })
    res.cookie('token', token, {maxAge: 10*60*1000, sameSite: 'none', secure: true , httpOnly : true});
    
    res.json({status : 200 , success : "ok", curr_user:user});
})



// DEFINING THE ROUTE TO REGISTER THE NEW USER 
app.post("/register", async (req,res)=>{
    // console.log("New user is trying to register on the solve it website\n");
    // console.log(req.body);

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
        }
    )
    
    const response = await newUser.save()
    console.log(response);
    
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
    console.log("The information about the files is as follows\n");
    // console.log(req.cookies);
    const token = req.cookies.token;
    let curr_user = jwt.verify(token, process.env.SECRET_KEY);
    curr_user = await userModel.findOne({_id : curr_user._id});
    console.log("The current user is ", curr_user);
    const user_id = curr_user._id;
    const file_path = req.file.path;
    const newIdea = ideaModel({
        user_id : user_id,
        ideaname : req.body.idea,
        category : req.body.category,
        othersknow : req.body.otherknow,
        rating : req.body.rating,
        description : req.body.description,
        thumbnail : file_path
    });
    await newIdea.save();

    console.log(req.file);
    console.log("The body that i got from the frontend client side is as follows\n");
    console.log(req.body);
    console.log("The user has uploaded something on the server\n");
    res.json({status : 200, message : "ok"});

})

// making a simple server here 
app.listen(port, ()=>{
    console.log(`listening at the port ${port}`);
})