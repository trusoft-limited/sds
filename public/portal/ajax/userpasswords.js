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

function sendNew()
{
    var addedby = $('#uuname').html();
    var fd = new FormData();
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

    fd.append('oldpassword', $("#opassword").val());
    fd.append('password', $("#password").val());

    $.ajax({
        type: "POST",
        url : "/sds/changepassword",
        data : fd,
        processData: false,
        contentType: false,
        
        success : function(json) {
            var j = json;
            swal(
                'Success!',
                'Password Changed.',
                'success'
            );
            setTimeout(function() {
                document.location.href="/login"
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

$(document).ready(function() {
    
    
});