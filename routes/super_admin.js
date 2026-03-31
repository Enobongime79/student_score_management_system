var express = require('express');
var router = express.Router();
const { supabase } = require('../config/supabaseClient');
const bcrypt = require("bcrypt");
const saltRounds = 10;

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (!req.session.user || req.session.user.role != "superadmin"){
    return res.redirect("/")
  }
  else {
    res.render('superadmin', {id: req.session.user.id});
    console.log(req.session.user.id);
  }

});

router.get("/manage_admins", async (req, res) => {
   if (!req.session.user || req.session.user.role != "superadmin"){
    return res.redirect("/")
  }

  else{
    const { data: rows, error } = await supabase
        .from('admins')
        .select(`
            *,
            staff (*)
        `);

    if (error){
        console.log(error.message)
        return res.status(500).send("Error fetching admins")
    }
    
    rows.forEach(admin => {
        admin.real_id = 'ADM_' + admin.id;
        // Merge staff properties if needed by frontend
        if (admin.staff) {
            admin.name = admin.staff.name;
            admin.email = admin.staff.email;
        }
    })

    res.render('manageAdmins', { title: 'Admin Manager', admins: rows });
  }
})

router.get("/manage_teachers", async (req, res) => {
   if (!req.session.user || req.session.user.role != "superadmin"){
    return res.redirect("/")
  }

  else{
    const { data: rows, error } = await supabase
        .from('teachers')
        .select(`
            *,
            staff (*)
        `);

    if (error){
        console.log(error.message)
        return res.status(500).send("Error fetching teachers")
    }

    rows.forEach(teacher => {
        teacher.real_id = 'TEA_' + teacher.id;
        teacher.grade = "Grade " + teacher.class;
        if (teacher.staff) {
            teacher.name = teacher.staff.name;
            teacher.email = teacher.staff.email;
        }
    })

    res.render('manageTeachers', { title: 'Teacher Manager', teachers: rows });
  }
})

router.post("/manage_teachers/add_teachers", async (req, res) => {
  if (!req.session.user || req.session.user.role != "superadmin"){
    return res.redirect("/")
  }

  else{
    const { name, email, grade } = req.body;
    const password = "teacher12345";
    const role = 'teacher';

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert into staff first
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

        // Insert into teachers
        const { error: teacherError } = await supabase
            .from('teachers')
            .insert([{ name, class: grade, teacher_id: staffId }]);

        if (teacherError) {
            console.log(teacherError.message);
            return res.status(500).send("Error adding teacher");
        }
        
        console.log("Inserted Successfully!");
        return res.redirect('/super_admin/manage_teachers');
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
  }
})

router.post("/manage_teachers/edit_teachers", async (req, res) => {
  if (!req.session.user || req.session.user.role != "superadmin"){
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
        // Flatten for frontend
        const flatRow = {
            ...row,
            ...row.staff,
            id: row.id // original teacher id
        };
        console.log("Successfully got the row");
        res.json(flatRow);
        console.log(flatRow);
    }
  }
})

