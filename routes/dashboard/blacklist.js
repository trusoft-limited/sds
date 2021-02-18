var router = express.Router();

router.get("/", function(req, res)
{
    try
    {
        var qry = "SELECT * FROM tokens WHERE token = $1 AND role = $2";
        pool.query(qry, [req.cookies.token_tcm, "superadmin"], (err, result) => {
            if (err) 
            {
                logger.error("SDS Blacklist Session Database Issue " + req.clientIp + ". Time" +  new Date().toLocaleString());
                res.redirect("/login");
            }else
            {
                if(result.rows.length !== 1)
                {
                    logger.error("SDS Blacklist Session Issue " + req.clientIp);
                    res.redirect("/login");
                }else
                {
                    logger.info("SDS Blacklist To: " + result.rows[0].fullname + ". Ip: " + req.clientIp + " Role: " + result.rows[0].role);

                    var date1 = new Date();
                    var date2 = new Date(result.rows[0].timestop);
                    var timeDiff = date1.getTime() - date2.getTime();
                    var dif = timeDiff / 1000;
                    if(dif >= 1)
                    {
                        logger.error("SDS Blacklist Session Expire " + req.clientIp);
                        res.redirect("/login");
                    }else
                    {
                        const txn =
                            `SELECT json_agg(json_build_object('id', q.id, 'number', q.number, 
                            'by', q.by)) json
                            FROM blacklist q`;
                        pool.query(txn, (err,  admin) => {    
                            if (err) 
                            {
                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                res.redirect("/login");
                            }
                            else
                            {
                                var ejournal = JSON.stringify(admin.rows[0].json);
                                var ej = admin.rows[0].json;
                                logger.info("SDS Blacklist Successfully saved to " + req.clientIp + "  " + new Date().toLocaleString());
                                res.status(200).render("dashboard/blacklist", {usertype: result.rows[0].usertype, ej: ej, ejournals: ejournal, name: result.rows[0].fullname, role: result.rows[0].role, 
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
        logger.error("SDS Blacklist could not be served to " + req.clientIp);
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
                logger.error("SDS Blacklist Post Session Database Issue " + req.clientIp);
                res.status(500).send({"status": 500, "message": "Try Later"});
            }else
            {
                if(result.rows.length !== 1)
                {
                    logger.error("SDS Blacklist Post Session Issue " + req.clientIp);
                    res.status(500).send({"status": 500, "message": "Please Login Again"});
                }else
                {
                    var date1 = new Date();
                    var date2 = new Date(result.rows[0].timestop);
                    var timeDiff = date1.getTime() - date2.getTime();
                    var dif = timeDiff / 1000;
                    if(dif >= 1)
                    {
                        logger.error("SDS Blacklist Post Session Expire " + req.clientIp);
                        res.status(500).send({"status": 500, "message": "Session Expire"});
                    }else
                    {
                        var number = req.body.number;
                        var by = req.body.by;
                        var qry2 = "INSERT INTO blacklist (number, by) VALUES ($1, $2)";
                        pool.query(qry2, [number, by], (err, results) => {
                            if (err) 
                            {
                                logger.info("1x. Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                return res.status(500).send({"status": 500, "message": "Error Blacklisting."});
                            }
                            else
                            {
                                var qry2 = "INSERT INTO blacklist (number, by) VALUES ($1, $2)";
                                pool.query(qry2, [number, by], (err, results) => {
                                    if (err) 
                                    {
                                        logger.info("2x. Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                        return res.status(500).send({"status": 500, "message": "Error Blacklisting."});
                                    }
                                    else
                                    {
                                        var qry2 = "INSERT INTO blacklist (number, by) VALUES ($1, $2)";
                                        pool.query(qry2, [number, by], (err, results) => {
                                            if (err) 
                                            {
                                                logger.info("3x. Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                                return res.status(500).send({"status": 500, "message": "Error Blacklisting."});
                                            }
                                            else
                                            {
                                                var qry2 = "INSERT INTO blacklist (number, by) VALUES ($1, $2)";
                                                pool.query(qry2, [number, by], (err, results) => {
                                                    if (err) 
                                                    {
                                                        logger.info("4x. Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                                        return res.status(500).send({"status": 500, "message": "Error Blacklisting."});
                                                    }
                                                    else
                                                    {
                                                        logger.info("SDS User  User Insert. Ip: " + req.clientIp + "  " + new Date().toLocaleString() + ". By: admin");
                                                        return res.status(200).send({"status": 200, "message": "Blacklisted Successfully"});
                                                    }
                                                });
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
        logger.error("SDS Blacklist Post could not be served to " + req.clientIp);
        res.status(500).send({"status": 500, "message": "Server Error"});
    }
});

router.delete("/:num", function(req, res)
{
    try
    {
        var qry = "SELECT * FROM tokens WHERE token = $1 AND role = $2";
        pool.query(qry, [req.cookies.token_tcm, "superadmin"], (err, result) => {
            if (err) 
            {
                logger.error("SDS Blacklist Put Session Database Issue " + req.clientIp);
                res.status(500).send({"status": 500, "message": "Try Later"});
            }else
            {
                if(result.rows.length !== 1)
                {
                    logger.error("SDS Blacklist Put Session Issue " + req.clientIp);
                    res.status(500).send({"status": 500, "message": "Please Login Again"});
                }else
                {
                    var date1 = new Date();
                    var date2 = new Date(result.rows[0].timestop);
                    var timeDiff = date1.getTime() - date2.getTime();
                    var dif = timeDiff / 1000;
                    if(dif >= 1)
                    {
                        logger.error("SDS Blacklist Put Session Expire " + req.clientIp);
                        res.status(500).send({"status": 500, "message": "Session Expire"});
                    }else
                    {
                        //Start here
                        //var id = req.body.id;
                        var num = req.params.num;
                        const query =
                            "DELETE FROM blacklist WHERE number = $1";
                        pool.query(query, [num], (err,  results) => {    
                            if (err) 
                            {
                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                res.status(500).send({"status": 500, "message": "An error occurred. Retry Later."});
                            }
                            else
                            {
                                logger.info("SDS Blacklist User Delete. Ip: " + req.clientIp + "  " + new Date().toLocaleString());
                                res.status(200).send({"status": 200, "message": "Successfully Deleted"});
                            }
                        });
                    }
                }
            }
        });
    }catch(e)
    {
        logger.error("SDS Blacklist Delete could not be served to " + req.clientIp);
        res.status(500).send({"status": 500, "message": "Server Error"});
    }
});

router.all("*", function(req, res)
{
    logger.info("Wrong URL. Redirecting to sds dashboard. From: " + req.clientIp + ". Time: " + new Date().toLocaleString());
    res.redirect("/sds/dashboard");
});

module.exports.router = router;