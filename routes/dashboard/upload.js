var router = express.Router();

router.get("/", function(req, res)
{
    try
    {
        var qry = "SELECT * FROM tokens WHERE token = $1 AND role = $2";
        pool.query(qry, [req.cookies.token_tcm, "admin"], (err, result) => {
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
                            `SELECT json_agg(json_build_object('id', q.id, 'tellernumber', q.tellernumber, 
                            'amount', q.amount, 'description', q.description, 'banknamefrom', q.banknamefrom,
                            'uniqueid', q.uniqueid, 'lastfour', q.lastfour, 'date', q.date, 'username', q.username)) json
                            FROM uploadpayment q WHERE claimed = 'false' AND addedby = 'admin'`;
                        pool.query(txn, (err,  admin) => {    
                            if (err) 
                            {
                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                res.redirect("/login");
                            }
                            else
                            {
                                const txn2 =
                                    `SELECT json_agg(json_build_object('id', q.id, 'name', q.name, 
                                    'balance', q.balance, 'username', q.username, 'email', q.email)) json
                                    FROM walletdetails q`;
                                pool.query(txn2, (err,  dets) => {    
                                    if (err) 
                                    {
                                        logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                        res.redirect("/login");
                                    }
                                    else
                                    {
                                        var qry8 = "SELECT * FROM usermanager WHERE username = $1";
                                        pool.query(qry8, [result.rows[0].username], (err, restu) => {
                                            if (err) 
                                            {
                                                logger.error("SDS Admin Session Database Issue " + req.clientIp + ". Time" +  new Date().toLocaleString());
                                                res.redirect("/login");
                                            }else
                                            {
                                                var ejournal = JSON.stringify(admin.rows[0].json);
                                                var ej = admin.rows[0].json;
                                                var users = JSON.stringify(dets.rows[0].json);
                                                logger.info("SDS Admin Successfully saved to " + req.clientIp + "  " + new Date().toLocaleString());
                                                res.status(200).render("dashboard/upload", {userole: restu.rows[0].usertype, users: users, ej: ej, ejournals: ejournal, name: result.rows[0].fullname, role: result.rows[0].role, 
                                                            justset: result.rows[0].justset, username: result.rows[0].username, time: new Date().toLocaleString()});
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
        pool.query(qry, [req.cookies.token_tcm, "admin"], (err, result) => {
            if (err) {
                logger.error("SDS Admin Post Session Database Issue " + req.clientIp);
                res.status(500).send({"status": 500, "message": "Try Later"});
            }else{
                if(result.rows.length !== 1){
                    logger.error("SDS Admin Post Session Issue " + req.clientIp);
                    res.status(500).send({"status": 500, "message": "Please Login Again"});
                }else{
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
                        var tellernumber = req.body.tellernumber;
                        var amount = req.body.amount;
                        var description = req.body.description;
                        var bankname = req.body.bankname;
                        var uniqueid = req.body.uniqueid;
                        var lastfour = req.body.lastfour;
                        var dat = req.body.date;//yyyy-mm-dd - dd-mm-yyyy
                        var date = dat.slice(6) + "-" + dat.slice(3, 5) + "-" + dat.slice(0, 2);
                        var addedby = req.body.addedby;

                        console.log(req.body);
                        const txn =
                            `SELECT json_agg(json_build_object('id', q.id, 'tellernumber', q.tellernumber, 
                            'amount', q.amount, 'description', q.description, 'banknamefrom', q.banknamefrom,
                            'uniqueid', q.uniqueid, 'lastfour', q.lastfour, 'date', q.date, 'username', q.username)) json
                            FROM uploadpayment q WHERE claimed = 'false' AND addedby = 'user'`;
                        pool.query(txn, (err,  pay) => {    
                            if (err) 
                            {
                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                res.redirect("/login");
                            }
                            else
                            {
                                console.log(pay.rows);
                                if(pay.rows[0].json === null)
                                {
                                    var qry2 = "INSERT INTO uploadpayment (tellernumber, amount, description, banknamefrom, uniqueid, lastfour, date, claimed, addedby, username) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)";
                                    pool.query(qry2, [tellernumber, amount, description, bankname, uniqueid, lastfour, date, 'false', addedby, result.rows[0].username], (err, results) => {
                                        if (err) 
                                        {
                                            logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                            return res.status(500).send({"status": 500, "message": "Error Uploading."});
                                        }
                                        else
                                        {
                                            logger.info("SDS Admin User Insert. Ip: " + req.clientIp + "  " + new Date().toLocaleString() + ". By: admin");
                                            return res.status(200).send({"status": 200, "message": "Successfully Added"});
                                        }
                                    });
                                }else
                                {
                                    var bk = -1;
                                    for(var i = 0; i < pay.rows[0].json.length; i++)
                                    {
                                        if(pay.rows[0].json[i].uniqueid === uniqueid && pay.rows[0].json[i].tellernumber === tellernumber)
                                        {
                                            bk = i;
                                            break;
                                        }else if(pay.rows[0].json[i].tellernumber === tellernumber && pay.rows[0].json[i].uniqueid === uniqueid && pay.rows[0].json[i].amount === amount)
                                        {
                                            bk = i;
                                            break;
                                        }
                                    }
                                    console.log(bk);
                                    if(bk === -1)
                                    {
                                        var qry2 = "INSERT INTO uploadpayment (tellernumber, amount, description, banknamefrom, uniqueid, lastfour, date, claimed, addedby, username) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)";
                                        pool.query(qry2, [tellernumber, amount, description, bankname, uniqueid, lastfour, date, 'false', addedby, result.rows[0].username], (err, results) => {
                                            if (err) 
                                            {
                                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                                res.status(500).send({"status": 500, "message": "Error Uploading."});
                                            }
                                            else
                                            {
                                                logger.info("SDS Admin User Insert. Ip: " + req.clientIp + "  " + new Date().toLocaleString() + ". By: admin");
                                                res.status(200).send({"status": 200, "message": "Successfully Added"});
                                            }
                                        });
                                    }else
                                    {
                                        const query =
                                            "UPDATE uploadpayment SET claimed = $1"
                                            + " WHERE id = $2";
                                        pool.query(query, ['true', pay.rows[0].json[bk].id], (err,  results) => {    
                                            if (err) 
                                            {
                                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                                res.status(500).send({"status": 500, "message": "An error occurred. Retry Later."});
                                            }
                                            else
                                            {
                                                const txn2 =
                                                    `SELECT json_agg(json_build_object('balance', q.balance)) json
                                                    FROM walletdetails q WHERE username = $1`;
                                                pool.query(txn2, [pay.rows[0].json[bk].username], (err,  wals) => {    
                                                    if (err) 
                                                    {
                                                        logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                                        res.redirect("/login");
                                                    }
                                                    else
                                                    {
                                                        console.log(pay.rows[0].json[bk].username);
                                                        console.log(wals.rows[0]);
                                                        var tot = 0.00;
                                                        if(wals.rows[0].json[0] === null)
                                                            tot = parseFloat(req.body.amount);
                                                        else
                                                            tot = parseFloat(wals.rows[0].json[0].balance) + parseFloat(req.body.amount);

                                                        var qry4 = "INSERT INTO breakdown (actionof, amount, total, username) VALUES ($1, $2, $3, $4)";
                                                        pool.query(qry4, ["addition", req.body.amount, tot, pay.rows[0].json[bk].username], (err, results) => {
                                                        if (err) 
                                                            {
                                                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                                                res.status(500).send({"status": 500, "message": "Error Occured."});
                                                            }
                                                            else
                                                            {
                                                                const query =
                                                                    "UPDATE walletdetails SET balance = $1"
                                                                    + " WHERE username = $2";
                                                                pool.query(query, [tot.toString(), pay.rows[0].json[bk].username], (err,  results) => {    
                                                                    if (err) 
                                                                    {
                                                                        logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                                                        res.status(500).send({"status": 500, "message": "User Does Not Exist."});
                                                                    }
                                                                    else
                                                                    {
                                                                        logger.info("SDS Admin User Insert. Ip: " + req.clientIp + "  " + new Date().toLocaleString() + ". By: admin");
                                                                        res.status(200).send({"status": 200, "message": "Successfully Added"});
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
        pool.query(qry, [req.cookies.token_tcm, "admin"], (err, result) => {
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
                        var tellernumber = req.body.tellernumber;
                        var amount = req.body.amount;
                        var description = req.body.description;
                        var bankname = req.body.bankname;
                        var uniqueid = req.body.uniqueid;
                        var lastfour = req.body.lastfour;
                        var date = req.body.date;
                        var addedby = req.body.addedby;
                        var touser = req.body.touser;
                        
                        const query =
                            "UPDATE uploadpayment SET claimed = $1"
                            + " WHERE id = $2";
                        pool.query(query, ['true', id], (err,  results) => {    
                            if (err) 
                            {
                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                res.status(500).send({"status": 500, "message": "An error occurred. Retry Later."});
                            }
                            else
                            {
                                const txn2 =
                                    `SELECT json_agg(json_build_object('balance', q.balance)) json
                                    FROM walletdetails q WHERE username = $1`;
                                pool.query(txn2, [touser], (err,  wals) => {    
                                    if (err) 
                                    {
                                        logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                        res.redirect("/login");
                                    }
                                    else
                                    {
                                        var tot = parseFloat(wals.rows[0].json[0].balance) + parseFloat(req.body.amount);
                                        var qry2 = "INSERT INTO breakdown (actionof, amount, total, username) VALUES ($1, $2, $3, $4)";
                                        pool.query(qry2, ["addition", req.body.amount, tot.toString(), touser], (err, results) => {
                                            if (err) 
                                            {
                                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                                return res.status(500).send({"status": 500, "message": "Error Occured."});
                                            }
                                            else
                                            {
                                                const query =
                                                    "UPDATE walletdetails SET balance = $1"
                                                    + " WHERE username = $2";
                                                pool.query(query, [tot.toString(), touser], (err,  results) => {    
                                                    if (err) 
                                                    {
                                                        logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                                        res.status(500).send({"status": 500, "message": "User Does Not Exist."});
                                                    }
                                                    else
                                                    {
                                                        logger.info("SDS Admin User Update. Ip: " + req.clientIp + "  " + new Date().toLocaleString() + ". By: admin");
                                                        res.status(200).send({"status": 200, "message": "Successfully Added"});
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