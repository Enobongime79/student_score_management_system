var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { supabase } = require('../config/supabaseClient');

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
    const { data: rows, error } = await supabase
      .from('teachers')
      .select(`
        *,
        staff (*)
      `);

    if (error) {
      console.log(error.message);
      return res.status(500).send("Error fetching teachers");
    } else {
      rows.forEach(teacher => {
        teacher.real_id = 'TEA_' + teacher.id;
        teacher.grade = "Grade " + teacher.class;
      });

      return res.render('admin_manageTeachers', {
        title: 'Teacher Manager',
        teachers: rows
      });
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

        // Insert into staff table
        const { data: staffData, error: staffError } = await supabase
            .from('staff')
            .insert([{ name, email, password: hashedPassword, role }])
            .select()
            .single();

        if (staffError) {
            console.log(staffError.message);
            return res.status(500).send("Error adding staff");
        }

        const staffId = staffData.id;

        // Insert into teachers table
        const { error: teacherError } = await supabase
            .from('teachers')
            .insert([{ name, class: grade, teacher_id: staffId }]);

        if (teacherError) {
            console.log(teacherError.message);
            return res.status(500).send("Error adding teacher");
        }

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
    
    const { data: row, error } = await supabase
        .from('teachers')
        .select(`
            *,
            staff (*)
        `)
        .eq('id', id)
        .single();

    if (error){
        return res.status(500).json({ error: error.message})
    }
    else {
        // Flatten the staff data for consistency with frontend expectations if needed
        const flatRow = {
            ...row,
            ...row.staff,
            id: row.id // keep teacher id as 'id'
        };
        console.log("Successfully got the row");
        res.json(flatRow);
        console.log(flatRow);
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
        // Update teachers table
        const { data: teacher, error: teacherError } = await supabase
            .from('teachers')
            .update({ name: editFullName, class: editGrade })
            .eq('id', real_id)
            .select('teacher_id')
            .single();

        if (teacherError){
          console.log(teacherError.message);
          return res.send("Error updating teacher!")
        }

        const staffId = teacher.teacher_id;

        // Update staff table
        const { error: staffError } = await supabase
            .from('staff')
            .update({ name: editFullName, email: editEmail })
            .eq('id', staffId);

        if (staffError){
            console.log(staffError.message);
            return res.send("Error updating staff!")
        }
        
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
        // Get teacher_id first
        const { data: teacher, error: fetchError } = await supabase
            .from('teachers')
            .select('teacher_id')
            .eq('id', id)
            .single();

        if (fetchError || !teacher){
            return console.log(`Row with id:${id} does not exist in the database!`)
        }

        const staffId = teacher.teacher_id;

        // Delete from teachers
        const { error: deleteTeacherError } = await supabase
            .from('teachers')
            .delete()
            .eq('id', id);

        if (deleteTeacherError){
          return console.error(deleteTeacherError.message);
        }

        // Delete from staff
        const { error: deleteStaffError } = await supabase
            .from('staff')
            .delete()
            .eq('id', staffId);

        if (deleteStaffError){
            return console.log(deleteStaffError.message)
        }
        
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
    const { data: rows, error } = await supabase
        .from('users')
        .select('*');

    if (error){
        console.log(error.message)
        return res.status(500).send("Error fetching students");
    }
    
    console.log(rows);

    rows.forEach(student => {
        student.average = ((student.math + student.english + student.science) / 3).toFixed(2);
        student.real_id = 'STU_' + student.id;
        student.total = (student.math + student.english + student.science);
    });

    res.render('admin_student', { title: 'Student Score Management System', students: rows });
  };
});

router.post('/manage_students/add_student', async(req, res) => {
  if (!req.session.user || req.session.user.role != "admin"){
    return res.redirect("/")
  }

  else{
    const { fullName, grade, mathScore, englishScore, scienceScore} = req.body;

    const { data, error } = await supabase
    .from('users')
    .insert([{
      name: fullName,
      class: `Grade ${grade}`,
      math: mathScore,
      english: englishScore,
      science: scienceScore
    }]);

    if (error) {
      console.error(error);
      return res.status(500).send("Error adding student");
    }
    
    console.log("Inserted Student:", data)
    return res.redirect("/admin/manage_students");
  };
});

router.post("/manage_students/delete_student", async (req, res) => {
  if (!req.session.user || req.session.user.role != "admin"){
    return res.redirect("/")
  }

  else{
    const { id } = req.body;
    
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

    if (error){
        console.error(error.message);
    }
    else {
        console.log(id)
        console.log("Deleted Successfully")
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
    
    const { data: result, error } = await supabase
        .from('users')
        .select('id, name, class, math, english, science')
        .eq('id', id)
        .single();

    if (error){
        res.status(500).json({ error: error.message})
    }
    else {
        res.json(result);
        console.log(result);
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

    const { error } = await supabase
        .from('users')
        .update({
            name: fullName,
            class: realGrade,
            math: mathScore,
            english: englishScore,
            science: scienceScore
        })
        .eq('id', real_id);

    if (error){
        console.log(error.message);
        return res.status(500).send("Error saving student details");
    }
    else{
        console.log("Updated successfully");
        res.redirect('/admin/manage_students') // Fixed redirect path based on routine
    }
  };
})

module.exports = router;
