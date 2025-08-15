const express = require("express");
const {User}    = require("./models.js")
const router = express.Router();


router.post("/register", function(req, res){
    const {username, first_name, last_name, email, password} = req.body;

    try{
        User.create({
        username,
        first_name,
        last_name,
        password,
        email
    });
    res.send("Registeration Successful");
    } catch(e){
        console.log(e);
        res.send("Error Occured While Registering")
    }

    
});

router.post("/login", function(req, res, next){
    next()
}, function(req, res){
    const { username, password } = req.body;
    const user      = User.findOne({
        email: username
    });
    
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