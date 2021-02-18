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
                            'name', q.name,  
                            'email', q.email, 'role', q.usertype)) json
                            FROM usermanager q WHERE role = $1`;
                        pool.query(txn, ['admin'], (err,  admin) => {    
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
                                res.status(200).render("dashboard/admin", {usertype: result.rows[0].usertype, ej: ej, ejournals: ejournal, name: result.rows[0].fullname, role: result.rows[0].role, 
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
        logger.error("Channels Admin could not be served to " + req.clientIp);
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
                        var role = req.body.role;
                        var password = encryptData(req.body.password, passworddb);
                        var ranStr = randomstring.generate({
                                      length: 32,
                                      charset: 'alphanumeric'
                                    });
                        var qry2 = "INSERT INTO usermanager (username, email, role, link, password, justset, name, usertype) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
                        pool.query(qry2, [username, email, 'admin', ranStr, password, 'true', fullname, role], (err, results) => {
                            if (err) 
                            {
                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                res.status(500).send({"status": 500, "message": "Admin Already Exist."});
                            }
                            else
                            {
                                var mailOptions = {
                                    from: '"SDS OFFICIAL" <wisdomibanga@bizzdeskgroup.com>', // sender address
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

                                logger.info("SDS Super Admin User Insert. Ip: " + req.clientIp + "  " + new Date().toLocaleString() + ". By: superadmin");
                                res.status(200).send({"status": 200, "message": "Successfully Added"});
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
                        var role = req.body.role;
                        var password = encryptData(req.body.password, passworddb);
                        
                        const query =
                            "UPDATE usermanager SET username = $1, name = $2, email = $3, password = $4, usertype = $5"
                            + " WHERE id = $6";
                        pool.query(query, [username, fullname, email, password, role, id], (err,  results) => {    
                            if (err) 
                            {
                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                res.status(500).send({"status": 500, "message": "An error occurred. Retry Later."});
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