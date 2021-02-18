

var login_call = function() {
    if (!$('#termscond').is(":checked")){
    // it is checked
        swal(
            'Oops!',
            'Please Accept SDS Terms and Conditions.',
            'error'
        );
        return;
    }

    $("#send").hide();
    if($("#password").val() !== $("#cpassword").val()) {
        swal(
            'Oops!',
            'Password Mismatch.',
            'error'
        );
        $("#send").show();
        return;
    }

    if(!$("#password").val()) {
        swal(
            'Oops!',
            'Password is required.',
            'error'
        );
        $("#send").show();
        return;
    }
    
    var fd = new FormData();
    fd.append('name', $("#name").val());
    fd.append('username', $("#username").val());
    fd.append('phone', $("#phone").val());
    fd.append('email', $("#email").val());
    fd.append('password', $("#password").val());

    fd.append('businessname', $("#businessname").val());
    fd.append('businessaddress', $("#businessaddress").val());
    fd.append('town', $("#town").val());
    fd.append('lga', $("#lga").val());
    fd.append('state', $("#state").val());
    

    $.ajax({
        type: "POST",
        url : "/api/user-register/",
        data : fd,
        processData: false,
        contentType: false,

        success : function(json) {
            var j = json;
            document.cookie = "token_tcm=" + j.token + ";";
            document.location.href="/sds/dashboard";
        },

        complete: function(){
            
        },
        
        error : function(xhr,errmsg,err) {
            var json = JSON.parse(xhr.responseText);
            swal(
                'Error!',
                json.message,
                'error'
            );
            $("#send").show();
        }
    });

};

$("form" ).submit(function( event ) {
    event.preventDefault();
    var form = $( this ),
        action = form.attr('action'),
        type = form.attr('method');
    if(action === "/api/user-register/")
    {
        login_call();
    }
});