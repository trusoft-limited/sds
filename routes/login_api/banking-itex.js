const request = require('request-promise');
const crypto = require('crypto-js');

exports.bankCode = '090211';

let auth = null;
let authExp = 0;
let pin = null;

const config = {
    credentials: {
        wallet: '33049641', // 62016637
        username: 'finance@smartdepositscheme.com', // payvice@smartdepositscheme.com
        password: 'SDSitexWED2021' // SDSAnyscope321
    },
    identifier: 'trusoft', // trustsoft_test
    pin: '1234', // 6789
    key: '81686ecd41bc97696c0ee5c3f9a49bb4', // es19898oi990i80k0okj00op8880923
    urls: {
        base: 'http://197.253.19.76:8019',// http://197.253.19.76:1880,
        auth: '/api/vas/authenticate/me',
        enq: '/api/v1/vas/vicebanking/transfer/validation',
        enc: '/api/vas/credentials/encrypt-pin',
        trf: '/api/v1/vas/vicebanking/transfer/payment'
    }
};

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

async function authenticate() {
    const resp = await send(config.urls.base + config.urls.auth,
        Object.assign({ identifier: config.identifier }, config.credentials));
    if (!resp.responseCode || resp.responseCode !== "00")
        throw new Error("Itex Authentication Failure: " + JSON.stringify(resp));
    auth = resp.data.apiToken;
    let d = new Date();
    authExp = d.setMinutes(d.getMinutes() + 115);
}

async function signSend(uri, data) {
    //check if token still valid
    if (auth == null || authExp < Date.now())
        await authenticate();
    const hash = crypto.HmacSHA256(JSON.stringify(data, null, 4), config.key);
    return send(uri, data, ['Token: ' + auth, 'signature: ' + hash]);
}

exports.enquiry = async function enquiry(bank, nuban, amount) {
    const uri = config.urls.base + config.urls.enq;
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
        const uri = config.urls.base + config.urls.enc;
        const body = Object.assign({ pin: config.pin }, config.credentials);
        const resp = await send(uri, body);
        if (resp.responseCode === '00')
            pin = resp.data.pin;
        else {
            return { failure: resp.message };
        }
    }
    const uri = config.urls.base + config.urls.trf;
    const body = {
        'service': 'transfer',
        'paymentMethod': 'cash',
        'customerPhoneNumber': '0801563',
        'productCode': ne.productCode,
        'pin': pin,
        'narration': remark,
        'clientReference': ref
    };
    const resp = await signSend(uri, body);
    if (resp.responseCode === '00')
        return resp.data;
    else {
        console.log(body);
        return { failure: resp.message };
    }
}

exports.status = async function status(id) {

}

exports.statement = async function statement(account) {

}

