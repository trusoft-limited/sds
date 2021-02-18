var router = express.Router();

router.post("/", function(req, res)
{
    var str = new Date().toLocaleString();
    var username = req.body.username;
    var password = req.body.password;
    if((username.length < 1 || username.length > 100) || (password.length < 1 || password.length > 100)
        )
    {
        logger.info("SDS ISSUE: " + req.body + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());    
        return res.status(500).send({"status": 500, "message": "Parameters not probably formed."});
    }
    try
    {
        logger.info("SDS Login By: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
        
        const login =
            `SELECT json_agg(json_build_object('name', q.name, 'role', q.role, 
            'email', q.email, 'password', q.password, 
            'link', q.link, 'usertype', q.usertype,
            'justset', q.justset)) json
            FROM usermanager q WHERE username = $1`;
        pool.query(login, [username], (err,  details) => {    
            if (err) 
            {
                logger.info("Database connection error: " + err + ". Username: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                res.status(500).send({"status": 500, "message": "Incorrect Login Details."});
            }
            else
            {
                if(details.rows[0].json === null)
                {
                    logger.info("1. Incorrect Login Details. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                    res.status(500).send({"status": 500, "message": "Incorrect Login Details."});
                }else
                {
                    if(password === decryptData(details.rows[0].json[0].password, passworddb))
                    {
                        var dt = new Date();
                        var startDate = dt.toLocaleString();
                        var endDate = new Date(dt.getTime() + 15*60000).toLocaleString();
                        var parse = username + ":" + Math.floor((Math.random() * 100000000) + 1) + ":" + dt.toLocaleString();
                        var token = encryptData(parse, passwordtoken);
                        var qry2 = "INSERT INTO tokens (username, token, timestart, timestop, fullname, role, justset, link, usertype) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
                        pool.query(qry2, [username, token, startDate, endDate, details.rows[0].json[0].name,
                            details.rows[0].json[0].role, details.rows[0].json[0].justset, details.rows[0].json[0].link, details.rows[0].json[0].usertype], (err, result) => {
                            if (err) {
                                logger.info(err);
                                logger.info("User Signin Token Issue. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                                res.status(500).send({"status": 500, "message": "Cannot login. Contact Admin"});
                            }else{
                                let options = {
                                    maxAge: 1000 * 60 * 15, // would expire after 120 minutes
                                    //httpOnly: true, // The cookie only accessible by the web server
                                    //signed: true // Indicates if the cookie should be signed
                                }
                                res.clearCookie('token_tcm');
                                res.cookie('token_tcm', token, options);
                                logger.info("SDS Login Token By: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString() + ". Session Id: " + token);
                                res.status(200).send({"status": 200, "message": "Successful Login", "token": token});
                            }
                        });
                    }else
                    {
                        logger.info("34. Incorrect Login Details. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                        res.status(500).send({"status": 500, "message": "Incorrect Login Details."});
                    }
                }
            }
        });
    }catch(e)
    {
        res.status(500).send({"status": 500, "message": "Server Error. Retry Later"});
    }
});


module.exports = router;