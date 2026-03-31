const { supabase } = require("../config/supabaseClient");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;

// const password = "supersecurepassword";
// const name = "Isaac Ime";
// const role = "superadmin";
// const email = "admin@example.com";

// async function createUser() {
//   try {
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     const { error } = await supabase
//       .from('staff')
//       .insert([{ name, email, password: hashedPassword, role }]);

//     if (error) console.error(error.message);
//     else console.log("User created successfully!");
//   } catch (err) {
//     console.error(err);
//   }
// }

// createUser();

async function deleteUser(id) {
    const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);

    if (error){
        console.log(error.message);
    }
    else{
        console.log("Deleted Successfully!")
    }
}

// deleteUser(15);
