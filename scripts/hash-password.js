// Run this script with Node.js to hash a password for manual DB update
const bcrypt = require('bcryptjs');

const password = 'YOUR_PLAIN_TEXT_PASSWORD'; // Change this to your password
const saltRounds = 12;

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) throw err;
  console.log('Hashed password:', hash);
});
