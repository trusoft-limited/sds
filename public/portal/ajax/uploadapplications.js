$("#editnew").hide();

var update = 0;
var sendId = 0;
function newHost()
{
    update = 1;
    $("#display").hide();
    $("#editnew").show();
}

function backHost()
{
    update = 0;
    $("#display").show();
    $("#editnew").hide();
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
        text: "Are you sure you want to delete " + jsonData[cat].brand + " - " + jsonData[cat].model + "?",
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
                url : "/channels/uploadapplication",
                data : fd,
                processData: false,
                contentType: false,
                
                success : function(json) {
                    var j = json;
                    swal(
                        'Deleted!',
                        jsonData[cat].brand + " - " + jsonData[cat].model + ' Deleted Successfully.',
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
    var x = document.getElementById("ejour").innerText;
    var jsonData = JSON.parse(x);
    //console.log(jsonData);
});

function sendNew()
{
    var addedby = $('#uuname').html();
    var fd = new FormData();
    fd.append('version', $("#version").val());
    fd.append('brand', $("#brand").val());
    fd.append('description', $("#description").val());
    fd.append('model', $("#model").val());
    fd.append('fix', $("#fix").val());
    fd.append('upload', upload.files[0]);
    fd.append('remarks', $("#remark").val());
    fd.append('addedby', addedby);

    var terminals = $("#terminals").val();
    var bnd = $("#brand").val();
    var txt = "";
    if(terminals)
    {
        txt = terminals;
    }else
    {
        txt = "ALL " + bnd + " TERMINALS";
    }

    fd.append('terminals', txt);

    swal({
        title: 'Application',
        text: "Are you sure you want to add application update for " + txt,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#001e33',
        cancelButtonColor: '#800080',
        confirmButtonText: 'Yes, Add!'
    }).then(function (result) {
        if (result.value)
        {
            $.ajax({
                type: "POST",
                url : "/channels/uploadapplication",
                data : fd,
                processData: false,
                contentType: false,
                
                success : function(json) {
                    var j = json;
                    swal(
                        'Added!',
                        $("#brand").val() + ' - ' + $("#model").val() + ' was added successfully.',
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
            $("#payment-button").show();
        }
    });
}

$("#fdet" ).submit(function( event ) {
    event.preventDefault();
    $("#payment-button").hide();
    if(update == 1)
        sendNew();
});