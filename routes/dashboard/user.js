var router = express.Router();

router.get("/", function(req, res)
{
    try
    {
        var qry = "SELECT * FROM tokens WHERE token = $1 AND role = $2";
        pool.query(qry, [req.cookies.token_tcm, "superadmin"], (err, result) => {
            if (err) 
            {
                logger.error("SDS Admin Session Database Issue " + req.clientIp + ". Time" +  new Date().toLocaleString());
                res.redirect("/login");
            }else
            {
                if(result.rows.length !== 1)
                {
                    logger.error("SDS Admin Session Issue " + req.clientIp);
                    res.redirect("/login");
                }else
                {
                    logger.info("SDS Admin To: " + result.rows[0].fullname + ". Ip: " + req.clientIp + " Role: " + result.rows[0].role);

                    var date1 = new Date();
                    var date2 = new Date(result.rows[0].timestop);
                    var timeDiff = date1.getTime() - date2.getTime();
                    var dif = timeDiff / 1000;
                    if(dif >= 1)
                    {
                        logger.error("SDS Admin Session Expire " + req.clientIp);
                        res.redirect("/login");
                    }else
                    {
                        const txn =
                            `SELECT json_agg(json_build_object('id', q.id, 'username', q.username, 
                            'name', q.name,  'phone', q.phone,
                            'email', q.email, 'businessname', q.businessname, 'businessaddress', q.businessaddress,
                            'town', q.town, 'lga', q.lga, 'town', q.town, 'state', q.state)) json
                            FROM usermanager q WHERE role = $1`;
                        pool.query(txn, ['user'], (err,  admin) => {    
                            if (err) 
                            {
                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                res.redirect("/login");
                            }
                            else
                            {
                                var ejournal = JSON.stringify(admin.rows[0].json);
                                var ej = admin.rows[0].json;
                                logger.info("SDS Admin Successfully saved to " + req.clientIp + "  " + new Date().toLocaleString());
                                res.status(200).render("dashboard/users", {usertype: result.rows[0].usertype, ej: ej, ejournals: ejournal, name: result.rows[0].fullname, role: result.rows[0].role, 
                                            justset: result.rows[0].justset, username: result.rows[0].username, time: new Date().toLocaleString()});
                            }
                        });
                    }
                }
            }
        });
    }catch(e)
    {
        console.log(e);
        logger.error("SDS Admin could not be served to " + req.clientIp);
        res.redirect("/login");
    }
});


