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
    
    $("#fullname").val("");
    $("#username").val("");
    $("#email").val("");
    $("#password").val("");
    $("#cpassword").val("");
}

function backHost()
{
    update = 0;
    $("#display").show();
    $("#editnew").hide();

    $("#fullname").val("");
    $("#username").val("");
    $("#email").val("");
    $("#password").val("");
    $("#cpassword").val("");
}

function deleteOnclick(id)
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
    swal({
        title: 'Delete',
        text: "Are you sure you want to delete " + jsonData[cat].name + "?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#800080',
        cancelButtonColor: '#001e33',
        confirmButtonText: 'Yes, Delete!'
    }).then(function (result) {
        if (result.value) {
            var fd = new FormData();
            fd.append('id', sendId);

            $.ajax({
                type: "DELETE",
                url : "/sds/admin",
                data : fd,
                processData: false,
                contentType: false,
                
                success : function(json) {
                    var j = json;
                    swal(
                        'Deleted!',
                        jsonData[cat].name + ' Deleted Successfully.',
                        'success'
                    );
                    setTimeout(function() {
                        location.reload();
                    }, 2000);
                },

                complete: function(){
                    
                },
                
                error : function(xhr,errmsg,err) {
                    console.log(xhr);
                    var json = JSON.parse(xhr.responseText);
                    swal(
                        'Error!',
                        json.message,
                        'error'
                    );
                }
            });
        }else
        {

        }
    });
}


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
    $("#display").hide();
    $("#editnew").show();
    update = 2;
    $("#fullname").val(jsonData[cat].name);
    $("#username").val(jsonData[cat].username);
    $("#email").val(jsonData[cat].email);
    $("#role").val(jsonData[cat].role.toString()).change();
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

    if($("#password").val() !== $("#cpassword").val())
    {
        swal(
            'Oops!',
            'Password Mismatch.',
            'error'
        );
        $("#payment-button").show();
        return;
    }
    var fd = new FormData();
    fd.append('id', sendId);
    fd.append('fullname', $("#fullname").val());
    fd.append('username', $("#username").val());
    fd.append('email', $("#email").val());
    fd.append('password', $("#password").val());
    fd.append('role', $("#role").val());

    $.ajax({
        type: "PUT",
        url : "/sds/admin",
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
    if($("#password").val() !== $("#cpassword").val())
    {
        swal(
            'Oops!',
            'Password Mismatch.',
            'error'
        );
        $("#payment-button").show();
        return;
    }
    var fd = new FormData();
    fd.append('fullname', $("#fullname").val());
    fd.append('username', $("#username").val());
    fd.append('email', $("#email").val());
    fd.append('password', $("#password").val());
    fd.append('role', $("#role").val());
    $.ajax({
        type: "POST",
        url : "/sds/admin",
        data : fd,
        processData: false,
        contentType: false,
        
        success : function(json) {
            var j = json;
            swal(
                'Added!',
                $("#fullname").val() + ' was added successfully.',
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
    if(update == 1)
        sendNew();
    else
        sendEdit();
});