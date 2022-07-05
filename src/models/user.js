'use strict';
const mongoose = require('mongoose');
const schema = mongoose.Schema;

const validateEmail = function(email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email)
};

const userSchema = new schema({
	first_name: {
    type:String,
    required:true,
  },
	last_name: {
    type:String,
    required:true,
  },
	email_id: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: 'Email address is required',
  },
	password: String,
  address : {
    type: String
  },
  profile_image_path: String,
},{timestamps:true})

const user = mongoose.model('user', userSchema);

module.exports = user;