var router = express.Router();

function formatDate(date) 
{
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 101).toString().substring(1);
    var day = (date.getDate() + 100).toString().substring(1);
    return year + "-" + month + "-" + day;
}

router.get("/dashboard", function(req, res)
{
    try
    {
        var currentTime = new Date();
        // var year = currentTime.getFullYear();
        var qry = "SELECT * FROM tokens WHERE token = $1";
        pool.query(qry, [req.cookies.token_tcm], (err, result) => {
            if (err) 
            {
                logger.error("1. SDS Dashboard Session Database Issue " + err + ". Ip: " + req.clientIp);
                res.redirect("/login");
            }else
            {
                if(result.rows.length === 0)
                {
                    logger.error("2. SDS Dashboard Session Database Issue " + req.clientIp);
                    res.redirect("/login");
                    return;
                }
                logger.info("3. SDS Dashboard To: " + result.rows[0].fullname + ". Ip: " + req.clientIp + " Role: " + result.rows[0].role);
                if(result.rows.length !== 1)
                {
                    logger.error("4. SDS Dashboard Session Issue " + req.clientIp);
                    res.redirect("/login");
                }else
                {
                    var date1 = new Date();
                    var date2 = new Date(result.rows[0].timestop);
                    var timeDiff = date1.getTime() - date2.getTime();
                    var dif = timeDiff / 1000;
                    if(dif >= 1)
                    {
                        logger.error("5. SDS Dashboard Session Expire " + req.clientIp);
                        res.redirect("/login");
                    }else
                    {
                        if(result.rows[0].role === 'user')
                        {
                            var qry = "SELECT * FROM voucher WHERE username = $1";
                            pool.query(qry, [result.rows[0].username], (err, resu) => {
                                if (err) 
                                {
                                    logger.error("6. SDS Voucher Database Issue " + err + ". Ip: " + req.clientIp);
                                    res.redirect("/login");
                                }else
                                {
                                    length = resu.rows.length;
                                    used = 0;
                                    unused = 0;
                                    vod = 0;
                                    for(var i = 0; i < length; i++)
                                    {
                                        if(resu.rows[i].used === true)
                                            used = used + 1;
                                        else
                                            unused = unused + 1;

                                        if(resu.rows[i].void === 'true')
                                            vod = vod + 1;
                                    }
                                    const txn2 =
                                        `SELECT json_agg(json_build_object('id', q.id, 'name', q.name, 
                                        'balance', q.balance, 'username', q.username, 'email', q.email)) json
                                        FROM walletdetails q WHERE username = $1`;
                                    pool.query(txn2, [result.rows[0].username], (err,  dets) => {    
                                        if (err) 
                                        {
                                            logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                            res.redirect("/login");
                                        }
                                        else
                                        {
                                            var famt;
                                            if(dets.rows[0].json === null)
                                            {
                                                var t = parseFloat("0.00");
                                                var famt = 'NGN ' + (t).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
                                            }else
                                            {
                                                var t = parseFloat(dets.rows[0].json[0].balance);
                                                var famt = 'NGN ' + (t).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
                                            }
                                            logger.info("SDS Dashboard Successfully saved to " + req.clientIp + "  " + new Date().toLocaleString() + ". Name: " + result.rows[0].fullname + ". Role: " + result.rows[0].role);
                                            res.status(200).render("dashboard/dashboard", {amount: famt, leng: length, used: used,
                                            unused: unused, vod: vod, name: result.rows[0].fullname, role: result.rows[0].role, 
                                            justset: result.rows[0].justset, username: result.rows[0].username, time: new Date().toLocaleString()});
                                        }
                                    });
                                }
                            });
                        }else{
                            logger.info("SDS Dashboard Successfully saved to " + req.clientIp + "  " + new Date().toLocaleString() + ". Name: " + result.rows[0].fullname + ". Role: " + result.rows[0].role);
                            res.status(200).render("dashboard/dashboard", {name: result.rows[0].fullname, role: result.rows[0].role, 
                            justset: result.rows[0].justset, username: result.rows[0].username, time: new Date().toLocaleString()});
                        }
                    }
                }
            }
        });
    }catch(e)
    {
        logger.error("SDS Dashboard could not be served to " + req.clientIp);
        res.redirect("/");
    }
});


