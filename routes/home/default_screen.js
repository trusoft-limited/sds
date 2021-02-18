var router = express.Router();

router.get("/", function(req, res)
{
    res.clearCookie('abbreviation');
    res.clearCookie('fullname');
    res.clearCookie('appname');
    res.clearCookie('compabbr');
    try
    {
        res.redirect("/channels/login");
    }catch(e)
    {
        logger.error("Home could not be served to " + req.clientIp);
        res.status(500).send("We are currently maintaining this application. We will be back online soon");
    }
});

router.post("/contact", function(req, res)
{
    var str = new Date().toLocaleString();
    var name = req.body.name;
    var email = req.body.email;
    var subject = req.body.subject;
    var message = req.body.message;
    logger.info("Contact Post Message from: " + req.clientIp + ". Body: " + JSON.stringify(req.body) + ". Time: " + str);
    if((name.length < 1 || name.length > 100) || (email.length < 1 || email.length > 100)
        || (subject.length < 1 || subject.length > 100) || (message.length < 1 || message.length > 200))
        return res.status(500).send("/home");
    try
    {
        var sql = "INSERT INTO contact_us (fullname, emailaddress, subject, message) VALUES ($1, $2, $3, $4)";
        pool.query(sql, [name, email, subject, message], (err, result) => {
            if (err) 
            {
                logger.error("In Contact Message, Error. From: " + req.clientIp + ". Body: " + JSON.stringify(req.body) + ". Time: " + str);
                res.status(500).send("/");
            }else
            {
                var mailOptions = {
                    from: name + " (" + email + " )", // sender address
                    to: 'contact@smartdepositscheme.com', // list of receivers
                    subject: subject, //
                    text: message, // plain text body
                };
                  
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        logger.info(error);
                    } else {
                        logger.info('Email sent: ' + info.response);
                    }
                });
                res.status(200).send("Success");
            }
        });
    }catch(e)
    {
        logger.error("Contact Database Error Occurred: " + req.clientIp + ". Body: " + JSON.stringify(req.body) + ". Message: " + JSON.stringify(req.body) + ". Time: " + str);
        res.status(500).send("/");
    }
});

module.exports = router;