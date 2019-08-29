/*Created by F.s on 2019/7/2*/

var mongoose = require('mongoose');
var categoriesSchema = require('../schemas/categories');

module.exports = mongoose.model('Category', categoriesSchema);