router.get("/dashboard/:id", function(req, res)
{
    try
    {
        var rid = req.params.id;
        const query =
            "UPDATE usermanager SET justset = $1 WHERE link = $2";
        pool.query(query, ["false", rid], (err,  results) => {   
            if (err) 
            {
                logger.error("SDS Dashboard Session Database Issue " + err + ". Ip: " + req.clientIp);
                res.redirect("/login");
            }
            else
            {
                const query =
                    "UPDATE tokens SET justset = $1 WHERE link = $2";
                pool.query(query, ["false", rid], (err,  results) => {   
                    if (err) 
                    {
                        logger.error("SDS Dashboard Session Database Issue " + err + ". Ip: " + req.clientIp);
                        res.redirect("/login");
                    }
                    else
                    {
                        var currentTime = new Date();
                        var year = currentTime.getFullYear();
                        var qry = "SELECT * FROM tokens WHERE token = $1";
                        pool.query(qry, [req.cookies.token_tcm], (err, result) => {
                            if (err) 
                            {
                                logger.error("SDS Dashboard Session Database Issue " + err + ". Ip: " + req.clientIp);
                                res.redirect("/login");
                            }else
                            {
                                if(result.rows.length === 0)
                                {
                                    logger.error("SDS Dashboard Session Database Issue " + req.clientIp);
                                    res.redirect("/login");
                                    return;
                                }
                                logger.info("SDS Dashboard To: " + result.rows[0].fullname + ". Ip: " + req.clientIp + " Role: " + result.rows[0].role);
                                if(result.rows.length !== 1)
                                {
                                    logger.error("SDS Dashboard Session Issue " + req.clientIp);
                                    res.redirect("/login");
                                }else
                                {
                                    var date1 = new Date();
                                    var date2 = new Date(result.rows[0].timestop);
                                    var timeDiff = date1.getTime() - date2.getTime();
                                    var dif = timeDiff / 1000;
                                    if(dif >= 1)
                                    {
                                        logger.error("SDS Dashboard Session Expire " + req.clientIp);
                                        res.redirect("/login");
                                    }else
                                    {
                                        if(result.rows[0].role === 'user')
                                        {
                                            var qry = "SELECT * FROM voucher WHERE username = $1";
                                            pool.query(qry, [result.rows[0].username], (err, resu) => {
                                                if (err) 
                                                {
                                                    logger.error("SDS Voucher Database Issue " + err + ". Ip: " + req.clientIp);
                                                    res.redirect("/login");
                                                }else
                                                {
                                                    length = resu.rows.length;
                                                    used = 0;
                                                    unused = 0;
                                                    vod = 0;
                                                    for(var i = 0; i < length; i++)
                                                    {
                                                        if(resu.rows[i].used === true)
                                                            used = used + 1;
                                                        else
                                                            unused = unused + 1;

                                                        if(resu.rows[i].void === 'true')
                                                            vod = vod + 1;
                                                    }
                                                    const txn2 =
                                                        `SELECT json_agg(json_build_object('id', q.id, 'name', q.name, 
                                                        'balance', q.balance, 'username', q.username, 'email', q.email)) json
                                                        FROM walletdetails q WHERE username = $1`;
                                                    pool.query(txn2, [result.rows[0].username], (err,  dets) => {    
                                                        if (err) 
                                                        {
                                                            logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                                            res.redirect("/login");
                                                        }
                                                        else
                                                        {
                                                            var famt;
                                                            if(dets.rows[0].json === null)
                                                            {
                                                                var t = parseFloat("0.00");
                                                                var famt = 'NGN ' + (t).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
                                                            }else
                                                            {
                                                                var t = parseFloat(dets.rows[0].json[0].balance);
                                                                var famt = 'NGN ' + (t).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
                                                            }
                                                            logger.info("SDS Dashboard Successfully saved to " + req.clientIp + "  " + new Date().toLocaleString() + ". Name: " + result.rows[0].fullname + ". Role: " + result.rows[0].role);
                                                            res.status(200).render("dashboard/dashboard", {amount: famt, leng: length, used: used,
                                                            unused: unused, vod: vod, name: result.rows[0].fullname, role: result.rows[0].role, 
                                                            justset: result.rows[0].justset, username: result.rows[0].username, time: new Date().toLocaleString()});
                                                        }
                                                    });
                                                }
                                            });
                                        }else
                                        {
                                            logger.info("SDS Dashboard Successfully saved to " + req.clientIp + "  " + new Date().toLocaleString() + ". Name: " + result.rows[0].fullname + ". Role: " + result.rows[0].role);
                                            res.status(200).render("dashboard/dashboard", {name: result.rows[0].fullname, role: result.rows[0].role, 
                                            justset: result.rows[0].justset, username: result.rows[0].username, time: new Date().toLocaleString()});
                                        }
                                    }
                                }
                            }
                        });
                    }
                });
            }
        });
    }catch(e)
    {
        logger.error("SDS Dashboard could not be served to " + req.clientIp);
        res.redirect("/");
    }
});

