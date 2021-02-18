const router = express.Router();
const request = require('request').defaults({ rejectUnauthorized: false })
const sterling = require('./banking-sterling');

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

var bankCodes = {"232": "000001","082": "000002","214": "000003","033": "000004","301": "000006","070": "000007","076": "000008","023": "000009","050": "000010","215": "000011","221": "000012","058": "000013","044": "000014","057": "000015","011": "000016","035": "000017","032": "000018","030": "000020","068": "000021","100": "000022","101": "000023","102": "000025","526": "090004"};
const blocked = 'valid/blocked';
const used = 'valid/used-approved';
const pending = 'valid/used-pending';
const failed = 'valid/used-declined';
const liquidated = 'invalid/liquidated';

function incrementBlacklist(phone, who){
    pool.query("INSERT INTO blacklist (number, by) VALUES ($1, $2)", [phone, who]);
}
async function useVoucher(phone, pin, account, bank){
    setTimeout(() => {return `END ${error7}`}, 17*1000);
    const date = new Date().toLocaleString();
    try {
        //logger.info(`Attempting to consume voucher: pin=${pin},account=${account},bank=${bank}`);
        // validate inputs
        if(pin === null || pin === undefined || pin.length !== 9)
            return `END ${error10}`;
        if(account === null || account === undefined || account.length !== 10)
            return `END ${error11}`;
        if(bank === null || bank === undefined || bank.length !== 3 || !bankCodes.hasOwnProperty(bank))
            return `END ${error12}`;
        // check if phone is blacklisted
        let qry = "SELECT * FROM blacklist WHERE number = $1";
        let result = await pool.query(qry, [phone]);
        if(result.rows.length > 3)
            return `END ${error1}`;
        // check pin exists
        qry = "SELECT * FROM voucher WHERE pin = $1";
        result = await pool.query(qry, [pin]);
        if(result.rows.length === 0) { // pin not found
            incrementBlacklist(phone, "AUTO");
            return `END ${error2}`;
        }
        // hurrah! pin exists
        const voucher = result.rows[0];
        // check voucher status
        if(voucher.status === blocked || voucher.status === liquidated){
            incrementBlacklist(phone, "AUTO");
            return `END ${error2}`;
        }
        else if(voucher.status === used) { // already successfully used
            // check if same user
            if(voucher.phonenumber === phone) // same user, forgive
                return `END ${error3}`
            else {
                incrementBlacklist(phone, "AUTO");
                return `END ${error4}`;
            }
        }
        else if(voucher.status === pending) { // pending, do requery
            //TODO: Query Status and update voucher
            return `END ${error5}`;
        }
        // voucher is unused or declined
        bank = bankCodes[bank];
        // do name enquiry
        const ne = await sterling.enquiry(bank, account);
        if(ne === null || ne.AccountName.length < 3)
            return `END ${error6}`;
        // set voucher to pending
        qry = "update voucher set used = $1, phonenumber = $2, storeusedtime = $3, status = $4, accountnumber = $5, name = $6 where pin = $7";
        await pool.query(qry, [true, phone, getDateTime(), pending, account, ne.AccountName, pin]);
        // request transfer
        const trf = await sterling.transfer('0075674549', bank, ne, voucher.amount, pin, 'SDS-'+pin);
        qry = "update voucher set status = $1, storeusedtime = $2 where pin = $3";
        if(trf.error) { // network error, query status
            //TODO: Query Status
            return 'END '+error9;
        } else if(trf.failure) { // transfer maybe failed
            await pool.query(qry, [failed+':'+trf.failure, getDateTime(), pin]);
            return 'END '+error8;
        } // success
        await pool.query(qry, [used, getDateTime(), pin]);
        return `END ${success1} ${ne.AccountName}`;
    } catch(err){
        logger.error(err);
        return `END `+error13;
    }
}

router.post("/", async function (req, res) {
    let { sessionId, serviceCode, phoneNumber, text } = req.body;
    log.info(getDateTime()+`request started for ${phoneNumber} as ${text}`);
    const arr = parseInput(text);
    const response = await useVoucher(phoneNumber, arr[0], arr[1], arr[2]);
    res.set("Content-Type: text/plain");
    res.send(response);
    log.info(getDateTime()+`request finished for ${phoneNumber} with ${response}`);
});

module.exports = router;
