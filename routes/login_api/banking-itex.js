const request = require('request-promise');
const crypto = require('crypto-js');

exports.bankCode = '090211';

let auth = null;
let authExp = 0;
let pin = null;

async function send(uri, data, headers) {
    if (headers == null)
        headers = [];
    const json = JSON.stringify(data);
    headers.push('Content-Type: application/json');
    // headers.push('Host: 197.253.19.76:8019');
    // headers.push('Accept-Encoding: gzip,deflate');
    // headers.push('Content-Length: ' + json.length);
    const req = {
        uri: 'https://trusoftng.com/proxy/index.php',
        json: true,
        method: 'POST',
        resolveWithFullResponse: true,
        body: {
            url: uri,
            method: 'POST',
            data: json,
            headers: headers
        }
    };
    const res = await request(req);
    if (res.statusCode === 200 && res.body)
        return res.body;
    return null;
}

async function authenticate(){
    const credentials = {
        "wallet": "33049641",
        "username": "finance@smartdepositscheme.com",
        "password": "SDSitexWED2021",
        "identifier": "itexb2b"//"anyscope"
    };
    const resp = await send("http://197.253.19.76:8019/api/vas/authenticate/me", credentials);
    if(!resp.responseCode || resp.responseCode !== "00")
        throw new Error("Itex Authentication Failure: "+JSON.stringify(resp));
    auth = resp.data.apiToken;
    let d = new Date();
    authExp = d.setMinutes( d.getMinutes() + 115 );
}

async function signSend(uri, data){
    //check if token still valid
    if(auth == null || authExp < Date.now())
        await authenticate();
    const apiKey = "b93cef086a4943431342c7fd53b7502d";//"39da73677f663233bfa9d43276e74170";
    const hash = crypto.HmacSHA256(JSON.stringify(data,null,4), apiKey);
    return send(uri, data, ['Token: '+auth, 'signature: '+hash]);
}

exports.enquiry = async function enquiry(bank, nuban, amount) {
    const uri = 'http://197.253.19.76:8019/api/v1/vas/vicebanking/transfer/validation';
    const body = {
        'service': 'transfer',
        'amount': amount,
        'channel': 'B2B',
        'accountNo': nuban,
        'bankCode': bank
    };
    const resp = await signSend(uri, body);
    return resp.data;
}

exports.transfer = async function transfer(ne, ref, remark) {
    if (pin == null) {
        const uri = "http://197.253.19.76:8019/api/vas/credentials/encrypt-pin";
        const body = {
            "wallet": "33049641",
            "username": "finance@smartdepositscheme.com",
            "password": "SDSitexWED2021",
            "pin": "1234"
        };
        const resp = await send(uri, body);
        if (resp.responseCode === '00')
            pin = resp.data.pin;
        else {
            return {failure: resp.message};
        }
    }
    const uri = 'http://197.253.19.76:8019/api/v1/vas/vicebanking/transfer/payment';
    const body = {
        'service': 'transfer',
        'paymentMethod': 'cash',
        'customerPhoneNumber': '0801563',
        'productCode': ne.productCode,
        'card': {},
        'pin': pin,
        'narration': remark,
        'clientReference': ref
    };
    const resp = signSend(uri, body);
    if (resp.responseCode === '00')
        return resp.data;
    else {
        return {failure: resp.message};
    }
}

exports.status = async function status(id) {

}

exports.statement = async function statement(account) {

}

