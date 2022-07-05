'use strict';
const mongoose = require('mongoose');
const schema = mongoose.Schema;


const menuSchema = new mongoose.Schema({
    item:String,
    item_price:String,
})

const restaurantSchema = new schema({
	restaurant_name: {
    type:String,
    required:true,
  },
	restaurant_latitude: {
    type:String,
    required:true,
  },
	restaurant_longitude: {
      type: String,
      required: 'Email address is required',
  },
    menu : {
      type: [menuSchema]
    },
},{timestamps:true})

const menu = mongoose.model('menu', menuSchema);
const restaurants = mongoose.model('restaurant', restaurantSchema);

module.exports = {menu,restaurants};