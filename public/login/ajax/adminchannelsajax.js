
$(document).on('click', '#forgot', function( event ) {
    swal(
        'Note!',
        'Kindly contact the Super Admin',
        'info'
    );
});

var delete_cookie = function(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

var login_call = function() {
    $("#send").hide();
    var username = $("#username").val();
    var password = $("#password").val();

    var fd = new FormData();
    fd.append('username', username);
    fd.append('password', password);
    fd.append('department', 'channels');
    fd.append('device', 'web');
    $.ajax({
        type: "POST",
        url : "/api/login/admin/auth",
        data : fd,
        processData: false,
        contentType: false,
        
        success : function(json) {
            var j = json;
            //console.log(j.token);
            document.cookie = "token_tcm=" + j.token + ";";
            document.location.href="/channels/users";
        },

        complete: function(){
            
        },
        
        error : function(xhr,errmsg,err) {
            //console.log(xhr);
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
    if(action === "/channels/login/send")
    {
        login_call();
    }
});