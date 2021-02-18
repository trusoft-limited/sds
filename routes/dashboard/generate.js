var router = express.Router();
const path = require('path');

function formatEj(val) {
    if (val === null) {
        return val;
    }
    var finArr = [];
    var bnArr = [];
    for (var i = 0; i < val.length; i++) {
        var bn = val[i].batchnumber;
        if (bnArr.includes(bn)) {
            continue;
        } else {
            bnArr.push(bn);
            var obj = new Object();
            obj.id = val[i].id;
            obj.amount = val[i].amount;
            obj.pin = val[i].pin;
            obj.used = val[i].used;
            obj.name = val[i].name;
            obj.void = val[i].void;
            obj.file = val[i].file;
            obj.quantity = val[i].quantity;
            obj.batchnumber = val[i].batchnumber;
            finArr.push(obj);
        }
    }
    return finArr;
}

function sliceOff(amt) {
    return amt.slice(0, amt.length - 3);
}

router.get("/", function (req, res) {
    try {
        var qry = "SELECT * FROM tokens WHERE token = $1 AND role = $2";
        pool.query(qry, [req.cookies.token_tcm, "user"], (err, result) => {
            if (err) {
                logger.error("SDS User Session Database Issue " + req.clientIp);
                res.redirect("/login");
            } else {
                if (result.rows.length !== 1) {
                    logger.error("SDS User Session Issue " + req.clientIp);
                    res.redirect("/login");
                } else {
                    var date1 = new Date();
                    var date2 = new Date(result.rows[0].timestop);
                    var timeDiff = date1.getTime() - date2.getTime();
                    var dif = timeDiff / 1000;
                    if (dif >= 1) {
                        logger.error("SDS User Session Expire " + req.clientIp);
                        res.redirect("/login");
                    } else {
                        const txn =
                            `SELECT json_agg(json_build_object('id', q.id, 'amount', q.amount, 
                            'pin', q.pin, 'used', q.used, 'name', q.name, 'void', q.void, 'file',
                            q.file, 'quantity', q.quantity, 'batchnumber', q.batchnumber)) json
                            FROM voucher q WHERE username = $1`;
                        pool.query(txn, [result.rows[0].username], (err, admin) => {
                            if (err) {
                                logger.info("3. Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                res.redirect("/login");
                            } else {
                                const txn =
                                    `SELECT json_agg(json_build_object('id', q.id, 'name', q.name, 
                                    'amount', q.amount, 'print', q.code,
                                    'code', q.charge)) json
                                    FROM vouchercreate q`;
                                pool.query(txn, (err, voucher) => {
                                    if (err) {
                                        logger.info("4. Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                        res.redirect("/login");
                                    } else {
                                        var vouch = JSON.stringify(voucher.rows[0].json);
                                        var ejournal = JSON.stringify(admin.rows[0].json);
                                        var ej = formatEj(admin.rows[0].json);
                                        logger.info("SDS User Successfully saved to " + req.clientIp + "  " + new Date().toLocaleString());
                                        res.status(200).render("dashboard/generate", {
                                            vouchs: vouch, ej: ej, ejournals: ejournal, name: result.rows[0].fullname, role: result.rows[0].role,
                                            justset: result.rows[0].justset, username: result.rows[0].username, time: new Date().toLocaleString()
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
    } catch (e) {
        console.log(e);
        logger.error("SDS User could not be served to " + req.clientIp);
        res.redirect("/login");
    }
});


router.post("/", function (req, res) {
    console.log(req.body);
    try {
        var qry = "SELECT * FROM tokens WHERE token = $1 AND role = $2";
        pool.query(qry, [req.cookies.token_tcm, "user"], (err, result) => {
            if (err) {
                logger.error("SDS User Post Session Database Issue " + req.clientIp);
                res.status(500).send({ "status": 500, "message": "Try again later" });
            } else {
                if (result.rows.length !== 1) {
                    logger.error("SDS User Post Session Issue " + req.clientIp);
                    res.status(500).send({ "status": 500, "message": "Please Login Again" });
                } else {
                    var date1 = new Date();
                    var date2 = new Date(result.rows[0].timestop);
                    var timeDiff = date1.getTime() - date2.getTime();
                    var dif = timeDiff / 1000;
                    if (dif >= 1) {
                        logger.error("SDS User   Post Session Expire " + req.clientIp);
                        res.status(500).send({ "status": 500, "message": "Session has expired! Please login again" });
                    } else {
                        var vouch = JSON.parse(req.body.voucher);
                        if (vouch.length < 1) {
                            logger.info("SDS User Empty Voucher Insert. Ip: " + req.clientIp + "  " + new Date().toLocaleString() + ". By: user");
                            res.status(500).send({ "status": 500, "message": "Empty Voucher" });
                        } else {
                            var total = 0;
                            var arr = [];
                            for (var i = 0; i < vouch.length; i++) {
                                var qty = parseInt(vouch[i].quantity);
                                for (var k = 0; k < qty; k++) {
                                    var obj = new Object();
                                    obj.username = result.rows[0].username;
                                    obj.amount = vouch[i].amount;
                                    obj.print = vouch[i].print;
                                    obj.code = sliceOff(vouch[i].code);
                                    total += parseFloat(vouch[i].amount) + parseFloat(vouch[i].code);
                                    var ranStr = randomstring.generate({
                                        length: 9,
                                        charset: 'numeric'
                                    });
                                    obj.pin = ranStr;
                                    obj.used = false;
                                    obj.name = result.rows[0].fullname;
                                    obj.void = 'false';
                                    obj.batchnumber = vouch[i].batchnumber;
                                    var sranStr = randomstring.generate({
                                        length: 16,
                                        charset: 'numeric'
                                    });
                                    obj.serialnumber = sranStr;
                                    obj.quantity = vouch[i].quantity;
                                    arr.push(obj);
                                }
                            }
                            const txn2 = `SELECT json_agg(json_build_object('balance', q.balance)) json
                                            FROM walletdetails q WHERE username = $1`;
                            pool.query(txn2, [result.rows[0].username], (err, dets) => {
                                if (err) {
                                    logger.error("SDS User Post Session Issue " + req.clientIp);
                                    res.status(500).send({ "status": 500, "message": "Please Login Again" });
                                } else {
                                    if (dets.rows[0].json === null) {
                                        logger.error("SDS User   Post Session Issue " + req.clientIp);
                                        return res.status(500).send({ "status": 500, "message": "Please credit your account" });
                                    }

                                    var bal = parseFloat(dets.rows[0].json[0].balance);
                                    if (total > bal) {
                                        logger.error("SDS User   Post Session Issue " + req.clientIp);
                                        res.status(500).send({ "status": 500, "message": "Please Credit your account" });
                                    } else {
                                        var rans = randomstring.generate({
                                            length: 9,
                                            charset: 'numeric'
                                        });

                                        var x = 30;
                                        var y = 30;
                                        // console.log(__dirname)
                                        doc.pipe(fs.createWriteStream(__dirname + '/../../public/pins/' + rans + '.pdf'));
                                        for (var i = 0; i < arr.length; i++) {
                                            var t = parseFloat(arr[i].amount);
                                            var famt = (t).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

                                            if (i % 2 == 0) {
                                                x = 30;
                                                if (i % 10 == 0) {
                                                    y = 30;
                                                    if (i > 0)
                                                        doc.addPage();
                                                } else {
                                                    y += 150;
                                                }
                                            } else {
                                                x = 310;
                                            }
                                            doc.image(path.normalize(__dirname + '/../../public/pins/background.jpeg'), x, y, {
                                                fit: [240, 360],
                                                align: "center"
                                            })
                                                .font('Helvetica-Bold')
                                                .fontSize(18).fillColor('black').text(arr[i].pin, 84 + x, 37 + y)
                                                .fontSize(8).text(arr[i].serialnumber, 102 + x, 52 + y)
                                                .fontSize(12).fillColor('white').text(sliceOff(famt), 202 + x, 115 + y)
                                                .fontSize(5).text(sliceOff(arr[i].print), 195 + x, 129 + y);
                                        }
                                        doc.end();

                                        arrValue = [];
                                        val = 1;
                                        strg = "";
                                        main = "(username, amount, pin, used, name, void, file, batchnumber, quantity, serialnumber " +
                                            ") VALUES ";
                                        for (var i = 0; i < arr.length; i++) {
                                            strg += "(";
                                            arrValue.push(result.rows[0].username);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(arr[i].amount);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(arr[i].pin);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(arr[i].used);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(result.rows[0].fullname);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(arr[i].void);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push("/pins/" + rans + '.pdf');
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(arr[i].batchnumber);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(arr[i].quantity);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(arr[i].serialnumber);
                                            strg += "$" + val.toString();
                                            val++;
                                            if ((i + 1) === arr.length)
                                                strg += ")";
                                            else
                                                strg += "),";
                                        }
                                        pool.query("INSERT INTO voucher " + main + strg, arrValue, (err, resul) => {
                                            if (err) {
                                                logger.error("SDS User Post Session Issue " + err + req.clientIp);
                                                res.status(500).send({ "status": 500, "message": "Error Occurred" });
                                            }
                                            else {
                                                var qry3 = "UPDATE walletdetails SET balance = $1 WHERE username = $2";
                                                pool.query(qry3, [(bal - total).toString(), result.rows[0].username], (err, results) => {
                                                    if (err) {
                                                        logger.info("1. Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                                        res.status(500).send({ "status": 500, "message": "Error Occurred." });
                                                    }
                                                    else {
                                                        var qry4 = "INSERT INTO breakdown (actionof, amount, total, username) VALUES ($1, $2, $3, $4)";
                                                        pool.query(qry4, ["subtraction", total.toString(), (bal - total).toString(), result.rows[0].username], (err, results) => {
                                                            if (err) {
                                                                logger.info("2. Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                                                                res.status(500).send({ "status": 500, "message": "Error Occured." });
                                                            }
                                                            else {
                                                                logger.info("1. SDS User Voucher Insert. Ip: " + req.clientIp + "  " + new Date().toLocaleString() + ". By: user");
                                                                res.status(200).send({ "status": 200, "message": "Successful" });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }

                                }
                            });
                        }
                    }
                }
            }
        });
    } catch (e) {
        console.group("Checking Error");
        console.log(e);
        console.groupEnd();
        logger.error("SDS User   Post could not be served to " + req.clientIp);
        res.status(500).send({ "status": 500, "message": "Server Error" });
    }
});

router.all("*", function (req, res) {
    logger.info("Wrong URL. Redirecting to channels dashboard. From: " + req.clientIp + ". Time: " + new Date().toLocaleString());
    res.redirect("/login");
});

module.exports.router = router;
