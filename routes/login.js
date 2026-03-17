var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt")
const db = require("../db/database");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('login', { title: "Login Page"});
});

router.post('/', (req, res) => {
    const { email, password } = req.body;

    req.session.user = {
        email: email,
    }

    const query = `SELECT password, role FROM staff WHERE email = ?`;
    
    db.get(query, [email], async (err, result) => {
        if (err){
            console.log(err.message);
            return res.redirect("/");
        }
        if (!result){
            console.log("not in database")
            return res.render("login", { emailErr: "Wrong Email!"})
        }
        
        const match = await bcrypt.compare(password, result.password);
        if (!match) {
            return res.render("login", { passwordErr: "Wrong Password!"});
        }
        else{
            console.log("Logged in successfully");

            if (result.role == "superadmin"){
                return res.redirect('/super_admin');
            }
            if (result.role == "admin"){
                return res.redirect('/admin');
            }
        }
    })
})

module.exports = router;