router.post("/", function(req, res)
{
    try
    {
        var qry = "SELECT * FROM tokens WHERE token = $1 AND role = $2";
        pool.query(qry, [req.cookies.token_tcm, "superadmin"], (err, result) => {
            if (err) 
            {
                logger.error("SDS Admin Post Session Database Issue " + req.clientIp);
                res.status(500).send({"status": 500, "message": "Try Later"});
            }else
            {
                if(result.rows.length !== 1)
                {
                    logger.error("SDS Admin Post Session Issue " + req.clientIp);
                    res.status(500).send({"status": 500, "message": "Please Login Again"});
                }else
                {
                    var date1 = new Date();
                    var date2 = new Date(result.rows[0].timestop);
                    var timeDiff = date1.getTime() - date2.getTime();
                    var dif = timeDiff / 1000;
                    if(dif >= 1)
                    {
                        logger.error("SDS Admin Post Session Expire " + req.clientIp);
                        res.status(500).send({"status": 500, "message": "Session Expire"});
                    }else
                    {
                        //Start here
                        var username = req.body.username;
                        var fullname = req.body.fullname;
                        var email = req.body.email;
                        var password = encryptData(req.body.password, passworddb);
                        var ranStr = randomstring.generate({
                                      length: 32,
                                      charset: 'alphanumeric'
                                    });
                        var phone = req.body.phone;
                        var businessname = req.body.businessname;
                        var businessaddress = req.body.businessaddress;
                        var town = req.body.town;
                        var lga = req.body.lga;
                        var state = req.body.state;
                        var uniqueid = cryptoRandomString({length: 10, characters: '1234567890'});
                        var qry2 = "INSERT INTO usermanager (username, email, role, link, password, justset, name, phone, businessname, businessaddress, town, lga, state, uniqueid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)";
                            pool.query(qry2, [username, email, 'user', ranStr, password, 'true', fullname, phone,
                            businessname, businessaddress, town, lga, state, uniqueid], (err, results) => {
                        //var qry2 = "INSERT INTO usermanager (username, email, role, link, password, justset, name) VALUES ($1, $2, $3, $4, $5, $6, $7)";
                        //pool.query(qry2, [username, email, 'user', ranStr, password, 'true', fullname], (err, results) => {
                            if (err) 
                            {
                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                res.status(500).send({"status": 500, "message": "User Already Exist."});
                            }
                            else
                            {
                                var qry3 = "INSERT INTO walletdetails (name, balance, username, email) VALUES ($1, $2, $3, $4)";
                                pool.query(qry3, [fullname, "0.00", username, email], (err, results) => {
                                    if (err) 
                                    {
                                        logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                        res.status(500).send({"status": 500, "message": "User Already Exist."});
                                    }
                                    else
                                    {
                                        var qry4 = "INSERT INTO breakdown (actionof, amount, total, username) VALUES ($1, $2, $3, $4)";
                                        pool.query(qry4, ["addition", "0.00", "0.00", username], (err, results) => {
                                            if (err) 
                                            {
                                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                                res.status(500).send({"status": 500, "message": "User Already Exist."});
                                            }
                                            else
                                            {
                                                var mailOptions = {
                                                    from: '"SDS OFFICIAL"', // sender address
                                                    to: email, // list of receivers
                                                    subject: "SDS SIGNUP", //
                                                    text: "Click this link: www.smartdepositscheme.com/sds/dashboard/" + ranStr + " to activate your email. \n\nWelcome to SDS.", // plain text body
                                                };
                                                  
                                                transporter.sendMail(mailOptions, function(error, info){
                                                    if (error) {
                                                        logger.info(error);
                                                    } else {
                                                        logger.info('Email sent: ' + info.response);
                                                    }
                                                });

                                                logger.info("SDS Admin User Insert. Ip: " + req.clientIp + "  " + new Date().toLocaleString() + ". By: superadmin");
                                                res.status(200).send({"status": 200, "message": "Successfully Added"});
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
    }catch(e)
    {
        logger.error("SDS Admin Post could not be served to " + req.clientIp);
        res.status(500).send({"status": 500, "message": "Server Error"});
    }
});


router.put("/", function(req, res)
{
    try
    {
        var qry = "SELECT * FROM tokens WHERE token = $1 AND role = $2";
        pool.query(qry, [req.cookies.token_tcm, "superadmin"], (err, result) => {
            if (err) 
            {
                logger.error("SDS Admin Put Session Database Issue " + req.clientIp);
                res.status(500).send({"status": 500, "message": "Try Later"});
            }else
            {
                if(result.rows.length !== 1)
                {
                    logger.error("SDS Admin Put Session Issue " + req.clientIp);
                    res.status(500).send({"status": 500, "message": "Please Login Again"});
                }else
                {
                    var date1 = new Date();
                    var date2 = new Date(result.rows[0].timestop);
                    var timeDiff = date1.getTime() - date2.getTime();
                    var dif = timeDiff / 1000;
                    if(dif >= 1)
                    {
                        logger.error("SDS Admin Put Session Expire " + req.clientIp);
                        res.status(500).send({"status": 500, "message": "Session Expire"});
                    }else
                    {
                        var id = req.body.id;
                        var username = req.body.username;
                        var fullname = req.body.fullname;
                        var email = req.body.email;
                        var password = encryptData(req.body.password, passworddb);
                        var phone = req.body.phone;
                        var businessname = req.body.businessname;
                        var businessaddress = req.body.businessaddress;
                        var town = req.body.town;
                        var lga = req.body.lga;
                        var state = req.body.state;

                        const query =
                            "UPDATE usermanager SET username = $1, name = $2, email = $3, password = $4, phone = $5, businessname = $6, businessaddress = $7, town = $8, lga = $9, state = $10"
                            + " WHERE id = $11";
                        pool.query(query, [username, fullname, email, password, phone, businessname, businessaddress, town, lga, state, id], (err,  results) => {    
                            if (err) 
                            {
                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                res.status(500).send({"status": 500, "message": "An error occurred. Retry Later."});
                            }
                            else
                            {
                                var qry3 = "UPDATE walletdetails SET name = $1, email = $2 WHERE username = $3";
                                pool.query(qry3, [fullname, email, username], (err, results) => {
                                    if (err) 
                                    {
                                        logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                        res.status(500).send({"status": 500, "message": "User Already Exist."});
                                    }
                                    else
                                    {
                                        var mailOptions = {
                                            from: '"SDS OFFICIAL" <wisdomibanga@bizzdeskgroup.com>', // sender address
                                            to: email, // list of receivers
                                            subject: "SDS UPDATE", //
                                            text: "Your login details has been updated. \nUsername: " + username + ". \nPassword: " + req.body.password
                                            + "\n\nKindly login and change your password", // plain text body
                                        }; 
                                        transporter.sendMail(mailOptions, function(error, info){
                                            if (error) {
                                                logger.info(error);
                                            } else {
                                                logger.info('Email sent: ' + info.response);
                                            }
                                        });
                                        logger.info("SDS Super Admin User Update. Ip: " + req.clientIp + "  " + new Date().toLocaleString() + ". By: superadmin");
                                        res.status(200).send({"status": 200, "message": "Successfully Updated"});
                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
    }catch(e)
    {
        logger.error("SDS Admin Put could not be served to " + req.clientIp);
        res.status(500).send({"status": 500, "message": "Server Error"});
    }
});

router.delete("/", function(req, res)
{
    try
    {
        var qry = "SELECT * FROM tokens WHERE token = $1 AND role = $2";
        pool.query(qry, [req.cookies.token_tcm, "superadmin"], (err, result) => {
            if (err) 
            {
                logger.error("SDS Admin Put Session Database Issue " + req.clientIp);
                res.status(500).send({"status": 500, "message": "Try Later"});
            }else
            {
                if(result.rows.length !== 1)
                {
                    logger.error("SDS Admin Put Session Issue " + req.clientIp);
                    res.status(500).send({"status": 500, "message": "Please Login Again"});
                }else
                {
                    var date1 = new Date();
                    var date2 = new Date(result.rows[0].timestop);
                    var timeDiff = date1.getTime() - date2.getTime();
                    var dif = timeDiff / 1000;
                    if(dif >= 1)
                    {
                        logger.error("SDS Admin Put Session Expire " + req.clientIp);
                        res.status(500).send({"status": 500, "message": "Session Expire"});
                    }else
                    {
                        //Start here
                        var id = req.body.id;
                        const query =
                            "DELETE FROM usermanager WHERE id = $1";
                        pool.query(query, [id], (err,  results) => {    
                            if (err) 
                            {
                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                res.status(500).send({"status": 500, "message": "An error occurred. Retry Later."});
                            }
                            else
                            {
                                logger.info("SDS Admin User Delete. Ip: " + req.clientIp + "  " + new Date().toLocaleString());
                                res.status(200).send({"status": 200, "message": "Successfully Deleted"});
                            }
                        });
                    }
                }
            }
        });
    }catch(e)
    {
        logger.error("SDS Admin Delete could not be served to " + req.clientIp);
        res.status(500).send({"status": 500, "message": "Server Error"});
    }
});

router.all("*", function(req, res)
{
    logger.info("Wrong URL. Redirecting to SDS dashboard. From: " + req.clientIp + ". Time: " + new Date().toLocaleString());
    res.redirect("/login");
});

module.exports.router = router;