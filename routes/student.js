var express = require('express');
var router = express.Router();
const { supabase } = require('../config/supabaseClient');

/* GET home page. */
router.get('/', async function(req, res, next) {

  if (!req.session.user){
    return res.redirect("/")
  }

  else{
    const { data: rows, error } = await supabase
        .from('users')
        .select('*');

    if (error){
      console.log(error.message)
      return res.status(500).send("Error fetching students")
    }
    
    console.log(rows);

    rows.forEach(student => {
      student.average = ((student.math + student.english + student.science) / 3).toFixed(2);
      student.real_id = 'STU_' + student.id;
      student.total = (student.math + student.english + student.science);
    });

    res.render('student', { title: 'Student Score Management System', students: rows });
  }

});

router.post('/', async (req, res) => {
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
    return res.status(500).send("Error inserting user");
  }

  console.log("Inserted successfully");
  return res.redirect("/students")
});

router.post("/delete", async (req, res) => {
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
  
  res.redirect('/students')
})

router.post("/edit", async (req, res) => {
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
})

router.post("/save_details", async (req, res) => {
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
    return res.status(500).send("Error updating student");
  }
  else{
    console.log("Updated successfully");
    res.redirect('/students')
  }
})

module.exports = router;
