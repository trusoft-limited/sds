var router = express.Router();

router.get("/", function(req, res)
{
    try
    {
        var qry = "SELECT * FROM tokens WHERE token = $1 AND (role = $2 or role = $3)";
        pool.query(qry, [req.cookies.token_tcm, "admin", "superadmin"], (err, result) => {
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
                        var qry2 = "SELECT * FROM voucher order by storeusedtime desc";
                        pool.query(qry2, (err, admin) => {
                            if (err) 
                            {
                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                res.redirect("/login");
                            }else
                            {
                                var ejournal = JSON.stringify(admin.rows);
                                var ej = admin.rows;
                                logger.info("SDS Admin Successfully saved to " + req.clientIp + "  " + new Date().toLocaleString());
                                res.status(200).render("dashboard/ui", {usertype: result.rows[0].usertype, ej: ej, 
                                            ejournals: ejournal, name: result.rows[0].fullname, role: result.rows[0].role, 
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
                        var act = req.body.act;
                        const query =
                            "UPDATE voucher SET dispute = $1 WHERE id = $2";
                        pool.query(query, [act, id], (err,  results) => {    
                            if (err) 
                            {
                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                res.status(500).send({"status": 500, "message": "An error occurred. Retry Later."});
                            }
                            else
                            {
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

router.put("/checker", function(req, res)
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
                        var act = req.body.act;
                        var maker = req.body.maker;
                        if(act === "revoke")
                        {
                            const query =
                                "UPDATE voucher SET dispute = $1 WHERE id = $2";
                            pool.query(query, ["", id], (err,  results) => {    
                                if (err) 
                                {
                                    logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                    res.status(500).send({"status": 500, "message": "An error occurred. Retry Later."});
                                }
                                else
                                {
                                    logger.info("SDS Super Admin User Update. Ip: " + req.clientIp + "  " + new Date().toLocaleString() + ". By: superadmin");
                                    res.status(200).send({"status": 200, "message": "Successfully Updated"});
                                }
                            });
                        }else
                        {
                            if(maker === "voidpin")
                            {
                                const query =
                                    "UPDATE voucher SET dispute = $1, void = $2, used = $3, status = $4 WHERE id = $5";
                                pool.query(query, ["", "true", true, "VOID BY SUPER ADMIN", id], (err,  results) => {    
                                    if (err) 
                                    {
                                        logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                        res.status(500).send({"status": 500, "message": "An error occurred. Retry Later."});
                                    }
                                    else
                                    {
                                        logger.info("SDS Super Admin User Update. Ip: " + req.clientIp + "  " + new Date().toLocaleString() + ". By: superadmin");
                                        res.status(200).send({"status": 200, "message": "Successfully Updated"});
                                    }
                                });
                            }else
                            {
                                const query =
                                    "UPDATE voucher SET dispute = $1, void = $2, used = $3, status = $4 WHERE id = $5";
                                pool.query(query, ["", "false", false, "", id], (err,  results) => {    
                                    if (err) 
                                    {
                                        logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                        res.status(500).send({"status": 500, "message": "An error occurred. Retry Later."});
                                    }
                                    else
                                    {
                                        logger.info("SDS Super Admin User Update. Ip: " + req.clientIp + "  " + new Date().toLocaleString() + ". By: superadmin");
                                        res.status(200).send({"status": 200, "message": "Successfully Updated"});
                                    }
                                });
                            }
                        }
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

router.all("*", function(req, res)
{
    logger.info("Wrong URL. Redirecting to SDS dashboard. From: " + req.clientIp + ". Time: " + new Date().toLocaleString());
    res.redirect("/login");
});

module.exports.router = router;