var express = require('express');
var router = express.Router();
const { supabase } = require('../config/supabaseClient');
const bcrypt = require("bcrypt")

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
    const { data: result, error } = await supabase
        .from('teachers')
        .select('class')
        .eq('teacher_id', req.session.user.id)
        .single();

    if (error || !result){
        console.log(error ? error.message : "Row not found!");
        return res.redirect("/");
    }

    const grade = result.class.startsWith("Grade ") ? result.class : "Grade " + result.class;

    const { data: rows, error: rowsError } = await supabase
        .from('users')
        .select('*')
        .eq('class', grade);

    if (rowsError){
        console.log(rowsError.message)
        return res.status(500).send("Error fetching students")
    }

    rows.forEach(student => {
        student.average = ((student.math + student.english + student.science) / 3).toFixed(2);
        student.real_id = 'STU_' + student.id;
        student.total = (student.math + student.english + student.science);
    });

    res.render('teacher_student', { title: 'Student Score Management System', students: rows });
  };
});

router.post('/manage_students/add_student', async (req, res) => {
  if (!req.session.user || req.session.user.role != "teacher"){
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
      return res.status(500).send("Error inserting student");
    }
    
    return res.redirect("/teacher/manage_students");
  };
});

router.post("/manage_students/delete_student", async (req, res) => {
  if (!req.session.user || req.session.user.role != "teacher"){
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
    
    res.redirect("/teacher/manage_students");
  };
});

router.post("/manage_students/edit_student", async (req, res) => {
  if (!req.session.user || req.session.user.role != "teacher"){
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
  if (!req.session.user || req.session.user.role != "teacher"){
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
        res.redirect("/teacher/manage_students")
    }
  };
})

module.exports = router;
