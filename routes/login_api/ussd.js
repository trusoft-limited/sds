var router = express.Router();
var request = require('request').defaults({ rejectUnauthorized: false })
var crypto = require('crypto-js');

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


bankCode = '000001';
baseUri = 'https://webapps.sterlingbankng.com/SPay/api/Spay/';

function formatDate(date) {
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const str = date.getDate() + '-' + months[date.getMonth()] + '-'
    date.getFullYear().toString().substring(2, 2);
    return str;
}

function encrypt(body) 
{
	let iv = crypto.enc.Hex.parse("01020305070B0D11");
	let key = crypto.enc.Hex.parse("01020505070B0D1112110D0B07020408010C0305070B0D1B");

	let bits = crypto.TripleDES.encrypt(JSON.stringify(body), key, {iv: iv, mode: crypto.mode.CBC});
	return crypto.enc.Base64.stringify(bits.ciphertext);
}

function nameenquiry(bank, nuban) {
    let uri, data;
    const id = Date.now().toString();
    if (bank === bankCode) {
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
	
	const encrypted = encrypt(data);
	const req = {
		uri: 'https://trusoftng.com/proxy/index.php',
		json: true,
		method: 'POST',
		//resolveWithFullResponse: true,
		body: {
			url: uri,
			method: 'POST',
			data: encrypted,
			headers: [
				'AppId: 8188'
			]
		}
	};
	
	request(req, function (error, response) {
		if(error)
		{
			logger.info("ERROR: " + error);
			return null;
		}
		if(response)
		{
			logger.info("RESPONSE");
			logger.info(response);
			logger.info(new Date().toLocaleString());
			logger.info(response.body);
			if(result === undefined || result === null)
				return null;
			if (response.statusCode === 200 && response.body)
				return res.body.data;
		}
	});
}

function transfer(account, bank, ne, amount, ref, remark) {
    let uri, data;
    const id = Date.now().toString();
    if (bank === bankCode) {
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
	logger.info("TRANSFER PAYLOAD");
	logger.info(uri);
	logger.info(data);
	
	const encrypted = encrypt(data);
	const req = {
		uri: 'https://trusoftng.com/proxy/index.php',
		json: true,
		method: 'POST',
		//resolveWithFullResponse: true,
		body: {
			url: uri,
			method: 'POST',
			data: encrypted,
			headers: [
				'AppId: 8188'
			]
		}
	};

	request(req, function (error, response) {
		if(error)
		{
			logger.info("ERROR: " + error);
			return null;
		}
		if(response)
		{
			logger.info("RESPONSE");
			logger.info(response);
			logger.info(new Date().toLocaleString());
			logger.info(response.body);
			if(result === undefined || result === null)
				return null;
			if (response.statusCode === 200 && response.body)
				return res.body.data;
		}
	});
}

function status(id) {
    const uri = baseUri + 'Requery';
    const data = {
        RequestType: 150,
        TrnxReference: id,
        AppId: 8188,
        Referenceid: Date.now().toString()
    };
	
	const encrypted = encrypt(data);
	const req = {
		uri: 'https://trusoftng.com/proxy/index.php',
		json: true,
		method: 'POST',
		//resolveWithFullResponse: true,
		body: {
			url: uri,
			method: 'POST',
			data: encrypted,
			headers: [
				'AppId: 8188'
			]
		}
	};
	
	request(req, function (error, response) {
		if(error)
		{
			logger.info("ERROR: " + error);
			return null;
		}
		if(response)
		{
			logger.info("RESPONSE");
			logger.info(response);
			logger.info(new Date().toLocaleString());
			logger.info(response.body);
			if(result === undefined || result === null)
				return null;
			if (response.statusCode === 200 && response.body)
				return res.body.data;
		}
	});
}

function statement(account) {
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
	
	const encrypted = encrypt(data);
	const req = {
		uri: 'https://trusoftng.com/proxy/index.php',
		json: true,
		method: 'POST',
		//resolveWithFullResponse: true,
		body: {
			url: uri,
			method: 'POST',
			data: encrypted,
			headers: [
				'AppId: 8188'
			]
		}
	};
	
	request(req, function (error, response) {
		if(error)
		{
			logger.info("ERROR: " + error);
			return null;
		}
		if(response)
		{
			logger.info("RESPONSE");
			logger.info(response);
			logger.info(new Date().toLocaleString());
			logger.info(response.body);
			if(result === undefined || result === null)
				return null;
			if (response.statusCode === 200 && response.body)
				return res.body.Statements;
		}
	});
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
const error8 = 'This voucher has been declined. Please contact the SDS customer care.';
const error9 = 'Transaction is pending. Please try again.';
const error10 = 'Invalid PIN. Please check voucher and input proper PIN.';
const error11 = 'Invalid bank account. Please check and input the proper bank account number.';
const error12 = 'Invalid bank code. Please check the voucher for the proper bank code and try again.';
const error13 = 'System error, please try again later.';

var bankCodes = '{"232": "000001","082": "000002","214": "000003","033": "000004","301": "000006","070": "000007","076": "000008","023": "000009","050": "000010","215": "000011","221": "000012","058": "000013","044": "000014","057": "000015","011": "000016","035": "000017","032": "000018","030": "000020","068": "000021","100": "000022","101": "000023","102": "000025","526": "090004"}';
const blocked = 'valid/blocked';
const usedOK = 'valid/SUCCESSFUL';
const usedENQUIRYFAILED = 'valid/NAMEENQUIRY FAILED';
const usedTRANSFERFAILED = 'valid/TRANSFER FAILED';
const usedSame = 'valid/used-same';
const usedOther = 'valid/used-other';
const liquidated = 'invalid/liquidated';
const notFound = 'invalid/not-found';
const notAllowed = 'blacklisted';

//[pin*actnum*bankcode]
router.post("/", function (req, res) {
	var str = new Date().toLocaleString();
	try {
		// Read variables sent via POST from our SDK
		logger.info("REQUEST CAME IN AT: " + new Date().toLocaleString());
		let { sessionId, serviceCode, phoneNumber, text } = req.body;
		logger.info('#####'+ JSON.stringify(req.body));
		let response = "";
		var arr = parseInput(text);
		logger.info(arr);
		var pin = arr[0];
		var actnum = arr[1];
		var bankcode = arr[2];

		// Check pin, account number and bankcode and confirm if valid
		logger.info(str+"PIN: " + pin);
		logger.info(str+"ACCOUNT NUMBER: " + actnum);
		logger.info(str+"BANKCODE: " + bankcode);

		if (pin === null || pin === undefined) {
			response = `END ` + error10;
			res.set("Content-Type: text/plain");
			res.send(response);
			return;
		}else if (actnum === null || actnum === undefined ) {
			response = `END ` + error11;
			res.set("Content-Type: text/plain");
			res.send(response);
			return;
		}else if (bankcode === null || bankcode === undefined) {
			response = `END ` + error12;
			res.set("Content-Type: text/plain");
			res.send(response);
			return;
		}else
		{
			if (pin.length != 9) {
				response = `END ` + error10;
				res.set("Content-Type: text/plain");
				res.send(response);
				return;
			}else if (actnum.length != 10) {
				response = `END ` + error11;
				res.set("Content-Type: text/plain");
				res.send(response);
				return;
			}else if (bankcode.length != 3) {
				response = `END ` + error12;
				res.set("Content-Type: text/plain");
				res.send(response);
				return;
			}else
			{
				logger.info("CHECK BANKCODES");
				var codes = JSON.parse(bankCodes);
				logger.info("NOTHING IS HERE");
				var d = bankcode;
				bankcode = codes[d];
				logger.info(bankcode);

				logger.info("CONFIRM THAT BANK CODE IS OKAY");

				logger.info("BANK CODE: " + bankcode);

				var qry = "SELECT * FROM voucher WHERE pin = $1";
				pool.query(qry, [pin], (err, resu) => {
					if (err) {
						response = `END ` + error13;
						res.set("Content-Type: text/plain");
						res.send(response);
						return;
					}else
					{
						length = resu.rows.length;
						if(length === 0)
						{
							var qry = "SELECT * FROM blacklist WHERE number = $1";
							pool.query(qry, [phoneNumber], (err, result) => {
								if (err) {
									response = `END ` + error2;
									res.set("Content-Type: text/plain");
									res.send(response);
									return;
								} else {
									if (result.rows.length > 3) 
									{
										logger.info("PHONE IS BLACKLISTED FROM USING THIS SERVICE: " + phoneNumber);
										response = `END ` + error1;
										res.set("Content-Type: text/plain");
										res.send(response);
										return;
									}else
									{
										var qry2 = "INSERT INTO blacklist (number, by) VALUES ($1, $2)";
										pool.query(qry2, [phoneNumber, "AUTOMATIC"], (err, results) => {
											if (err) {
												response = `END ` + error2;
												res.set("Content-Type: text/plain");
												res.send(response);
												return;
											}else
											{
												response = `END ` + error2;
												res.set("Content-Type: text/plain");
												res.send(response);
												return;
											}
										});
									}
								}
							});
						}else
						{
							var qry = "SELECT * FROM blacklist WHERE number = $1";
							pool.query(qry, [phoneNumber], (err, result) => {
								if (err) {
									response = `END ` + error4;
									res.set("Content-Type: text/plain");
									res.send(response);
									return;
								} else {
									if (result.rows.length > 3) 
									{
										logger.info("PHONE IS BLACKLISTED FROM USING THIS SERVICE: " + phoneNumber);
										response = `END ` + error1;
										res.set("Content-Type: text/plain");
										res.send(response);
										return;
									}else
									{
										if (resu.rows[0].used === true) {
											logger.info("VOUCHER IS ALREADY USED");
											if(resu.rows[0].phonenumber === phoneNumber)
											{
												logger.info("VOUCHER IS ALREADY USED BY SAME USER");
												response = `END ` + error3;
												res.set("Content-Type: text/plain");
												res.send(response);
												return;
											}else
											{
												var dt = dateuse();
												var qry2 = "INSERT INTO blacklist (number, by) VALUES ($1, $2)";
												pool.query(qry2, [phoneNumber, "AUTOMATIC"], (err, results) => {
													if (err) {
														response = `END ` + error1;
														res.set("Content-Type: text/plain");
														res.send(response);
														return;
													}else
													{
														response = `END ` + error1;
														res.set("Content-Type: text/plain");
														res.send(response);
														return;
													}
												});
											}
										} else {
											logger.info("VOUCHER IS FRESH");
											var query = "UPDATE voucher SET used = $1, phonenumber = $2, storeusedtime = $3 WHERE pin = $4";
											pool.query(query, [true, phoneNumber, getDateTime(), pin], (err, results) => {
												var amt = resu.rows[0].amount;
												logger.info("Total Amount: " + amt);
												logger.info("ABOUT CALLING NAME ENQUIRY");
												logger.info("GOING FOR NAME ENQUIRY AT: " + new Date().toLocaleString());
												logger.info("BANK CODE: " + bankcode);
												logger.info("ACCOUNT NUMBER: " + actnum);
												
												let uri, data;
												var bank = bankcode;
												var nuban = actnum;
												const id = Date.now().toString();
												if (bank === bankCode) {
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
												
												request(req, function (error, response) {
													if(error)
													{
														logger.info("ERROR: " + error);
														return null;
													}
													if(response)
													{
														logger.info("RESPONSE");
														logger.info(response);
														logger.info(new Date().toLocaleString());
														logger.info(response.body);
														if(response === undefined || response === null)
														{
															logger.info("CATCH CLAUSE 1x");
															var query = "UPDATE voucher SET status = $1, storeusedtime = $2 WHERE pin = $3";
															pool.query(query, [usedTRANSFERFAILED, getDateTime(), pin], (err, results) => {
																logger.info(err);
																response = `END ` + error6;
																res.set("Content-Type: text/plain");
																res.send(response);
																return;
															});
														}else if (response.statusCode === 200 && response.body)
														{
															var enquiry = response.body.data;
															logger.info("MAIN CLAUSE 1x");
															logger.info("RESPONSE CAME BACK FOR NAME ENQUIRY AT: " + new Date().toLocaleString());
															logger.info("DONE WITH NAME ENQUIRY");
															logger.info(enquiry);
															if(enquiry.AccountName.length < 3){
																response = "END "+error6;
																res.set("Content-Type: text/plain");
																res.send(response);
																return;
															}
															var remark = "TRANSFER";
															var ref = randomstring.generate({
																length: 20,
																charset: 'numeric'
															});
															logger.info("ABOUT CALLING TRANSFER");
															logger.info("GOING FOR TRANSFER AT: " + new Date().toLocaleString());
															logger.info(actnum);
															logger.info(bankcode);
															logger.info(enquiry);
															logger.info(amt);
															logger.info(ref);
															logger.info(remark);
															
															response = "END " + success1 + " NGN " + amt + " has been sent to "
																+ enquiry.AccountName + " (" + actnum + "). " + " Thank you. SDS";
															res.set("Content-Type: text/plain");
															logger.info(response);
															logger.info("RESPONSE TO OPERATOR AT: " + new Date().toLocaleString());
															res.send(response);
					
															var account = "0075674549";
															var bank = bankcode;
															var ne = enquiry;
															var amount = amt;
															
															let uri, data;
															const id = Date.now().toString();
															if (bank === bankCode) {
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
															logger.info("TRANSFER PAYLOAD");
															logger.info(uri);
															logger.info(data);
															
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
					
															request(req, function (error, response) {
																if(error)
																{
																	logger.info("ERROR: " + error);
																	return;
																}
																if(response)
																{
																	logger.info("RESPONSE");
																	logger.info(response);
																	logger.info(new Date().toLocaleString());
																	logger.info(response.body);
																	if(response === undefined || response === null)
																	{
																		logger.info("CATCH CLAUSE 3x");
																		var query = "UPDATE voucher SET status = $1, accountnumber = $2, storeusedtime = $3 WHERE pin = $4";
																		pool.query(query, [usedTRANSFERFAILED, actnum, getDateTime(), pin], (err, results) => {
																			logger.info(err);
																			/*response = `END ` + error6;
																			res.set("Content-Type: text/plain");
																			res.send(response);*/
																			return;
																		});
																	}
																	if (response.statusCode === 200 && response.body)
																	{
																		var debit = response.body.data;
																		logger.info("RESPONSE CAME BACK FOR TRANSFER AT: " + new Date().toLocaleString());
																		logger.info("DONE WITH TRANSFER");
																		var query = "UPDATE voucher SET status = $1, accountnumber = $2, storeusedtime = $3 WHERE pin = $4";
																		pool.query(query, [usedOK, actnum, getDateTime(), pin], (err, results) => {
																			logger.info("UPDATED HERE")
																			logger.info(debit);
																			/*response = "END " + success1 + " NGN " + amt + " has been sent to "
																				+ enquiry.AccountName + " (" + actnum + "). " + " Thank you. SDS";
																			res.set("Content-Type: text/plain");
																			logger.info(response);
																			logger.info("RESPONSE TO OPERATOR AT: " + new Date().toLocaleString());
																			res.send(response);*/
																			return;
																		});
																	}
																}
															});
														}else
														{
															logger.info("CATCH CLAUSE 1x");
															var query = "UPDATE voucher SET status = $1, accountnumber = $2, storeusedtime = $3 WHERE pin = $4";
															pool.query(query, [usedTRANSFERFAILED, actnum, getDateTime(), pin], (err, results) => {
																logger.info(err);
																response = `END ` + error6;
																res.set("Content-Type: text/plain");
																res.send(response);
																return;
															});
														}
													}
												});
											});
										}
									}
								}
							});
						}
					}
				});
			}
		}
	} catch (e) {
		logger.error(e.toString());
		res.set("Content-Type: text/plain");
		res.send(`END An Error Occurred`+e.toString());
		return;
	}
});

module.exports = router;
