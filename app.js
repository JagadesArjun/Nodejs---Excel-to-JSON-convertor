var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var excelToJson = require('convert-excel-to-json');
var fs = require('fs');
var cors = require('cors');

app.use(cors());

app.use(bodyParser.json());

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './temp/')
    },
    filename: function (req, file, cb) {
        cb(null, makeid() + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        if (['xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            return callback(new Error('Wrong file type'));
        }
        callback(null, true);
    }
}).single('file');

app.post('/parse', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            res.json({error_code: 1, err_desc: err});
            return;
        }
        if (!req.file) {
            res.json({error_code: 1, err_desc: "No file passed"});
            return;
        }
        console.log(req.file.path);
        try {

            const result = excelToJson({
                sourceFile: req.file.path,
                columnToKey: {
                    '*': '{{columnHeader}}'
                },
                header:{
                    rows: 1
                },
            });
            fs.unlinkSync(req.file.path);
            res.json({error_code: 0, err_desc: null, data: result});
        } catch (err) {
            res.json({error_code: 1, err_desc: "Not a proper excel file"});
        }
    })

});

// // Commenting to eliminate UI case
// app.use(express.static('public'));
//
// app.get('/', function (req, res) {
//     res.sendFile(__dirname + "/index.html");
// });

app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function () {
    console.log('running on 3000...');
});
