var express = require('express');
var router = express.Router();
const db = require("../db/database");
const bcrypt = require("bcrypt");
const saltRounds = 10;

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (!req.session.user ||req.session.user.role != "admin"){
    return res.redirect("/")
  }
  else {
    res.render('admin', { title: "Admin Dashboard"})
  }
});

router.get("/manage_teachers", (req, res) => {
   if (!req.session.user){
    return res.redirect("/")
  }

  else{
    db.all(`SELECT * FROM staff JOIN teachers ON staff.id = teachers.teacher_id`, [], (err, rows) => {

      if (err){
        console.log(err.message)
      }
      console.log(rows);

      rows.forEach(teacher => {
        teacher.real_id = 'TEA_' + teacher.id;
      })

      rows.forEach(teacher => {
        teacher.grade = "Grade " + teacher.class;
      })

      res.render('manageTeachers', { title: 'Teacher Manager', teachers: rows });
    })
  }
})

module.exports = router;
