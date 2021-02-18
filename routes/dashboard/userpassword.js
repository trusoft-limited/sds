var router = express.Router();

router.get("/", function(req, res){
    try
    {
        var qry = "SELECT * FROM tokens WHERE token = $1";
        pool.query(qry, [req.cookies.token_tcm], (err, result) => {
            if (err) 
            {
                logger.error("SDS Password Session Database Issue " + req.clientIp + ". Time" +  new Date().toLocaleString());
                res.redirect("/login");
            }else
            {
                if(result.rows.length !== 1)
                {
                    logger.error("SDS Password Session Issue " + req.clientIp);
                    res.redirect("/login");
                }else
                {
                    logger.info("SDS Password To: " + result.rows[0].fullname + ". Ip: " + req.clientIp + " Role: " + result.rows[0].role);

                    var date1 = new Date();
                    var date2 = new Date(result.rows[0].timestop);
                    var timeDiff = date1.getTime() - date2.getTime();
                    var dif = timeDiff / 1000;
                    if(dif >= 1)
                    {
                        logger.error("SDS Password Session Expire " + req.clientIp);
                        res.redirect("/login");
                    }else
                    {
                        logger.info("SDS Password Successfully saved to " + req.clientIp + "  " + new Date().toLocaleString());
                                res.status(200).render("dashboard/userpassword", {name: result.rows[0].fullname, role: result.rows[0].role, 
                            justset: result.rows[0].justset, username: result.rows[0].username, time: new Date().toLocaleString()});
                    }
                }
            }
        });
    }catch(e)
    {
        console.log(e);
        logger.error("SDS Password could not be served to " + req.clientIp);
        res.redirect("/login");
    }
});


router.post("/", function(req, res)
{
    try
    {
        var qry = "SELECT * FROM tokens WHERE token = $1";
        pool.query(qry, [req.cookies.token_tcm], (err, result) => {
            if (err) 
            {
                logger.error("SDS Password Post Session Database Issue " + req.clientIp);
                res.status(500).send({"status": 500, "message": "Try Later"});
            }else
            {
                if(result.rows.length !== 1)
                {
                    logger.error("SDS Password Post Session Issue " + req.clientIp);
                    res.status(500).send({"status": 500, "message": "Please Login Again"});
                }else
                {
                    var date1 = new Date();
                    var date2 = new Date(result.rows[0].timestop);
                    var timeDiff = date1.getTime() - date2.getTime();
                    var dif = timeDiff / 1000;
                    if(dif >= 1)
                    {
                        logger.error("SDS Password Post Session Expire " + req.clientIp);
                        res.status(500).send({"status": 500, "message": "Session Expire"});
                    }else
                    {
                        var oldpassword = req.body.oldpassword;
                        var password = encryptData(req.body.password, passworddb);
                        var username = result.rows[0].username;
                        const login =
                            `SELECT json_agg(json_build_object('password', q.password, 'role', q.role)) json
                            FROM usermanager q WHERE username = $1`;
                        pool.query(login, [result.rows[0].username], (err,  details) => {    
                            if (err) 
                            {
                                logger.info("Database connection error: " + err + ". Username: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                                res.status(500).send({"status": 500, "message": "Incorrect Login Details."});
                            }
                            else
                            {
                                if(details.rows[0].json === null)
                                {
                                    logger.info("0. Password Change Error. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                                    res.status(500).send({"status": 500, "message": "Incorrect Password."});
                                }else
                                {
                                    if(oldpassword === decryptData(details.rows[0].json[0].password, passworddb))
                                    {
                                        const query =
                                            "UPDATE usermanager SET password = $1, justset = $2"
                                            + " WHERE username = $3";
                                        pool.query(query, [password, 'false', result.rows[0].username], (err,  results) => {    
                                            if (err) 
                                            {
                                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                                res.status(500).send({"status": 500, "message": "Password not changed."});
                                            }
                                            else
                                            {
                                                logger.info("SDS Password Change Success. Ip: " + req.clientIp + "  " + new Date().toLocaleString() + ". By: " + result.rows[0].username);
                                                res.status(200).send({"status": 200, "message": "Successfully Changed"});
                                            }
                                        });
                                    }else
                                    {
                                        logger.info("Incorrect Password. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                                        res.status(500).send({"status": 500, "message": "Incorrect Login Details."});
                                    }
                                }
                            }
                        });
                    }
                }
            }
        });
    }catch(e)
    {
        logger.error("SDS Password Post could not be served to " + req.clientIp);
        res.status(500).send({"status": 500, "message": "Server Error"});
    }
});

router.all("*", function(req, res)
{
    logger.info("Wrong URL. Redirecting to sds dashboard. From: " + req.clientIp + ". Time: " + new Date().toLocaleString());
    res.redirect("/sds/dashboard");
});

module.exports.router = router;