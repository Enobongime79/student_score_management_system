var express = require('express');
var router = express.Router();
const db = require("../db/database")

/* GET home page. */
router.get('/', function(req, res, next) {

  if (!req.session.user){
    return res.redirect("/")
  }

  else{
      db.all(`SELECT * FROM users`, [], (err, rows) => {
    if (err){
      console.log(err.message)
    }
    console.log(rows);

    rows.forEach(student => {
      student.average = ((student.math + student.english + student.science) / 3).toFixed(2);
    });

    rows.forEach(student => {
      student.real_id = 'STU_' + student.id;
    })

    rows.forEach(student => {
      student.total = ((student.math + student.english + student.science))
    })

    res.render('student', { title: 'Student Score Management System', students: rows });
  })
  }

});

router.post('/', (req, res) => {
  const { fullName, grade, mathScore, englishScore, scienceScore} = req.body;

  const realGrade = "Grade " + grade; 

  db.run(
    `INSERT INTO users (name, class, math, english, science) VALUES (?, ?, ?, ?, ?)`,
    [fullName, realGrade, mathScore, englishScore, scienceScore], function(err) {
      if (err) {
        console.log(err.message);
      } else {
        console.log(`Inserted User with ID: ${this.lastID}`)
      }
    }
  )

  return res.redirect("/students")
});

router.post("/delete", (req, res) => {
  const { id } = req.body;
  const query = `DELETE FROM users WHERE id = ?`;

  db.run(query, [id], function (err) {
    if (err){
      return console.error(err.message);
    }
    else {
      console.log(id)
      console.log("Deleted Successfully")
    }
  })
  
  res.redirect('/')
})

router.post("/edit", (req, res) => {
  const { id } = req.body;
  const query = `SELECT id, name, class, math, english, science FROM users WHERE id = ?`;
  
  db.get(query, [id], (err, result) => {
    if (err){
      res.status(500).json({ error: err.message})
    }
    else {
      res.json(result);
      console.log(result);
    }
  })
})

router.post("/save_details", (req, res) => {
  const { fullName, grade, mathScore, englishScore, scienceScore, real_id } = req.body;
  const query = `UPDATE users SET name = ?, class = ?, math = ?, english = ?, science = ? WHERE id = ?`;

  const realGrade = "Grade " + grade

  db.run(query, [fullName, realGrade, mathScore, englishScore, scienceScore, real_id], (err, result) => {
    if (err){
      console.log(err.message);
    }
    else{
      console.log(result);
      res.redirect('/students')
    }
  })
})

module.exports = router;
