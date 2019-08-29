/*Created by F.s on 2019/7/2*/

var mongoose = require('mongoose');
var contentsSchema = require('../schemas/contents');

module.exports = mongoose.model('Content', contentsSchema);