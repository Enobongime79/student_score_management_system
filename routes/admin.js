var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const db = require('../db/database');

const allAsync = (query, params = []) => new Promise((resolve, reject) => db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows)));
const getAsync = (query, params = []) => new Promise((resolve, reject) => db.get(query, params, (err, row) => err ? reject(err) : resolve(row)));
const runAsync = (query, params = []) => new Promise((resolve, reject) => db.run(query, params, function(err) { err ? reject(err) : resolve(this) }));

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (!req.session.user || req.session.user.role != "admin"){
    return res.redirect("/")
  }
  else {
    res.render('admin', { title: "Admin Dashboard"})
  }
});

router.get("/manage_teachers", async(req, res) => {
   if (!req.session.user || req.session.user.role != "admin"){
    return res.redirect("/")
  }

  else{
    try {
        const rows = await allAsync(`
            SELECT t.*, s.name as staff_name, s.email as staff_email, s.role as staff_role
            FROM teachers t
            JOIN staff s ON t.teacher_id = s.id
        `);

        rows.forEach(teacher => {
          teacher.staff = {
              id: teacher.teacher_id,
              name: teacher.staff_name,
              email: teacher.staff_email,
              role: teacher.staff_role
          };
          teacher.real_id = 'TEA_' + teacher.id;
          teacher.grade = "Grade " + teacher.class;
        });

        return res.render('admin_manageTeachers', {
          title: 'Teacher Manager',
          teachers: rows
        });
    } catch(error) {
        console.log(error.message);
        return res.status(500).send("Error fetching teachers");
    }
  }
});

router.post("/manage_teachers/add_teachers", async (req, res) => {
  if (!req.session.user || req.session.user.role != "admin"){
    return res.redirect("/")
  }

  else{
    const { name, email, grade } = req.body;
    const password = "teacher12345";
    const role = 'teacher';

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const staffResult = await runAsync('INSERT INTO staff (name, email, password, role) VALUES (?, ?, ?, ?)', 
            [name, email, hashedPassword, role]);
        const staffId = staffResult.lastID;

        await runAsync('INSERT INTO teachers (name, class, teacher_id) VALUES (?, ?, ?)',
            [name, grade, staffId]);

        console.log("Inserted Successfully!");
        return res.redirect('/admin/manage_teachers');
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
  }
})

router.post("/manage_teachers/edit_teachers", async (req, res) => {
  if (!req.session.user || req.session.user.role != "admin"){
    return res.redirect("/")
  }

  else{
    const { id } = req.body;
    
    try {
        const row = await getAsync(`
            SELECT t.*, s.name as staff_name, s.email, s.role, s.password
            FROM teachers t
            JOIN staff s ON t.teacher_id = s.id
            WHERE t.id = ?
        `, [id]);

        const flatRow = {
            ...row,
            name: row.staff_name || row.name, 
            email: row.email,
            id: row.id 
        };
        console.log("Successfully got the row");
        res.json(flatRow);
        console.log(flatRow);
    } catch(error) {
        return res.status(500).json({ error: error.message})
    }
  }
})

router.post("/manage_teachers/save_details", async (req, res) => {
  if (!req.session.user || req.session.user.role != "admin"){
    return res.redirect("/")
  }

  else{
    const { editFullName, editGrade, editEmail, real_id } = req.body;

    try {
        await runAsync('UPDATE teachers SET name = ?, class = ? WHERE id = ?', [editFullName, editGrade, real_id]);
        const teacher = await getAsync('SELECT teacher_id FROM teachers WHERE id = ?', [real_id]);
        
        await runAsync('UPDATE staff SET name = ?, email = ? WHERE id = ?', [editFullName, editEmail, teacher.teacher_id]);
        
        console.log("Updated the teachers details in the staff table!");
        return res.redirect("/admin/manage_teachers")
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
  }
});

router.post("/manage_teachers/delete_teachers", async (req, res) => {
   if (!req.session.user || req.session.user.role != "admin"){
    return res.redirect("/")
  }

  else{
    const { id } = req.body;

    try {
        const teacher = await getAsync('SELECT teacher_id FROM teachers WHERE id = ?', [id]);

        if (!teacher){
            return console.log(`Row with id:${id} does not exist in the database!`)
        }

        const staffId = teacher.teacher_id;

        await runAsync('DELETE FROM teachers WHERE id = ?', [id]);
        await runAsync('DELETE FROM staff WHERE id = ?', [staffId]);
        
        console.log("Successfully deleted from the staff table!")
        return res.redirect('/admin/manage_teachers')
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
  }
});

router.get('/manage_students', async (req, res, next) => {
  if (!req.session.user || req.session.user.role != "admin"){
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

        res.render('admin_student', { title: 'Student Score Management System', students: rows });
    } catch(error) {
        console.log(error.message)
        return res.status(500).send("Error fetching students");
    }
  };
});

router.post('/manage_students/add_student', async(req, res) => {
  if (!req.session.user || req.session.user.role != "admin"){
    return res.redirect("/")
  }

  else{
    const { fullName, grade, mathScore, englishScore, scienceScore} = req.body;

    try {
        await runAsync('INSERT INTO users (name, class, math, english, science) VALUES (?, ?, ?, ?, ?)', 
            [fullName, `Grade ${grade}`, mathScore, englishScore, scienceScore]);
        
        console.log("Inserted Student")
        return res.redirect("/admin/manage_students");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error adding student");
    }
  };
});

router.post("/manage_students/delete_student", async (req, res) => {
  if (!req.session.user || req.session.user.role != "admin"){
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
    
    res.redirect('/admin/manage_students');
  };
});

router.post("/manage_students/edit_student", async (req, res) => {
  if (!req.session.user || req.session.user.role != "admin"){
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
  if (!req.session.user || req.session.user.role != "admin"){
    return res.redirect("/")
  }

  else{
    const { fullName, grade, mathScore, englishScore, scienceScore, real_id } = req.body;
    const realGrade = grade.startsWith("Grade ") ? grade : "Grade " + grade;

    try {
        await runAsync('UPDATE users SET name = ?, class = ?, math = ?, english = ?, science = ? WHERE id = ?',
            [fullName, realGrade, mathScore, englishScore, scienceScore, real_id]);
        console.log("Updated successfully");
        res.redirect('/admin/manage_students') 
    } catch(error) {
        console.log(error.message);
        return res.status(500).send("Error saving student details");
    }
  };
})

module.exports = router;
