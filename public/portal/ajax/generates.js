$("#editnew").hide();

function formatAmt(amt)
{
    var t = parseFloat(amt);
    var famt = (t).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    return famt;
}

var update = 0;
var sendId = 0;
var idval = 0;
var labval = 0;
function newHost()
{
    update = 1;
    $("#display").hide();
    $("#editnew1").show();
    $("#editnew2").show();
    idval = 0;
}

function backHost()
{
    $("#payment-button").hide();
    sendNew();
}

function fn60sec() {
    $("#time_update").text(new Date().toLocaleString());
}

$("#logout_cool").click(function (event) {
    event.preventDefault();
    swal({
        title: "Details", 
        text: "Are you sure you want to logout?",
        type: 'success',
        showCancelButton: true,
        confirmButtonColor: '#800080',
        cancelButtonColor: '#001e33',
        confirmButtonText: 'Yes',
        allowOutsideClick: "true", 
    }).then(function (result) {
        if (result) 
        {
            swal(
                'Done!',
                'logging out',
                'success'
            );
            setTimeout(function() {
                document.location.href="/login"
            }, 3000);
        }else
        {
            /*swal(
                'Done!',
                'logging out',
                'success'
            );
            setTimeout(function() {
                document.location.href="/login"
            }, 3000);*/
        }
    });
});

function removeLabel(id)
{
    var temp = parseInt(id) + 1;
    if(temp !== labval)
    {
        swal(
            'Info!',
            'Delete the last Voucher',
            'info'
        );
    }else
    {
        $('#ldiv' + id).remove(); 
        labval--;
    }
}

$("#newLabelClick").click(function()
{
    var use = "<div id=ldiv" + labval.toString() + ">"
    use += "<label for=\"cc-ssl\" class=\"control-label mb-1\">Input Type</label>";
    use += "<select style=\"color: #001e33; font-weight: bold;\" name=\"cc-ssl\" id=\"intype" + labval.toString() + "\" class=\"form-control\">";
    var x = document.getElementById("ejour").innerText;
    var jsonData = JSON.parse(x);
    var cat = 0;
    for(var i = 0; i < jsonData.length; i++) {
        var t = parseFloat(jsonData[i].amount);
        var famt = "NGN " + (t).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        use += "<option style=\"color: #001e33; font-weight: bold;\" value=\"" + jsonData[i].id + "\">" + famt + "</option>";
    }
    use += "</select>"
    
    use += "<label for=\"cc-ssl\" class=\"control-label mb-1\">Quantity</label>";
    use += "<input id=\"llen" + labval.toString() + "\" name=\"cc-payment\" type=\"number\" class=\"form-control\" aria-required=\"true\" aria-invalid=\"false\" value=\"1\">";
    use += "<button onclick=\"removeLabel('" + labval.toString() + "');\" type=\"button\" class=\"btn btn-outline-success\">Remove</button>";
    use += "<hr></div>";
    labval++;

    //console.log(use);

    $('#labBtn').append(use);
});

$( document ).ready(function() {
    $("#time_update").text(new Date().toLocaleString());
    setInterval(fn60sec, 1*1000);
});



$(document).ready(function() {
    var x = document.getElementById("ejour").innerText;
    var jsonData = JSON.parse(x);
});

function pad2(n) { return n < 10 ? '0' + n : n }

