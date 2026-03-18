const db = require("../db/database")
// const bcrypt = require("bcrypt");
// const saltRounds = 10;

// const password = "supersecurepassword";
// const name = "Isaac Ime";
// const role = "superadmin";
// const email = "admin@example.com";

// async function createUser() {
//   try {
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     db.run(
//       `INSERT INTO staff (name, email, password, role) VALUES (?, ?, ?, ?)`,
//       [name, email, hashedPassword, role],
//       (err) => {
//         if (err) console.error(err);
//         else console.log("User created successfully!");
//       }
//     );
//   } catch (err) {
//     console.error(err);
//   }
// }

// createUser();
db.run("DELETE FROM staff WHERE id = ?", [15], (err) => {
  if (err){
    console.log(err.message);
  }
  else{
    console.log("Deleted Successfully!")
  }
});
