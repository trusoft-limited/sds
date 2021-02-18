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
                url : "/channels/ecr",
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

function copyOnclick(id)
{
    update = 1;
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
    $("#display").hide();
    $("#editnew").show();
    $("#name").val("");
    $("#setmode").val(jsonData[cat].setmode.toString()).change();
    $("#printreceipt").val(jsonData[cat].printreceipt.toString()).change();
    $("#remark").val(jsonData[cat].remarks);
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
    $("#name").val(jsonData[cat].name);
    $("#setmode").val(jsonData[cat].setmode.toString()).change();
    $("#printreceipt").val(jsonData[cat].printreceipt.toString()).change();
    $("#remark").val(jsonData[cat].remarks);

    $("#namecreated").val(jsonData[cat].namecreated);
    $("#datecreated").val(jsonData[cat].datecreated);
    $("#namemodified").val(jsonData[cat].namemodified);
    $("#datetmodified").val(jsonData[cat].datemodified);
}

$(document).ready(function() {
    var x = document.getElementById("ejour").innerText;
    var jsonData = JSON.parse(x);
    //console.log(jsonData);
});

function sendEdit()
{
    var addedby = $('#uuname').html();
    var fd = new FormData();
    fd.append('id', sendId);
    fd.append('name', $("#name").val());
    fd.append('setmode', $("#setmode").val());
    fd.append('printreceipt', $("#printreceipt").val());
    fd.append('remarks', $("#remark").val());
    fd.append('addedby', addedby);

    $.ajax({
        type: "PUT",
        url : "/channels/ecr",
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
    fd.append('name', $("#name").val());
    fd.append('setmode', $("#setmode").val());
    fd.append('printreceipt', $("#printreceipt").val());
    fd.append('remarks', $("#remark").val());
    fd.append('addedby', addedby);
    $.ajax({
        type: "POST",
        url : "/channels/ecr",
        data : fd,
        processData: false,
        contentType: false,
        
        success : function(json) {
            var j = json;
            swal(
                'Added!',
                $("#name").val() + ' was added successfully.',
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