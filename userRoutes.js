const express = require("express");
const {User}    = require("./models.js")
const uuid  = require("uuid")
const router = express.Router();
const {signUserToken} = require("./functions.js")


router.post("/register", async function(req, res){
    const {username, first_name, last_name, email, password, confirm_password} = req.body;

    if( password != confirm_password){
        return res.statusCode(500).send("Password Not Match");
    }

    try{
        const user_id = uuid.v4()
        const user = await User.create({
            user_id,
            username,
            first_name,
            last_name,
            password,
            email
        });
        res.cookie("userID", signUserToken( user._id ), {
            maxAge: 7 * 24 * 60 * 60,
            httpOnly: true,
            secure:false
        });
        //res.send("Registeration Successful");
        res.redirect("/");
    } catch(e){
        console.log(e);
        res.send("Error Occured While Registering")
    }

    
});

router.post("/login", function(req, res, next){
    next()
}, async function(req, res){
    const { username, password } = req.body;
    const user      = await User.findOne({
        username:username
    });

    console.log(user, "model", username, password);
    
        if(! user){
            return res.send("User not found");
        } 

        
    
       const compare = user.comparePassword(password);
    
       if(! compare ){
            return res.send("Password Incorrect");
       }

       //setting the cookie on the login page if the user has successfully loged.
       res.cookie("userID", signUserToken( user._id ), {
        secure:false,
        httpOnly:true,
        maxAge: 7 * 24 * 60 * 60//7 days
       });
    
       return res.redirect("/");
    
});

router.all('/logout', function(req, res){
    res.clearCookie("userID");
    req.user = false;
    res.redirect("/login");
});

router.get("/register", function(req, res){
    return res.render("signup");
});

router.get("/login", function(req, res){    
    return res.render("login");
});

module.exports = router;