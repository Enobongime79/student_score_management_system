var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt");
const db = require('../db/database');

const getAsync = (query, params = []) => new Promise((resolve, reject) => db.get(query, params, (err, row) => err ? reject(err) : resolve(row)));

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('login', { title: "Login Page"});
});

router.post('/', async(req, res) => {
    const { email, password } = req.body;

    req.session.user = {
        email: email,
    }

    try {
        const user = await getAsync('SELECT id, password, role FROM staff WHERE email = ?', [email]);

        if (!user) {
            console.error("User not found");
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
    } catch (error) {
        console.error(error.message);
        return res.render("login", { emailErr: "Database Error!" });
    }
});

module.exports = router;