router.get("/wallet/details", function(req, res)
{
    try
    {
        var currentTime = new Date();
        var year = currentTime.getFullYear();
        var qry = "SELECT * FROM tokens WHERE token = $1 AND role = $2";
        pool.query(qry, [req.cookies.token_tcm, "user"], (err, result) => {
            if (err) 
            {
                logger.error("SDS Dashboard Session Database Issue " + err + ". Ip: " + req.clientIp);
                res.redirect("/login");
            }else
            {
                if(result.rows.length === 0)
                {
                    logger.error("SDS Dashboard Session Database Issue " + req.clientIp);
                    res.redirect("/login");
                    return;
                }
                logger.info("SDS Dashboard To: " + result.rows[0].fullname + ". Ip: " + req.clientIp + " Role: " + result.rows[0].role);
                if(result.rows.length !== 1)
                {
                    logger.error("SDS Dashboard Session Issue " + req.clientIp);
                    res.redirect("/login");
                }else
                {
                    var date1 = new Date();
                    var date2 = new Date(result.rows[0].timestop);
                    var timeDiff = date1.getTime() - date2.getTime();
                    var dif = timeDiff / 1000;
                    if(dif >= 1)
                    {
                        logger.error("SDS Dashboard Session Expire " + req.clientIp);
                        res.redirect("/login");
                    }else
                    {
                        const txn2 =
                            `SELECT json_agg(json_build_object('id', q.id, 'name', q.name, 
                            'balance', q.balance, 'username', q.username, 'email', q.email)) json
                            FROM walletdetails q WHERE username = $1`;
                        pool.query(txn2, [result.rows[0].username], (err,  dets) => {    
                            if (err) 
                            {
                                logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                res.redirect("/login");
                            }
                            else
                            {
                                var famt;
                                if(dets.rows[0].json === null)
                                {
                                    var t = parseFloat("0.00");
                                    var famt = 'NGN ' + (t).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
                                }else
                                {
                                    var t = parseFloat(dets.rows[0].json[0].balance);
                                    var famt = 'NGN ' + (t).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
                                }
                                const txn =
                                    `SELECT json_agg(json_build_object('id', q.id, 'actionof', q.actionof, 
                                    'amount', q.amount,  
                                    'total', q.total, 'timestamp', q.timestamp)) json
                                    FROM breakdown q WHERE username = $1`;
                                pool.query(txn, [result.rows[0].username], (err,  admin) => {    
                                    if (err) 
                                    {
                                        logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                        res.redirect("/login");
                                    }
                                    else
                                    {
                                        var ej = admin.rows[0].json;
                                        logger.info("SDS Admin Successfully saved to " + req.clientIp + "  " + new Date().toLocaleString());
                                        res.status(200).render("dashboard/payment", {ej: ej, amount: famt,  name: result.rows[0].fullname, role: result.rows[0].role, 
                                            justset: result.rows[0].justset, username: result.rows[0].username, time: new Date().toLocaleString()});
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
        logger.error("SDS Dashboard could not be served to " + req.clientIp);
        res.redirect("/");
    }
});

//Voucher Management
router.use('/ui', require("./ui.js").router);
//Change password
router.use('/changepassword', require("./userpassword.js").router);
//Admin control
router.use('/admin', require("./admin.js").router);
//User control
router.use('/users', require("./user.js").router);
//Voucher creation
router.use('/voucher/create', require("./voucher.js").router);
//Admin Upload creation
router.use('/upload/records', require("./upload.js").router);
//User claim
router.use('/claim/payment', require("./claim.js").router);
//Generate invoice
router.use('/generate/voucher', require("./generate.js").router);
//Generate invoice
router.use('/superadmin/blacklist', require("./blacklist.js").router);


router.all("*", function(req, res)
{
    logger.info("Wrong URL. Redirecting to channels home. From: " + req.clientIp + ". Time: " + new Date().toLocaleString());
    res.redirect("/sds/dashboard");
});

module.exports = router;