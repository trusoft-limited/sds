$("#editnew").hide();

$("#logout_cool").click(function (event) 
{
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
var sendId = "";
function newHost()
{
    update = 1;
    $("#display").hide();
    $("#editnew").show();
    
    $("#number").val("");
}

function backHost()
{
    update = 0;
    $("#display").show();
    $("#editnew").hide();

    $("#number").val("");
}

function editOnclick(id)
{
    var x = document.getElementById("ejour").innerText;
    var jsonData = JSON.parse(x);
    var cat = 0;
    for(var i = 0; i < jsonData.length; i++) {
        var obj = jsonData[i];
        if(id == obj.number)
        {
            cat = i;
            break;
        }
    }
    sendId = jsonData[cat].number;
    swal({
        title: 'Delete',
        text: "Are you sure you want to remove " + jsonData[cat].number + " from the blacklist?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#800080',
        cancelButtonColor: '#001e33',
        confirmButtonText: 'Yes, Remove!'
    }).then(function (result) {
        if (result.value) {
            var fd = new FormData();
            fd.append('id', sendId);
            $.ajax({
                type: "DELETE",
                url : "/sds/superadmin/blacklist/" + sendId,
                data : fd,
                processData: false,
                contentType: false,
                
                success : function(json) {
                    var j = json;
                    swal(
                        'Removed!',
                        jsonData[cat].number + ' has been Removed Successfully.',
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

function sendNew()
{
    var addedby = $('#uuname').html();
    console.log(addedby)
    var fd = new FormData();
    fd.append('number', $("#number").val());
    fd.append('by', addedby);
    $.ajax({
        type: "POST",
        url : "/sds/superadmin/blacklist",
        data : fd,
        processData: false,
        contentType: false,
        
        success : function(json) {
            var j = json;
            swal(
                'Added!',
                $("#number").val() + ' has been blacklisted successfully.',
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