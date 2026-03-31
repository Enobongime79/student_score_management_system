var express = require('express');
var router = express.Router();
const db = require('../db/database');
const bcrypt = require("bcrypt")

const allAsync = (query, params = []) => new Promise((resolve, reject) => db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows)));
const getAsync = (query, params = []) => new Promise((resolve, reject) => db.get(query, params, (err, row) => err ? reject(err) : resolve(row)));
const runAsync = (query, params = []) => new Promise((resolve, reject) => db.run(query, params, function(err) { err ? reject(err) : resolve(this) }));

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (!req.session.user || req.session.user.role != "teacher"){
    return res.redirect("/")
  }
  else {
    res.render('teacher', {id: req.session.user.id});
    console.log(req.session.user.id);
  }

});

router.get('/manage_students', async function(req, res, next) {

  if (!req.session.user || req.session.user.role != "teacher"){
    return res.redirect("/")
  }

  else{
    try {
        const result = await getAsync('SELECT class FROM teachers WHERE teacher_id = ?', [req.session.user.id]);

        if (!result){
            console.log("Row not found!");
            return res.redirect("/");
        }

        const grade = result.class.startsWith("Grade ") ? result.class : "Grade " + result.class;

        const rows = await allAsync('SELECT * FROM users WHERE class = ?', [grade]);

        rows.forEach(student => {
            student.average = ((student.math + student.english + student.science) / 3).toFixed(2);
            student.real_id = 'STU_' + student.id;
            student.total = (student.math + student.english + student.science);
        });

        res.render('teacher_student', { title: 'Student Score Management System', students: rows });
    } catch(error) {
        console.log(error.message)
        return res.status(500).send("Error fetching students")
    }
  };
});

router.post('/manage_students/add_student', async (req, res) => {
  if (!req.session.user || req.session.user.role != "teacher"){
    return res.redirect("/")
  }

  else{
    const { fullName, grade, mathScore, englishScore, scienceScore} = req.body;
    const realGrade = grade.startsWith("Grade ") ? grade : "Grade " + grade;

    try {
        await runAsync('INSERT INTO users (name, class, math, english, science) VALUES (?, ?, ?, ?, ?)', 
            [fullName, realGrade, mathScore, englishScore, scienceScore]);
        return res.redirect("/teacher/manage_students");
    } catch(error) {
        console.log(error.message);
        return res.status(500).send("Error inserting student");
    }
  };
});

router.post("/manage_students/delete_student", async (req, res) => {
  if (!req.session.user || req.session.user.role != "teacher"){
    return res.redirect("/")
  }

  else{
    const { id } = req.body;
    
    try {
        await runAsync('DELETE FROM users WHERE id = ?', [id]);
        console.log(id)
        console.log("Deleted Successfully")
    } catch(error) {
        console.error(error.message);
    }
    
    res.redirect("/teacher/manage_students");
  };
});

router.post("/manage_students/edit_student", async (req, res) => {
  if (!req.session.user || req.session.user.role != "teacher"){
    return res.redirect("/")
  }

  else{
    const { id } = req.body;
    
    try {
        const result = await getAsync('SELECT id, name, class, math, english, science FROM users WHERE id = ?', [id]);
        res.json(result);
        console.log(result);
    } catch(error) {
        res.status(500).json({ error: error.message})
    }
  };
})

router.post("/manage_students/save_details", async (req, res) => {
  if (!req.session.user || req.session.user.role != "teacher"){
    return res.redirect("/")
  }

  else{
    const { fullName, grade, mathScore, englishScore, scienceScore, real_id } = req.body;
    const realGrade = grade.startsWith("Grade ") ? grade : "Grade " + grade;

    try {
        await runAsync('UPDATE users SET name = ?, class = ?, math = ?, english = ?, science = ? WHERE id = ?',
            [fullName, realGrade, mathScore, englishScore, scienceScore, real_id]);
        console.log("Updated successfully");
        res.redirect("/teacher/manage_students")
    } catch(error) {
        console.log(error.message);
        return res.status(500).send("Error saving student details");
    }
  };
})

module.exports = router;
