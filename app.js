var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var fs = require('fs');

app.use(bodyParser.json());

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './temp/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, makeid() + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            return callback(new Error('Wrong file type'));
        }
        callback(null, true);
    }
}).single('file');

app.post('/parse', function (req, res) {
    var exceltojson;
    upload(req, res, function (err) {
        if (err) {
            res.json({error_code: 1, err_desc: err});
            return;
        }
        if (!req.file) {
            res.json({error_code: 1, err_desc: "No file passed"});
            return;
        }
        if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }
        console.log(req.file.path);
        try {
            exceltojson({
                input: req.file.path,
                output: null,
                lowerCaseHeaders: true
            }, function (err, result) {
                fs.unlinkSync(req.file.path);
                if (err) {
                    return res.json({error_code: 1, err_desc: err, data: null});
                }
                res.json({error_code: 0, err_desc: null, data: result});
            });
        } catch (err) {
            res.json({error_code: 1, err_desc: "Not a proper excel file"});
        }
    })

});

// Commenting to eliminate UI case
// app.use(express.static('public'));
//
// app.get('/', function (req, res) {
//     res.sendFile(__dirname + "/index.html");
// });

app.listen('3000', function () {
    console.log('running on 3000...');
});