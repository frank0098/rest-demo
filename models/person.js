// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var PersonSchema   = new mongoose.Schema({
  firstName: String,
  lastName: String 
},{ strict: false });

// Export the Mongoose model
module.exports = mongoose.model('Person', PersonSchema);
