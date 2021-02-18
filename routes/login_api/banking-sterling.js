const request = require('request-promise');
const crypto = require('crypto-js');

exports.bankCode = '000001';
const baseUri = 'https://webapps.sterlingbankng.com/SPay/api/Spay/';

function encrypt(body) {
    let iv = crypto.enc.Hex.parse("01020305070B0D11");
    let key = crypto.enc.Hex.parse("01020505070B0D1112110D0B07020408010C0305070B0D1B");

    let bits = crypto.TripleDES.encrypt(JSON.stringify(body), key, {iv: iv, mode: crypto.mode.CBC});
    return crypto.enc.Base64.stringify(bits.ciphertext);
}

async function send(uri, data) {
    const encrypted = encrypt(data);
    const req = {
        uri: 'https://trusoftng.com/proxy/index.php',
        json: true,
        method: 'POST',
        resolveWithFullResponse: true,
        body: {
            url: uri,
            method: 'POST',
            data: encrypted,
            headers: [
                'AppId: 8188'
            ]
        }
    };
    /*console.info('sending ' + JSON.stringify(data) + ' request: ' + JSON.stringify(req));
    request(req).then((res) => {
        console.info('received from ' + uri + ': ' + JSON.stringify(res));
        return res;
    }).catch((err) => {
        console.error('error calling api ' + uri + ': ' + err);
        return null;
    });*/
    const res = await request(req);
    if (res.statusCode === 200 && res.body)
        return res.body;
    return null;
}

exports.enquiry = async function enquiry(bank, nuban) {
    let uri, data;
    const id = Date.now().toString();
    if (bank === exports.bankCode) {
        uri = baseUri + 'SBPNameEnquiry';
        data = {
            Referenceid: id,
            RequestType: 219,
            Translocation: '100,100',
            NUBAN: nuban
        };
    } else {
        uri = baseUri + 'InterbankNameEnquiry';
        data = {
            Referenceid: id,
            RequestType: 161,
            Translocation: '100,100',
            ToAccount: nuban,
            DestinationBankCode: bank
        };
    }
    const result = await send(uri, data);
    console.log(JSON.stringify(result));
    if (result.response === '00' && result.data.status === '00')
        return result.data;
    return null;
}

exports.transfer = async function transfer(account, bank, ne, amount, ref, remark) {
    let uri, data;
    const id = Date.now().toString();
    if (bank === exports.bankCode) {
        uri = baseUri + 'SBPT24txnRequest';
        data = {
            Referenceid: id,
            RequestType: 110,
            Translocation: '100,100',
            amt: amount,
            tellerid: '11111',
            frmacct: account,
            toacct: ne.AccountNumber,
            paymentRef: ref,
            remarks: remark
        };
    } else {
        uri = baseUri + 'InterbankTransferReq';
        data = {
            Referenceid: id,
            RequestType: 160,
            Translocation: '100,100',
            Amount: amount,
            FromAccount: account,
            ToAccount: ne.AccountNumber,
            DestinationBankCode: bank,
            SessionID: ne.sessionID,
            PaymentReference: ref,
            NEResponse: ne.status,
            BenefiName: ne.AccountName
        };
    }
    const result = await send(uri, data);
    if(!result)
        return {error: 'Sterling Bank Communication Error'}
    else if (result.response === '00' && result.data.status === 'Success')
        return result.data;
    return {failure: result.message};
    //TODO: Decode Sterling Responses to Failure or Pending
}

exports.status = async function status(id) {
    const uri = baseUri + 'Requery';
    const data = {
        RequestType: 150,
        TrnxReference: id,
        AppId: 8188,
        Referenceid: Date.now().toString()
    };
    const result = await send(uri, data);
    if (result.response === '00')
        return result.data;
    return null;
}

exports.statement = async function statement(account) {
    const uri = baseUri + 'GetStatement';
    const end = new Date();
    start.setDate(end.getDate() - 1);
    const data = {
        RequestType: 153,
        Referenceid: Date.now().toString(),
        Translocation: '100,100',
        NUBAN: account,
        NoOfRecords: 1000,
        StartDate: formatDate(start),
        EndDate: formatDate(end)
    };
    const result = await send(uri, data);
    if (result.response === '00' && result.data.status === 'Success')
        return result.data.Statements;
    return {error: result.data.message};
}

function formatDate(date) {
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const str = date.getDate() + '-' + months[date.getMonth()] + '-'
    date.getFullYear().toString().substring(2, 2);
    return str;
}