
var login_call = function() {
    $("#send").hide();
    var username = $("#usern").val();
    var password = $("#password").val();
    var fd = new FormData();
    fd.append('username', username);
    fd.append('password', password);
    $.ajax({
        type: "POST",
        url : "/api/login-user/",
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
    if(action === "/api/login-user/")
    {
        login_call();
    }
});