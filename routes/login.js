var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt");
const { supabase } = require('../config/supabaseClient');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('login', { title: "Login Page"});
});

router.post('/', async(req, res) => {
    const { email, password } = req.body;

    req.session.user = {
        email: email,
    }

    const { data: user, error } = await supabase
        .from('staff')
        .select('id, password, role')
        .eq('email', email)
        .single();

    if (error || !user) {
        console.error(error ? error.message : "User not found");
        return res.render("login", { emailErr: "Wrong Email!" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.render("login", { passwordErr: "Wrong Password!" });
    } else {
        console.log("Logged in successfully");

        req.session.user = {
            ...req.session.user,
            id: user.id,
            role: user.role
        };

        if (user.role == "super_admin" || user.role == "superadmin") {
            return res.redirect('/super_admin');
        }
        if (user.role == "admin") {
            return res.redirect('/admin');
        }
        if (user.role == "teacher") {
            return res.redirect('/teacher');
        }
        
        return res.redirect('/');
    }
});

module.exports = router;
