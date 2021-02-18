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
    $("#lastfour").val("");
    $("#date").val("");
}

var dif;

function editOnclick(id)
{
    dif = id;
    swal({
        title: "Details", 
        text: "Are you sure you want to delete this item?",
        type: 'success',
        showCancelButton: true,
        confirmButtonColor: '#800080',
        cancelButtonColor: '#001e33',
        confirmButtonText: 'Delete',
        allowOutsideClick: "true" 
    }).then(function (result) {
        if (result.value) 
        {
            sendEdit();
            setTimeout(function() {
                location.reload();
            }, 2000); 
        }else
        {
            /*sendEdit();
            setTimeout(function() {
                location.reload();
            }, 2000);*/
        }
    });
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
    fd.append('id', dif);

    $.ajax({
        type: "PUT",
        url : "/sds/claim/payment",
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
    fd.append('addedby', 'user');

    $.ajax({
        type: "POST",
        url : "/sds/claim/payment",
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