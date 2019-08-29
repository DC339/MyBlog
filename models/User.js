/*Created by F.s on 2019/6/30*/

var mongoose = require('mongoose');
var usersSchema = require('../schemas/users');

module.exports = mongoose.model('User', usersSchema);