const express = require("express");
const {User}    = require("./models.js")
const uuid  = require("uuid")
const router = express.Router();


router.post("/register", async function(req, res){
    const {username, first_name, last_name, email, password, confirm_password} = req.body;

    if( password != confirm_password){
        return res.statusCode(500).send("Password Not Match");
    }

    try{
        const user_id = uuid.v4()
        await User.create({
            user_id,
            username,
            first_name,
            last_name,
            password,
            email
        });
    //res.send("Registeration Successful");
    res.redirect("/dashboard");
    } catch(e){
        console.log(e);
        res.send("Error Occured While Registering")
    }

    
});

router.post("/login", function(req, res, next){
    next()
}, async function(req, res){
    const { username, password } = req.body;
    const user      = await User.findOneAndUpdate({
        username:username
    }, {
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
    
       return res.redirect("/dashboard");
    
});

router.get("/register", function(req, res){
    return res.render("signup");
});

router.get("/login", function(req, res){    
    return res.render("login");
});

module.exports = router;