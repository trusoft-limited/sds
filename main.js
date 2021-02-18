//require('dotenv').config();
express = require("express");
path = require("path");
winston = require("winston");
log = require("winston-color");
bodyParser = require("body-parser");
xmlparser = require('express-xml-bodyparser');
cookieParser = require("cookie-parser");
requestIp = require('request-ip');
pg = require("pg");
cors = require("cors");
helmet = require("helmet");
//crypto = require("crypto");
fileUpload = require("express-fileupload");
ejs = require('ejs');
fs = require('fs');
fileExtension = require('file-extension');
bcrypt = require('bcryptjs');
nodemailer = require("nodemailer");
smtpTransport = require('nodemailer-smtp-transport');
randomstring = require("randomstring");
PDFDocument = require('pdfkit');
doc = new PDFDocument({"size": 'A4', "margins": 20});
cryptoRandomString = require('crypto-random-string');
parseString = require('xml2js').parseString;
crypto = require('crypto');

domain = "localhost:9800";

//BIZZDESK
transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'trusoftng@gmail.com',
        pass: 'cdwtyrcxuoidmpzj'
    }
});


var PORT = 9800;
var algorithm = "aes-256-ctr";
passworddb = "unifiedpaymentservicelimitedtoluuzozieoliver1234094899hjfhjahdjhejrkku£$";
passwordtoken = "*(*9hjfhjahdjhejrkku£$%^unifiedpaymentservicelimitedikehjd)IKDJuzozi";

