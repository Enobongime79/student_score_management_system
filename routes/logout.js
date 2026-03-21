var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error destroying session:", err);
      return res.status(500).send("Logout failed");
    }

    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

module.exports = router;
