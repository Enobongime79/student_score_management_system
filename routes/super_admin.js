var express = require('express');
var router = express.Router();
const db = require("../db/database");
const bcrypt = require("bcrypt");
const saltRounds = 10;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('superadmin');
});

router.get("/manage_admins", (req, res) => {
   if (!req.session.user){
    return res.redirect("/")
  }

  else{
    db.all(`SELECT * FROM staff JOIN admins ON staff.id = admins.admin_id`, [], (err, rows) => {

      if (err){
        console.log(err.message)
      }
      console.log(rows);

      rows.forEach(admin => {
        admin.real_id = 'ADM_' + admin.id;
      })

      res.render('manageAdmins', { title: 'Admin Manager', admins: rows });
    })
  }
})

router.post("/manage_admins/add_admins", (req, res) => {
  const { name, email } = req.body;
  const password = "admin12345";
  const role = 'admin';
  let id;

  async function createUser() {
    try {
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      db.run(
      `INSERT INTO staff (name, email, password, role) VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, role],
       function (err) {
        if (err) {
          console.log(err.message);
          return;
        }

        const staffId = this.lastID; // SQLite gives you the inserted id

        db.run(
          `INSERT INTO admins (name, admin_id) VALUES (?, ?)`,
          [name, staffId],
          (err) => {
            if (err) console.log(err.message);
            else console.log("Inserted Successfully!");
          }
        );
      }
    );
    return res.redirect('/super_admin/manage_admins')
    }
      catch (err) {
      console.error(err);
    }
  }

createUser();

})

module.exports = router;
