var express = require('express');
var router = express.Router();
const db = require("../db/database");
const bcrypt = require("bcrypt");
const saltRounds = 10;

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (!req.session.user){
    return res.redirect("/")
  }
  else {
    res.render('superadmin');
  }

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

router.post("/manage_teachers/add_teachers", (req, res) => {
  const { name, email, grade } = req.body;
  const password = "teacher12345";
  const role = 'teacher';
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
          `INSERT INTO teachers (name, class, teacher_id) VALUES (?, ?, ?)`,
          [name, grade, staffId],
          (err) => {
            if (err) console.log(err.message);
            else console.log("Inserted Successfully!");
          }
        );
      }
    );
    return res.redirect('/super_admin/manage_teachers')
    }
      catch (err) {
      console.error(err);
    }
  }

createUser();

})

router.post("/manage_teachers/edit_teachers", (req, res) => {
  const { id } = req.body;
  const query = `SELECT * FROM staff JOIN teachers ON staff.id = teachers.teacher_id WHERE teachers.id = ?`;

  db.get(query, [id], (err, row) => {
    if (err){
      res.status(500).json({ error: err.message})
    }
    else {
      console.log("Successfully got the row");
      res.json(row);
      console.log(row);
    }
  })
})

router.post("/manage_teachers/save_details", (req, res) => {
  const { editFullName, editGrade, editEmail, real_id } = req.body;
  const query = `UPDATE teachers SET name = ?, class = ? WHERE id = ?`;
  let staff_id;

    db.run(query, [editFullName, editGrade, real_id], (err) => {
      if (err){
        console.log(err.message);
        return res.send("Error updating teacher!")
      }

      db.get(`SELECT teacher_id FROM teachers WHERE id = ?`, [real_id], (err, result) => {
        if (err){
          console.log(err.message);
          return res.send("Error fetching teacher_id");
        }

        if (!result) {
          return res.send("Teacher not found!")
        }

        staff_id = result.teacher_id

        db.run(`UPDATE staff SET name = ?, email = ? WHERE id = ?`, [editFullName, editEmail, staff_id], (err) => {
          if (err){
            console.log(err.message);
          }
          else{
            console.log("Updated the teachers details in the staff table!");
            return res.redirect("/super_admin/manage_teachers")
          }
        });
      });
    });
});

router.post("/manage_teachers/delete_teachers", (req, res) => {
  const { id } = req.body;
  const query = `DELETE FROM teachers WHERE id = ?`;
  let staff_id;

  db.get(`SELECT teacher_id FROM teachers WHERE id = ?`, [id], (err, result) => {
    if (err){
      return console.error(err.message);
    }
    if (!result){
      return console.log(`Row with id:${id} does not exist in the database!`)
    }

    staff_id = result.teacher_id

    db.run(query, [id], function (err) {

      if (err){
        return console.error(err.message);
      }

      db.run(`DELETE FROM staff WHERE id = ?`, [staff_id], (err, result) => {
        if (err){
          return console.log(err.message)
        }
        
        console.log("Successfully deleted from the staff table!")

        return res.redirect('/super_admin/manage_teachers')
      });
    });
  });
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

        const staffId = this.lastID;

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

router.post("/manage_admins/edit_admins", (req, res) => {
  const { id } = req.body;
  const query = `SELECT * FROM staff JOIN admins ON staff.id = admins.admin_id WHERE admins.id = ?`;

  db.get(query, [id], (err, row) => {
    if (err){
      res.status(500).json({ error: err.message})
    }
    else {
      console.log("Successfully got the row");
      res.json(row);
      console.log(row);
    }
  })
})

router.post("/manage_admins/save_details", (req, res) =>{
  const { editFullName, editEmail, real_id } = req.body;
  const query = `UPDATE admins SET name = ? WHERE id = ?`;
  let staff_id;
  console.log(editFullName)

  db.run(query, [editFullName, real_id], (err) => {
      if (err){
        console.log(err.message);
        return res.send("Error updating admin!")
      }

      db.get(`SELECT admin_id FROM admins WHERE id = ?`, [real_id], (err, result) => {
        if (err){
          console.log(err.message);
          return res.send("Error fetching admin_id");
        }

        if (!result) {
          return res.send("Admin not found!")
        }

        staff_id = result.admin_id;
        console.log(staff_id)

        db.run(`UPDATE staff SET name = ?, email = ? WHERE id = ?`, [editFullName, editEmail, staff_id], (err) => {
          if (err){
            console.log(err.message);
          }
          else{
            console.log("Updated the admins details in the staff table!");
            return res.redirect("/super_admin/manage_admins")
          }
        });
      });
    });
})

module.exports = router;
