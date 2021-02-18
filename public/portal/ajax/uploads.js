$("#editnew").hide();

$("#logout_cool").click(function (event) {
    event.preventDefault();
    swal({
        title: "Logout",
        text: "Are you sure you want to logout?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#800080',
        cancelButtonColor: '#001e33',
        confirmButtonText: 'Yes, Logout!'
    }).then(function (result) {
        if (result.value) {
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

        }
    });
});

var update = 0;
var sendId = 0;
function newHost()
{
    update = 1;
    $("#display").hide();
    $("#editnew").show();
    
    $("#tellernumber").val("");
    $("#amount").val("");
    $("#description").val("");
    $("#bankname").val("");
    $("#uniqueid").val("");
    $("#lastfour").val("");
    $("#date").val("");
}

function backHost()
{
    update = 0;
    $("#display").show();
    $("#editnew").hide();

    $("#tellernumber").val("");
    $("#amount").val("");
    $("#description").val("");
    $("#bankname").val("");
    $("#uniqueid").val("");
    $("#lastfour").val("");
    $("#date").val("");
}

var tellernumber = "";
var amount = "";
var description = "";
var bankname = "";
var uniqueid = "";
var lastfour = "";
var date = "";
var touser = "";

function editOnclick(id)
{
    var x = document.getElementById("ejour").innerText;
    var jsonData = JSON.parse(x);
    var cat = 0;
    for(var i = 0; i < jsonData.length; i++) {
        var obj = jsonData[i];
        if(id == obj.id)
        {
            cat = i;
            break;
        }
    }
    sendId = jsonData[cat].id;
    tellernumber = jsonData[cat].tellernumber;
    amount = jsonData[cat].amount;
    description = jsonData[cat].description;
    bankname = jsonData[cat].bankname;
    uniqueid = jsonData[cat].uniqueid;
    lastfour = jsonData[cat].lastfour;
    date = jsonData[cat].date;

    var x = document.getElementById("use").innerText;
    var jsonD = JSON.parse(x);
    var use = "<p align=\"left\">";
    use += "Teller Number: <span style=\"float:right;\">" + tellernumber + "</span></br>";
    use += "Amount: NGN <span style=\"float:right;\">" + amount + "</span></br>";
    use += "Description: <span style=\"float:right;\">" + description + "</span></br>";
    use += "Bank Name: <span style=\"float:right;\">" + bankname + "</span></br>";
    use += "Unique Id: <span style=\"float:right;\">" + uniqueid + "</span></br>";
    use += "Bank Account: <span style=\"float:right;\">" + lastfour + "</span></br>";
    use += "Date: <span style=\"float:right;\">" + date + "</span></br>";
    use += "</p>";
    use += "<div class=\"form-group\">";
    use += "<label for=\"cc-ssl\" class=\"control-label mb-1\">All Users</label>";
    use += "<select style=\"color: #001e33; font-weight: bold;\" name=\"cc-ssl\" id=\"listusers\" class=\"form-control\">";
    console.log(jsonD);
    for(var i = 0; i < jsonD.length; i++) {
        console.log(jsonD[i].username)
        use += "<option style=\"color: #001e33; font-weight: bold;\" value=\"" + jsonD[i].username + "\">" + jsonD[i].name + " (" + jsonD[i].username + ")" + "</option>";
    }
    use += "</select></div>";

    var myhtml = document.createElement("div");
    myhtml.innerHTML = use;
    swal({
        title: "Details", 
        html: myhtml,
        type: 'success',
        showCancelButton: true,
        confirmButtonColor: '#800080',
        cancelButtonColor: '#001e33',
        confirmButtonText: 'Credit Selected',
        allowOutsideClick: "true" 
    }).then(function (result) {
        if (result.value) 
        {
            var bilname = $("#listusers").val();
            touser = bilname;
            sendEdit();
        }else
        {
            /*var bilname = $("#listusers").val();
            touser = bilname;
            sendEdit();*/
        }
    });
    /*swal({
        title: "Details",
        content: myhtml,
        icon: "success",
        buttons: {
        label: "Credit Selected",
        remove: "Close"
        }
    }).then((value) => {
        switch (value) {
            case "label":
                var bilname = $("#listusers").val();
                touser = bilname;
                sendEdit();
                break;
            case "remove":
            default:
                break;
        }
    });*/

}

$(document).ready(function() {
    var x = document.getElementById("ejust").innerText;
    if(x === 'true')
    {
        swal(
            'Info!',
            'Please change your password.',
            'info'
        );
    }
});

function sendEdit()
{
    var addedby = $('#uuname').html();

    var fd = new FormData();
    fd.append('id', sendId);
    fd.append('tellernumber', tellernumber);
    fd.append('amount', amount);
    fd.append('description', description);
    fd.append('bankname', bankname);
    fd.append('uniqueid', uniqueid);
    fd.append('lastfour', lastfour);
    fd.append('date', date);
    fd.append('touser', touser);

    $.ajax({
        type: "PUT",
        url : "/sds/upload/records",
        data : fd,
        processData: false,
        contentType: false,
        
        success : function(json) {
            var j = json;
            //console.log(j);
            swal(
                'Updated!',
                'Update Successful.',
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
            console.log(xhr);
            var json = JSON.parse(xhr.responseText);
            swal(
                'Error!',
                json.message,
                'error'
            );
            $("#payment-button").show();
        }
    });
}

function sendNew()
{
    var addedby = $('#uuname').html();
    var fd = new FormData();
    fd.append('tellernumber', $("#tellernumber").val());
    fd.append('amount', $("#amount").val());
    fd.append('description', $("#description").val());
    fd.append('bankname', $("#bankname").val());
    fd.append('uniqueid', $("#uniqueid").val());
    fd.append('lastfour', $("#lastfour").val());
    fd.append('date', $("#date").val());
    fd.append('addedby', 'admin');

    $.ajax({
        type: "POST",
        url : "/sds/upload/records",
        data : fd,
        processData: false,
        contentType: false,
        
        success : function(json) {
            var j = json;
            swal(
                'Added!',
                'Payment was added successfully.',
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
            //console.log(xhr);
            var json = JSON.parse(xhr.responseText);
            swal(
                'Error!',
                json.message,
                'error'
            );
            $("#payment-button").show();
        }
    });
}

$("#fdet" ).submit(function( event ) {
    event.preventDefault();
    $("#payment-button").hide();
    sendNew();
});