const router = express.Router();
const request = require('request').defaults({ rejectUnauthorized: false })
const itex = require('./banking-itex');
const timeout = require('connect-timeout');
const { response } = require('express');
const logger = require('winston-color');

function dateuse() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    var today = yyyy + '-' + mm + '-' + dd;
    return today;
}

function parseInput(data) {
    var ret = [];
    var str = "";
    for (var i = 0; i < data.length; i++) {
        if (data.charAt(i) === '*') {
            ret.push(str);
            str = "";
        } else {
            str += data.charAt(i);
        }
    }
    ret.push(str);
    return ret;
}

const success1 = 'Transaction successful.';
const success2 = 'Transaction is pending. Please wait for 10 minutes.'
const error1 = 'This line is barred from using this service. Please contact SDS customer care.';
const error2 = 'Invalid PIN. This line will be barred after 3 attempts. Please contact the SDS customer care.';
const error3 = 'Voucher already used by you.';
const error4 = 'Voucher already used by a different number. Please contact the SDS customer care.';
const error5 = 'Your transaction is pending. Please wait for 10 minutes, check the destination bank account for the money, if not received, please try again.';
const error6 = 'Invalid name/bank account/bank code. Please follow the instructions printed on the voucher and input the proper information.';
const error7 = 'Please hold on. The system is experiencing delays from the bank.';
const error8 = 'The transaction failed. Please try again later.';
const error9 = 'Transaction is pending. Please try again.';
const error10 = 'Invalid PIN. Please check voucher and input proper PIN.';
const error11 = 'Invalid bank account. Please check and input the proper bank account number.';
const error12 = 'Invalid bank code. Please check the voucher for the proper bank code and try again.';
const error13 = 'System error, please try again later.';

var bankCodes = {
    "232": "000001", // sterling
    "082": "000002", // keystone
    "214": "000003", // fcmb
    "033": "000004", // uba
    "301": "000006", // jaiz
    "070": "000007", // fidelity
    "076": "000008", // polaris
    "023": "000009", // citi
    "050": "000010", // eco
    "215": "000011", // unity
    "221": "000012", // stanbic
    "058": "000013", // gtb
    "044": "000014", // access
    "057": "000015", // zenith
    "011": "000016", // fbn
    "035": "000017", // wema
    "032": "000018", // union
    "030": "000020", // heritage
    "068": "000021", // standard chartered
    "100": "000022", // suntrust
    "101": "000023", // providus
    //"102": "000025", // titan trust
    "103": "000027", // globus
    //"302": "", // taj
    "501": "400001", // fsdh
    "559": "060001", // coronation
    "560": "060002", // fbnquest
    //"561": "", // nova
};
const blocked = 'valid/blocked';
const used = 'valid/used-approved';
const pending = 'valid/used-pending';
const failed = 'valid/used-declined';
const liquidated = 'invalid/liquidated';

