// this is simple node js server for backend 
const express = require('express');
// ADDING THE CORS MIDDLE WARE TO ALLOW THE PROXY WEB API HITS FROM THE REACT FRONTEND 
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const session = require('express-session');
const morgan = require("morgan");
const httpProxy = require('http-proxy');
const proxy = httpProxy.createServer({});
const bcrypt = require("bcrypt");
// const User = require("./models/User");
const userModel = require('./models/User');
const MongoDBSession = require('connect-mongodb-session')(session);


console.log("hi this is node js backend server code for building the backend using nodejs for solveit-app")

const port = 8080;


const store = new MongoDBSession({
    uri : "mongodb://localhost:27017/solveitDB",
    collection : "solveitSessions",
});


// ADDING THE MIDDLEWARE FOR THE CORS POLICY 
app.use(cors());

// SETTING THE URL ENCODED AS FALSE AS WE NEED TO PARSE THE REQUEST COMING FROM THE FRONTEND TO CONVERT IT INTO JSON FORMAT 
// app.use(express.urlencoded({extended:false}));
// app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.urlencoded({extended: true,}))
app.use(bodyParser.json())
app.use(cookieParser());

// DEFINING THE SESSION MIDDLEWARE. THIS WILL BE CALLED WHEN THE USER HAS LOGGED IN THEN THIS SESSION WILL BE STORED AND IT HENCE THE USER WILL BE LOGGED IN FOR SOME PARTICULAR TIME INTERVAL 
app.use(
    session(
        {
            // key : 'user_sid',
            secret : "this is secret key",
            resave : false,
            saveUninitialized : false,
            cookie : {
                expires : 600
            }    ,
            store : store,
        }    
    )    
)    


// WE HAVE TO DEFINE THE MIDDLEWARE FUNCTION FOR THIS PURPOSE 
const  isAuth = (req, res, next)=>{
    console.log('Hi i am inside the isAuth middleware\n');


    // CHECKING IF THE USER IS PRESENT IN THE SESSION OR NOT 
    if(req.session.isAuth)
    {
        next();
    }
    else
    {
        res.send("User is not logged in");
    }
    
}


// DEFINING ANOTHER MIDDLEWARES TO CHECK THE SESSION 
// const sessionChecker = (req, res, next) => {
//     if(req.session.user && req.cookies.user_sid)
//     {
//         console.log("The user is already signed in.");
//         res.send("Hi from the server side you are successfully signed in ");
        
//     }
//     else
//     {
//         // say everything went fine 
//         next();
//     }
//     // next();

// }

app.get("/",isAuth , (req, res)=>{
    // if()
    // I AM PASSING THE SESSION CHECKER MIDDLEWARE FUNCTION HERE TO CHECK WHETHER THE USER HAS BEEN SIGNED IN OR NOT 
    // IF IT IS NOT SIGNED THEN I WILL SEND THE BAD REQUEST TO THE FRONTEND AS A RESPOSNE 
    console.log("The user is not signed in yet");
    res.send("The user is not signed in ");
    // console.log("this is root route for this server\n");
    // res.send("Hi from the backend or server side. Building process has been started");
})

// HANDLING THE REGISTER ROUTE FOR THIS PURPOSE 
app.post("/signin", async (req, res) =>{
    console.log("Got the signin post request to this nodejs backend for solveit application\n");
    console.log('The request and the credentials that i got is as follows\n\n');
    console.log(req.body);

    const user = await userModel.findOne({email : req.body.email});

    if(!user)
    {
        res.send("-1");
    }
    console.log("The current user is as follows \n", user);

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if(!isMatch)
    {
        res.send("-1");
    }

    req.session.isAuth = true;
    // OTHERWISE WE HAVE TO MATECH THE PASSWORD AS WELL 
    res.send("1");
    // res.send("Successfully signed in ")
    // res.redirect('http://localhost:3000/')
    // proxy.web(req, res, {target : "http://localhost:3000/"})

    // res.end("Done successfully");
})

// DEFINING THE ROUTE TO REGISTER THE NEW USER 
app.post("/register", async (req,res)=>{
    console.log("New user is trying to register on the solve it website\n");
    console.log(req.body);

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
            firstname : req.body.firstname, 
            lastname : req.body.lastname,
            email : req.body.email, 
            password : hashed_pswd,
        }
    )
    
    const response = await newUser.save()
    console.log(response);
    
    // NOW WE HAVE TO SET UP THE SESSION FOR THIS PARTICULAR USER FOR THIS PURPOSE 
    // SAVING IN THE DATABASE 
    res.send("done")
})


// making a simple server here 
app.listen(port, ()=>{
    console.log(`listening at the port ${port}`);
})