router.post("/manage_teachers/save_details", async (req, res) => {
  if (!req.session.user || req.session.user.role != "superadmin"){
    return res.redirect("/")
  }

  else{
    const { editFullName, editGrade, editEmail, real_id } = req.body;

    try {
        // Update teacher
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

        // Update staff
        const { error: staffError } = await supabase
            .from('staff')
            .update({ name: editFullName, email: editEmail })
            .eq('id', staffId);

        if (staffError){
            console.log(staffError.message);
        }
        else{
            console.log("Updated the teachers details in the staff table!");
            return res.redirect("/super_admin/manage_teachers")
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
  }
});

router.post("/manage_teachers/delete_teachers", async (req, res) => {
   if (!req.session.user || req.session.user.role != "superadmin"){
    return res.redirect("/")
  }

  else{
    const { id } = req.body;

    try {
        const { data: teacher, error: fetchError } = await supabase
            .from('teachers')
            .select('teacher_id')
            .eq('id', id)
            .single();

        if (fetchError || !teacher){
            return console.log(`Row with id:${id} does not exist in the database!`)
        }

        const staffId = teacher.teacher_id;

        // Delete teacher
        const { error: deleteTeacherError } = await supabase
            .from('teachers')
            .delete()
            .eq('id', id);

        if (deleteTeacherError){
          return console.error(deleteTeacherError.message);
        }

        // Delete staff
        const { error: deleteStaffError } = await supabase
            .from('staff')
            .delete()
            .eq('id', staffId);

        if (deleteStaffError){
            return console.log(deleteStaffError.message)
        }
        
        console.log("Successfully deleted from the staff table!")
        return res.redirect('/super_admin/manage_teachers')
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
  }
});


router.post("/manage_admins/add_admins", async (req, res) => {
  if (!req.session.user || req.session.user.role != "superadmin"){
    return res.redirect("/")
  }

  else{
    const { name, email } = req.body;
    const password = "admin12345";
    const role = 'admin';

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert into staff
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

        // Insert into admins
        const { error: adminError } = await supabase
            .from('admins')
            .insert([{ name, admin_id: staffId }]);

        if (adminError) {
            console.log(adminError.message);
            return res.status(500).send("Error adding admin");
        }
        
        console.log("Inserted Successfully!");
        return res.redirect('/super_admin/manage_admins')
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
  }
})

router.post("/manage_admins/edit_admins", async (req, res) => {
  if (!req.session.user || req.session.user.role != "superadmin"){
    return res.redirect("/")
  }

  else{
    const { id } = req.body;
    
    const { data: row, error } = await supabase
        .from('admins')
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
        // Flatten
        const flatRow = {
            ...row,
            ...row.staff,
            id: row.id // admin table id
        };
        console.log("Successfully got the row");
        res.json(flatRow);
        console.log(flatRow);
    }
  };
});

router.post("/manage_admins/save_details", async (req, res) =>{
  if (!req.session.user || req.session.user.role != "superadmin"){
    return res.redirect("/")
  }

  else{
    const { editFullName, editEmail, real_id } = req.body;
    
    try {
        // Update admin
        const { data: admin, error: adminError } = await supabase
            .from('admins')
            .update({ name: editFullName })
            .eq('id', real_id)
            .select('admin_id')
            .single();

        if (adminError){
          console.log(adminError.message);
          return res.send("Error updating admin!")
        }

        const staffId = admin.admin_id;

        // Update staff
        const { error: staffError } = await supabase
            .from('staff')
            .update({ name: editFullName, email: editEmail })
            .eq('id', staffId);

        if (staffError){
            console.log(staffError.message);
            return res.status(500).send("Error updating staff");
        }
        else{
            console.log("Updated the admins details in the staff table!");
            return res.redirect("/super_admin/manage_admins")
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
  }
});

router.post("/manage_admins/delete_admin", async (req, res) => {
  if (!req.session.user || req.session.user.role != "superadmin"){
    return res.redirect("/")
  }

  else{
    const { id } = req.body;

    try {
        const { data: admin, error: fetchError } = await supabase
            .from('admins')
            .select('admin_id')
            .eq('id', id)
            .single();

        if (fetchError || !admin){
            return console.log(`Row with id:${id} does not exist in the database!`)
        }

        const staffId = admin.admin_id;

        // Delete admin
        const { error: deleteAdminError } = await supabase
            .from('admins')
            .delete()
            .eq('id', id);

        if (deleteAdminError){
          return console.error(deleteAdminError.message);
        }

        // Delete staff
        const { error: deleteStaffError } = await supabase
            .from('staff')
            .delete()
            .eq('id', staffId);

        if (deleteStaffError){
            return console.log(deleteStaffError.message)
        }
        
        console.log("Successfully deleted from the staff table!")
        return res.redirect('/super_admin/manage_admins')
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
  };
});

router.post("/change_password", async (req, res) => {
  if (!req.session.user || req.session.user.role != "superadmin"){
    return res.redirect("/")
  }

  else{
    const { id, newPassword } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        const { error, count } = await supabase
            .from('staff')
            .update({ password: hashedPassword })
            .eq('id', id);

        if (error) {
            console.log(error.message);
            return res.status(500).json({ success:false, message: "Database error"});
        }

        return res.json({success: true, message:"Password Updated"})
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };
});

router.get('/manage_students', async (req, res, next) => {
  if (!req.session.user || req.session.user.role != "superadmin"){
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
    
    rows.forEach(student => {
        student.average = ((student.math + student.english + student.science) / 3).toFixed(2);
        student.real_id = 'STU_' + student.id;
        student.total = (student.math + student.english + student.science);
    });

    res.render('admin_student', { title: 'Student Score Management System', students: rows });
  }

});

router.post('/manage_students/add_student', async (req, res) => {
  if (!req.session.user || req.session.user.role != "superadmin"){
    return res.redirect("/")
  }

  else{
    const { fullName, grade, mathScore, englishScore, scienceScore} = req.body;
    const realGrade = grade.startsWith("Grade ") ? grade : "Grade " + grade;

    const { error } = await supabase
        .from('users')
        .insert([{
            name: fullName,
            class: realGrade,
            math: mathScore,
            english: englishScore,
            science: scienceScore
        }]);

    if (error) {
        console.log(error.message);
        return res.status(500).send("Error adding student");
    }

    return res.redirect("/admin/manage_students");
  }
});

router.post("/manage_students/delete_student", async (req, res) => {
  if (!req.session.user || req.session.user.role != "superadmin"){
    return res.redirect("/")
  }

  else{
    const { id } = req.body;
    
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

    if (error){
        return console.error(error.message);
    }
    else {
        console.log(id)
        console.log("Deleted Successfully")
    }
    
    res.redirect('/admin/manage_students');
  };
});

router.post("/manage_students/edit_student", async (req, res) => {
  if (!req.session.user || req.session.user.role != "superadmin"){
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
  if (!req.session.user || req.session.user.role != "superadmin"){
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
        res.redirect('/students') // Original code had /students
    }
  }
})

module.exports = router;