function incrementBlacklist(phone, who) {
    pool.query("INSERT INTO blacklist (number, by) VALUES ($1, $2)", [phone, who]);
}
async function useVoucher(phone, pin, account, bank, sessionId) {
    const date = new Date();
    try {
        // const start = Date.now();
        // setTimeout(() => {
        //     const end = Date.now();
        //     logger.info(`voucher timeout: pin=${pin} in ${(end - start) / 1000} seconds`);
        //     return `END ${error7}`;
        // }, 17 * 1000);
        // logger.info(`Attempting to consume voucher: pin=${pin},account=${account},bank=${bank} at ${date}`);
        // validate inputs
        if (pin === null || pin === undefined || pin.length !== 9)
            return `END ${error10}`;
        if (account === null || account === undefined || account.length !== 10)
            return `END ${error11}`;
        if (bank === null || bank === undefined || bank.length !== 3 || !bankCodes.hasOwnProperty(bank))
            return `END ${error12}`;
        // check if phone is blacklisted
        let qry = "SELECT * FROM blacklist WHERE number = $1";
        let result = await pool.query(qry, [phone]);
        if (result.rows.length > 3)
            return `END ${error1}`;
        // check pin exists
        qry = "SELECT * FROM voucher WHERE pin = $1";
        result = await pool.query(qry, [pin]);
        if (result.rows.length === 0) { // pin not found
            incrementBlacklist(phone, "AUTO");
            return `END ${error2}`;
        }
        // hurrah! pin exists
        const voucher = result.rows[0];
        // check voucher status
        if (voucher.status === blocked || voucher.status === liquidated) {
            incrementBlacklist(phone, "AUTO");
            return `END ${error2}`;
        }
        else if (voucher.status === used) { // already successfully used
            // check if same user
            if (voucher.phonenumber === phone) // same user, forgive
                return `END ${error3}`
            else {
                incrementBlacklist(phone, "AUTO");
                return `END ${error4}`;
            }
        }
        else if (voucher.status === pending) { // pending, do requery
            //TODO: Query Status and update voucher
            return `END ${error5}`;
        }
        // voucher is unused or declined
        bank = bankCodes[bank];
        // do name enquiry
        const ne = await itex.enquiry(bank, account, voucher.amount);
        if (ne === null || ne.name.length < 3)
            return `END ${error6}`;
        // set voucher to pending
        qry = "update voucher set used = $1, phonenumber = $2, datetimeused = $3, status = $4, accountnumber = $5, beneficiary = $6, ussdSessionId = $8 where pin = $7";
        await pool.query(qry, [true, phone, getDateTime(date), pending, account, ne.name, pin, sessionId]);
        // request transfer
        const trf = await itex.transfer(ne, pin, 'SDS-' + pin);//BapD/CLO/May
        qry = "update voucher set status = $1, storeusedtime = $2, transferRef = $4 where pin = $3";
        if (trf.error) { // network error, query status
            //TODO: Query Status
            await pool.query(qry, [pending + ':' + trf.error, getDateTime(), pin, null]);
            logger.error(trf.error);
            return 'END ' + error9;
        } else if (trf.failure) { // transfer maybe failed
            await pool.query(qry, [failed + ':' + trf.failure, getDateTime(), pin, null]);
            return 'END ' + error8;
        } // success
        await pool.query(qry, [used, getDateTime(), pin, trf.reference + '|' + trf.SessionID]);
        // const end = Date.now();
        // logger.info(`Finished consume voucher: pin=${pin} in ${(end - start)/1000} seconds at ${new Date().toLocaleString()}`);
        return `END ${success1} ${ne.name}`;
    } catch (err) {
        logger.error(JSON.stringify(err, ["message", "arguments", "type", "name", "stack"]));
        return `END ` + error13;
    }
}

function timedOut(req, res, next) {
    if (req.timedout) {
        const end = Date.now();
        logger.info(`voucher timeout: pin=${pin} in ${(end - start) / 1000} seconds`);
        res.status(200);
        res.set("Content-Type: text/plain");
        res.send(`END ${error7}`);
    } else next();
}

router.post("/", timeout('14s', { respond: false }), timedOut, async function (req, res) {
    let { sessionId, serviceCode, phoneNumber, text } = req.body;
    logger.info(`voucher start: ${phoneNumber} as ${text} at ${Date().toLocaleString()}`);
    const start = Date.now();
    const arr = parseInput(text);
    const response = await useVoucher(phoneNumber, arr[0], arr[1], arr[2], sessionId);
    res.set("Content-Type: text/plain");
    res.send(response);
    logger.info(`voucher end: ${phoneNumber} with ${response} in ${(Date.now() - start) / 1000} secs at ${Date().toLocaleString()}`);
});

router.get('/heartbeat', async function (req, res) {
    const start = Date.now();
    bank = '058';
    account = '0010673154';
    bank = bankCodes[bank];
    const ne = await itex.enquiry(bank, account, '1000');
    let status = 'successful';
    const duration = (Date.now() - start) / 1000;
    if (ne === null || ne.name.length < 3)
        status = 'failed';
    const log = `heartbeat: ${status} in ${duration} secs at ${Date().toLocaleString()}`;
    logger.info(log);
    res.set("Content-Type: text/plain");
    res.send("i'm alive");
    res.end();
    if (status === 'failed' || duration > 90) {
        const mailOptions = {
            from: '"SDS Support" <sds@trusoftng.com>', // sender address
            to: 'fintech-support@trusoftng.com', // list of receivers
            subject: "SDS Heartbeat Alert", //
            text: "A possible system issue detected. \n" + log, // plain text body
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                logger.info(error);
            } else {
                logger.info('Email sent: ' + info.response);
            }
        });
    }
});

module.exports = router;