app = express();
app.use(cors());
app.use(helmet());
app.use(fileUpload());
app.use(xmlparser({
    explicitArray: false,
    normalize: false,
    normalizeTags: false,
    trim: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser("*wisdo(*(*(Dh%$£14*(*^$£$£mesadthatilove%$£$£$£-_"));

logger = winston.createLogger({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({
            name: 'info-file',
            filename: 'logs/info/filelog-info.log',
            maxsize:'10000000', 
            maxFiles:'10', 
            timestamp:true, 
            colorize: true,
            level: 'info'
        }),
        new (winston.transports.File)({
            name: 'error-file',
            filename: 'logs/error/filelog-error.log',
            maxsize:'10000000', 
            maxFiles:'10', 
            timestamp:true, 
            colorize: true,
            level: 'error'
        }),
        new (winston.transports.File)({
            name: 'debug-file',
            filename: 'logs/debug/filelog-debug.log',
            maxsize:'10000000', 
            maxFiles:'10', 
            timestamp:true, 
            colorize: true,
            level: 'debug'
        })
    ]
});

app.use(requestIp.mw());
app.use("/", express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

datetime = function()
{
    var str = "";
    var currentTime = new Date();
    var year = currentTime.getFullYear();
    var mnt = currentTime.getMonth() + 1;
    var day = currentTime.getDate();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var seconds = currentTime.getSeconds();
    if(mnt < 10)
    {
        mnt = "0" + mnt;
    }
    if(day < 10)
    {
        day = "0" + day
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    str += year + ":" + mnt + ":" + day + " " + hours + ":" + minutes + ":" + seconds + " ";
    if(hours > 11){
        str += "PM";
    } else {
        str += "AM";
    }
    return str;
}

compareDate = function(sessionDecrypted, fromDatabase)
    {
        if (sessionDecrypted === fromDatabase)
            return true;
        else
            return false;
    }

getDateTimeSpec = function()
    {
        var str = "";
        var currentTime = new Date();
        var year = currentTime.getFullYear();
        var mnt = currentTime.getMonth() + 1;
        var day = currentTime.getDate();
        var hours = currentTime.getHours() + 1;
        var minutes = currentTime.getMinutes();
        var seconds = currentTime.getSeconds();
        if(mnt < 10)
        {
            mnt = "0" + mnt;
        }
        if(day < 10)
        {
            day = "0" + day
        }
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        str += year + "-" + mnt + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
        return str;
    }

    
getDateTime = function()
    {
        var str = "";
        var currentTime = new Date();
        var year = currentTime.getFullYear();
        var mnt = currentTime.getMonth() + 1;
        var day = currentTime.getDate();
        var hours = currentTime.getHours();
        var minutes = currentTime.getMinutes();
        var seconds = currentTime.getSeconds();
        if(mnt < 10)
        {
            mnt = "0" + mnt;
        }
        if(day < 10)
        {
            day = "0" + day
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        str += year + ":" + mnt + ":" + day + ":" + hours + ":" + minutes + ":" + seconds + " ";
        if(hours > 11){
            str += "PM";
        } else {
            str += "AM";
        }
        return str;
    }

    
encryptData = function(text, password) 
    { 
        try
        {
            var cipher = crypto.createCipher(algorithm, password)
            var crypted = cipher.update(text,'utf8','hex')
            crypted += cipher.final('hex');
            return crypted;
        }catch(e)
        {
            console.log("Cipher encryption Error");
            return null;
        }
    }


decryptData = function(text, password) 
    { 
        try
        {
            var decipher = crypto.createDecipher(algorithm, password)
            var dec = decipher.update(text,'hex','utf8')
            dec += decipher.final('utf8');
            return dec;
        }catch(e)
        {
            console.log("Cipher decryption Error");
            return null;
        }
    }

    
pool = new pg.Pool({
            user: 'postgres',
            host: '64.227.43.124',
            database: 'sdstrusoft',
            password: 'Admin@123456',
            port: 5432
        });

//Test db connection
pool.query("SELECT NOW();", (err, res) => {
    if (err) 
    {
        logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
    }
    else
    {
        logger.info("Server is now connected to postgresql database.... Time: " + new Date().toLocaleString());
    }
    //pool.end();
});

//Check for favicon
function ignoreFavicon(req, res, next) {
    if (req.originalUrl === '/favicon.ico') {
      res.status(204).json({nope: true});
    } else {
      next();
    }
}

app.use(ignoreFavicon);
//Login api
var raw = require("./routes/login_api/api.js");
app.use("/api/login-user/", raw);
//Register api
var api = require("./routes/login_api/register.js");
app.use("/api/user-register/", api);
//Recharge pin
var ussd = require("./routes/login_api/ussd.js");
app.use("/api/consume-ussd/", ussd);
var ussd2 = require("./routes/login_api/ussd2.js");
app.use("/api/consume-ussd2/", ussd2);
var ussd2 = require("./routes/login_api/ussd3.js");
app.use("/api/consume-ussd3/", ussd2);

//Dashboard
var screen = require("./routes/dashboard/sds.js");
app.use("/sds/", screen);

/*app.get("/", function(req, res)
{
    try
    {
        res.status(200).render("home/welcome", {});
    }catch(e)
    {
        logger.info(e);
        logger.error("SDS Home Page could not be served to " + req.clientIp);
        res.status(200).send("We are currently maintaining this application. Retry later");
    }
});*/

app.get("/", function(req, res)
{
    try
    {
        logger.info("Landing Page Served to: " + req.clientIp);
        res.status(200).render("home/landing", {});
    }catch(e)
    {
        logger.info(e);
        logger.error("SDS Home Page could not be served to " + req.clientIp);
        res.status(200).send("We are currently maintaining this application. Retry later");
    }
});

app.get("/register", function(req, res)
{
    try
    {
        var qry = "DELETE FROM tokens WHERE token = $1";
        pool.query(qry, [req.cookies.token_tcm], (err, result) => {
            if (err) 
            {
                logger.error("SDS Register Session Database Issue " + req.clientIp);
                res.redirect("/");
            }else
            {
                if(req.cookies.token_tcm)
                    logger.info("SDS Logout for client session: " + req.cookies.token_tcm 
                    + " Ip: " +  req.clientIp + "  " + new Date().toLocaleString());
                else
                    logger.info("SDS Register Page Successfully saved to " + req.clientIp + "  " + new Date().toLocaleString());
                res.clearCookie('token_tcm');
                res.status(200).render("home/welcome", {abbre: req.signedCookies['abbreviation'], 
                fullname: req.signedCookies['fullname'], appname: req.signedCookies['appname'], 
                compabbr: req.signedCookies['compabbr']});
            }
        });
    }catch(e)
    {
        logger.info(e);
        logger.error("SDS Register Page could not be served to " + req.clientIp);
        res.redirect("/");
    }
});

app.get("/login", function(req, res)
{
    try
    {
        var qry = "DELETE FROM tokens WHERE token = $1";
        pool.query(qry, [req.cookies.token_tcm], (err, result) => {
            if (err) 
            {
                logger.error("SDS Login Session Database Issue " + req.clientIp);
                res.redirect("/");
            }else
            {
                if(req.cookies.token_tcm)
                    logger.info("SDS Logout for client session: " + req.cookies.token_tcm 
                    + " Ip: " +  req.clientIp + "  " + new Date().toLocaleString());
                else
                    logger.info("SDS Login Page Successfully saved to " + req.clientIp + "  " + new Date().toLocaleString());
                res.clearCookie('token_tcm');
                res.status(200).render("login/login", {abbre: req.signedCookies['abbreviation'], 
                fullname: req.signedCookies['fullname'], appname: req.signedCookies['appname'], 
                compabbr: req.signedCookies['compabbr']});
            }
        });
    }catch(e)
    {
        logger.info(e);
        logger.error("SDS Login Page could not be served to " + req.clientIp);
        res.redirect("/");
    }
});

// console.log(encryptData("Admin@123456", passworddb));

app.all("*", function(req, res)
{
    logger.info(req.url)
    logger.info("Wrong URL. Redirecting to home. From: " + req.clientIp + ". Time: " + new Date().toLocaleString());
    res.redirect("/");
});

app.listen(PORT, function()
{
    logger.info("SDS APPLICATION UP ON " + PORT + ". Time: " + new Date().toLocaleString());
});

