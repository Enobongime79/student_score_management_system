var express = require('express');
var router = express.Router();
const db = require('../db/database');

const allAsync = (query, params = []) => new Promise((resolve, reject) => db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows)));
const getAsync = (query, params = []) => new Promise((resolve, reject) => db.get(query, params, (err, row) => err ? reject(err) : resolve(row)));
const runAsync = (query, params = []) => new Promise((resolve, reject) => db.run(query, params, function(err) { err ? reject(err) : resolve(this) }));

/* GET home page. */
router.get('/', async function(req, res, next) {

  if (!req.session.user){
    return res.redirect("/")
  }

  else{
    try {
        const rows = await allAsync('SELECT * FROM users');
        console.log(rows);

        rows.forEach(student => {
          student.average = ((student.math + student.english + student.science) / 3).toFixed(2);
          student.real_id = 'STU_' + student.id;
          student.total = (student.math + student.english + student.science);
        });

        res.render('student', { title: 'Student Score Management System', students: rows });
    } catch(error) {
        console.log(error.message)
        return res.status(500).send("Error fetching students")
    }
  }

});

router.post('/', async (req, res) => {
  const { fullName, grade, mathScore, englishScore, scienceScore} = req.body;
  const realGrade = grade.startsWith("Grade ") ? grade : "Grade " + grade;

  try {
      await runAsync('INSERT INTO users (name, class, math, english, science) VALUES (?, ?, ?, ?, ?)', 
          [fullName, realGrade, mathScore, englishScore, scienceScore]);
      console.log("Inserted successfully");
      return res.redirect("/students")
  } catch(error) {
      console.log(error.message);
      return res.status(500).send("Error inserting user");
  }
});

router.post("/delete", async (req, res) => {
  const { id } = req.body;
  
  try {
      await runAsync('DELETE FROM users WHERE id = ?', [id]);
      console.log(id)
      console.log("Deleted Successfully")
  } catch(error) {
      console.error(error.message);
  }
  
  res.redirect('/students')
})

router.post("/edit", async (req, res) => {
  const { id } = req.body;
  
  try {
      const result = await getAsync('SELECT id, name, class, math, english, science FROM users WHERE id = ?', [id]);
      res.json(result);
      console.log(result);
  } catch(error) {
      res.status(500).json({ error: error.message})
  }
})

router.post("/save_details", async (req, res) => {
  const { fullName, grade, mathScore, englishScore, scienceScore, real_id } = req.body;
  const realGrade = grade.startsWith("Grade ") ? grade : "Grade " + grade;

  try {
      await runAsync('UPDATE users SET name = ?, class = ?, math = ?, english = ?, science = ? WHERE id = ?',
          [fullName, realGrade, mathScore, englishScore, scienceScore, real_id]);
      console.log("Updated successfully");
      res.redirect('/students')
  } catch(error) {
      console.log(error.message);
      return res.status(500).send("Error updating student");
  }
})

module.exports = router;
