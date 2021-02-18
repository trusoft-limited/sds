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

function voidPin(id)
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
    
    if(jsonData[cat].used === true)
    {
        swal(
            'EMPTY!',
            'You can not void a used voucher.',
            'success'
        );
        return;
    }else if(jsonData[cat].void === 'true')
    {
        swal(
            'EMPTY!',
            'You can not void this voucher.',
            'success'
        );
        return;
    }else
    {
        swal({
            title: 'Void',
            text: "Are you sure you want to void " + jsonData[cat].pin + " belonging to " + jsonData[cat].name + "?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#800080',
            cancelButtonColor: '#001e33',
            confirmButtonText: 'Yes, Void!'
        }).then(function (result) {
            if (result.value) {
                var fd = new FormData();
                fd.append('id', jsonData[cat].id);
                fd.append('act', "voidpin");
    
                $.ajax({
                    type: "PUT",
                    url : "/sds/ui",
                    data : fd,
                    processData: false,
                    contentType: false,
                    
                    success : function(json) {
                        var j = json;
                        swal(
                            'Void!',
                            jsonData[cat].pin + ' has been queued up for voiding.',
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
}

function resetPin(id)
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

    swal({
        title: 'Reset',
        text: "Are you sure you want to reset " + jsonData[cat].pin + " belonging to " + jsonData[cat].name + "?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#800080',
        cancelButtonColor: '#001e33',
        confirmButtonText: 'Yes, Reset!'
    }).then(function (result) {
        if (result.value) {
            var fd = new FormData();
            fd.append('id', jsonData[cat].id);
            fd.append('act', "resetpin");

            $.ajax({
                type: "PUT",
                url : "/sds/ui",
                data : fd,
                processData: false,
                contentType: false,
                
                success : function(json) {
                    var j = json;
                    swal(
                        'Reset!',
                        jsonData[cat].pin + ' has been queued up for reset.',
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

function confirmAction(id)
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

    var tex = "";
    if(jsonData[cat].dispute === '' || jsonData[cat].dispute === null|| jsonData[cat].dispute === undefined)
    {
        swal(
            'EMPTY!',
            'There is no action for this item.',
            'success'
        );
        return;
    }else
    {
        if(jsonData[cat].dispute === 'voidpin')
        {
            tex = "Are you sure you want to confirm a void for " + jsonData[cat].pin + " belonging to " + jsonData[cat].name + "?"
        }else
        {
            tex = "Are you sure you want to confirm a reset for " + jsonData[cat].pin + " belonging to " + jsonData[cat].name + "?"
        }
        swal({
            title: 'Confirm',
            text: tex,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#800080',
            cancelButtonColor: '#001e33',
            confirmButtonText: 'Yes, Confirm!'
        }).then(function (result) {
            if (result.value) {
                var fd = new FormData();
                fd.append('id', jsonData[cat].id);
                fd.append('act', "confirm");
                fd.append('maker', jsonData[cat].dispute);
    
                $.ajax({
                    type: "PUT",
                    url : "/sds/ui/checker",
                    data : fd,
                    processData: false,
                    contentType: false,
                    
                    success : function(json) {
                        var j = json;
                        swal(
                            'Success!',
                            'Action is successful.',
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
}

function revokeAction(id)
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

    var tex = "";
    if(jsonData[cat].dispute === '' || jsonData[cat].dispute === null|| jsonData[cat].dispute === undefined)
    {
        swal(
            'EMPTY!',
            'There is no action for this item.',
            'success'
        );
        return;
    }else
    {
        if(jsonData[cat].dispute === 'voidpin')
        {
            tex = "Are you sure you want to revoke a void for " + jsonData[cat].pin + " belonging to " + jsonData[cat].name + "?"
        }else
        {
            tex = "Are you sure you want to revoke a reset for " + jsonData[cat].pin + " belonging to " + jsonData[cat].name + "?"
        }
        swal({
            title: 'Revoke',
            text: tex,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#800080',
            cancelButtonColor: '#001e33',
            confirmButtonText: 'Yes, Revoke!'
        }).then(function (result) {
            if (result.value) {
                var fd = new FormData();
                fd.append('id', jsonData[cat].id);
                fd.append('act', "revoke");
                fd.append('maker', jsonData[cat].dispute);

                $.ajax({
                    type: "PUT",
                    url : "/sds/ui/checker",
                    data : fd,
                    processData: false,
                    contentType: false,
                    
                    success : function(json) {
                        var j = json;
                        swal(
                            'Success!',
                            'Action is successful.',
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