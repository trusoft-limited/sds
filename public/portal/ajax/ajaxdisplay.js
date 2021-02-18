$("#logout_cool").click(function (event) {
    
    var addedby = $('#uuname').html();

    event.preventDefault();
    swal({
        title: 'Logout',
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


function fn60sec() {
    $("#time_update").text(new Date().toLocaleString());
}

$( document ).ready(function() {
    $("#time_update").text(new Date().toLocaleString());
    setInterval(fn60sec, 1*1000);

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
