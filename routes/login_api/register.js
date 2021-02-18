var router = express.Router();


router.post("/", function(req, res)
{
    var str = new Date().toLocaleString();
    var name = req.body.name;
    var username = req.body.username;
    var password = encryptData(req.body.password, passworddb);
    var email = req.body.email;
    var phone = req.body.phone;

    var businessname = req.body.businessname;
    var businessaddress = req.body.businessaddress;
    var town = req.body.town;
    var lga = req.body.lga;
    var state = req.body.state;

    if((name.length < 1 || name.length > 100) || (username.length < 1 || username.length > 100)
        || (email.length < 1 || email.length > 100))
    {
        logger.info("SDS ISSUE: " + req.body + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
        return res.status(500).send({"status": 500, "message": "Parameters not properly formed."});
    }
    try
    {
        logger.info("SDS REGISTER: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
        var ranStr = randomstring.generate({
                      length: 8,
                      charset: 'alphanumeric'
                    });
        var uniqueid = cryptoRandomString({length: 10, characters: '1234567890'});
        var qry2 = "INSERT INTO usermanager (username, email, role, link, password, justset, name, phone, businessname, businessaddress, town, lga, state, uniqueid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)";
        pool.query(qry2, [username, email, 'user', ranStr, password, 'true', name, phone,
        businessname, businessaddress, town, lga, state, uniqueid], (err, result) => {
            if (err) 
            {
                logger.info("User Issue. User: " + username + ". Ip: " + req.clientIp + err + ". Time: " +  new Date().toLocaleString());
                res.status(500).send({"status": 500, "message": "Can not Create User"});
            }else
            {
                var mailOptions = {
                    from: '"SDS OFFICIAL"', // sender address
                    to: email, // list of receivers
                    subject: "SDS SIGNUP", //
                    text: "Click this link: www.smartdepositscheme.com/sds/dashboard/" + ranStr + " \nto activate your email. \n\nWelcome to SDS.", // plain text body
                };
                  
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        logger.info(error);
                    } else {
                        logger.info('Email sent: ' + info.response);
                    }
                });

                var dt = new Date();
                var startDate = dt.toLocaleString();
                var endDate = new Date(dt.getTime() + 120*60000).toLocaleString();
                var parse = username + ":" + Math.floor((Math.random() * 100000000) + 1) + ":" + dt.toLocaleString();
                var token = encryptData(parse, passwordtoken);
                 var qry2 = "INSERT INTO tokens (username, token, timestart, timestop, fullname, role, justset, link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
                    pool.query(qry2, [username, token, startDate, endDate, name,
                        'user', 'true', ranStr], (err, result) => {
                    if (err) 
                    {
                        logger.info(err);
                        logger.info("User Signup Token Issue. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                        res.status(500).send({"status": 500, "message": "Cannot login. Contact Admin"});
                    }else
                    {
                        let options = {
                            maxAge: 1000 * 60 * 120, // would expire after 120 minutes
                            //httpOnly: true, // The cookie only accessible by the web server
                            //signed: true // Indicates if the cookie should be signed
                        }
                        res.clearCookie('token_tcm');
                        res.cookie('token_tcm', token, options);
                        logger.info("SDS Login Token By: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString() + ". Session Id: " + token);

                        const query =
                            "DELETE FROM walletdetails WHERE username = $1";
                        pool.query(query, [username], (err,  results) => {    
                            if (err) 
                            {
                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                res.status(500).send({"status": 500, "message": "An error occurred. Retry Later."});
                            }
                            else
                            {
                                var qryWal = "INSERT INTO walletdetails (name, balance, username, email) VALUES ($1, $2, $3, $4)";
                                pool.query(qryWal, [name, '0.00', username, email], (err, bal) => {
                                    if (err) {
                                        logger.info(err);
                                        logger.info("User Wallet creation Issue. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                                        res.status(500).send({"status": 500, "message": "Cannot Process. Contact Admin"});
                                    }else{
                                        res.status(200).send({"status": 200, "message": "Successful Login", "token": token});
                                    }
                                });

                            }
                        });
                    }
                });
            }
        });
    }catch(e)
    {
        res.status(500).send({"status": 500, "message": "Server Error. Retry Later"});
    }
});



module.exports = router;