function getReferenceNumber()
{
    var date = new Date();
    return date.getFullYear().toString() + pad2(date.getMonth() + 1) + pad2( date.getDate()) + pad2( date.getHours() ) + pad2( date.getMinutes() ) + pad2( date.getSeconds() );
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var chlabel = [];
var labname = [];
function formLabels()
{
    var lab = [];
    labname = [];
    for(var i = 0; i < labval; i++)
    {
        var obj = new Object();
        var x = document.getElementById("ejour").innerText;
        var jsonData = JSON.parse(x);
        var cat = 0;

        //console.log("MAIN VALUE: " + $("#intype" + i.toString()).val());

        for(var k = 0; k < jsonData.length; k++) {

            //console.log("KEY: " + jsonData[k].id);
            //console.log("VALUE: " + $("#intype" + i.toString()).val());

            if(parseInt(jsonData[k].id) ===  parseInt($("#intype" + i.toString()).val()))
            {
                //console.log("INSIDE: " + jsonData[k].id);
                //obj.code = $("#intype" + i.toString()).val();

                obj.code = jsonData[k].code;
                obj.amount = jsonData[k].amount;
                obj.print = jsonData[k].print;
                obj.name = jsonData[k].name;
                obj.batchnumber = getReferenceNumber() + getRandomInt(111, 9999999);
                break;
            }
        }
        obj.quantity = $("#llen" + i.toString()).val();
        //console.log(obj);
        lab.push(obj);
    }
    chlabel = lab;
    return JSON.stringify(lab);
}

function getAmount(amount, commission, qty)
{
    var g = parseFloat(amount) + parseFloat(commission);
    var val = parseFloat(g) * parseInt(qty);
    return val;
}

function sendNew()
{
    var addedby = $('#uuname').html();
    console.log("INSIDE SENDNEW");
    var lab = formLabels();
    console.log(lab);
    labb = JSON.parse(lab);
    if(labb.length < 1)
    {
        swal(
            'Error!',
            "Empty Vouchers",
            'error'
        );
        $("#payment-button").show();
        return;
    }
    var use = "<p align=\"left\">";
    var total = 0.00;
    for(var i = 0; i < labb.length; i++)
    {
        var t = parseFloat(labb[i].amount);
        var famt = (t).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        use += "Amount: <span style=\"float:right;\"> NGN " + famt + "</span></br>";
        use += "Charge: <span style=\"float:right;\"> NGN " + labb[i].code + "</span></br>";
        use += "Commission: <span style=\"float:right;\"> NGN " + labb[i].print + "</span></br>";
        use += "Quantity: <span style=\"float:right;\">" + labb[i].quantity + "</span></br>";
        var tot = getAmount(labb[i].amount, labb[i].code, labb[i].quantity);
        total += tot;
        use += "</br>";
    }
    use += "</br>";
    var gamt = (total).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    use += "Total: <span style=\"float:right;font-weight: bold;\"> NGN " + gamt + "</span></br>";
    use += "</p>";
    
    

    var span = document.createElement("paragraph");
    span.innerHTML = use;
    swal({
        title: "VOUCHERS", 
        content: span,
        type: 'success',
        showCancelButton: true,
        confirmButtonColor: '#800080',
        cancelButtonColor: '#001e33',
        confirmButtonText: 'Confirm',
        allowOutsideClick: "true" 
    }).then(function (result) {
        if (result) 
        {
            var fd = new FormData();
            fd.append('voucher', formLabels());
            $.ajax({
                type: "POST",
                url : "/sds/generate/voucher",
                data : fd,
                processData: false,
                contentType: false,
                
                success : function(json) {
                    var j = json;
                    swal(
                        'Success!',
                        'Vouchers are generated successfully.',
                        'success'
                    );
                    setTimeout(function() {
                        location.reload();
                    }, 2000);
                },

                complete: function(){
                    $("#payment-button").show();
                },
                
                error : function(xhr,errmsg,err) {
                    var json = JSON.parse(xhr.responseText);
                    swal(
                        'Error!',
                        json.message,
                        'error'
                    );
                    $("#payment-button").show();
                }
            });
        }else
        {
            /*var fd = new FormData();
            fd.append('voucher', formLabels());
            $.ajax({
                type: "POST",
                url : "/sds/generate/voucher",
                data : fd,
                processData: false,
                contentType: false,
                
                success : function(json) {
                    var j = json;
                    swal(
                        'Success!',
                        'Vouchers are generated successfully.',
                        'success'
                    );
                    setTimeout(function() {
                        location.reload();
                    }, 2000);
                },

                complete: function(){
                    $("#payment-button").show();
                },
                
                error : function(xhr,errmsg,err) {
                    var json = JSON.parse(xhr.responseText);
                    swal(
                        'Error!',
                        json.message,
                        'error'
                    );
                    $("#payment-button").show();
                }
            });*/
        }
    });
    $("#payment-button").show();
}


$("#fdet" ).submit(function( event ) {
    event.preventDefault();
    $("#payment-button").hide();
    if(update == 1)
        sendNew();
    else
        sendEdit();
});