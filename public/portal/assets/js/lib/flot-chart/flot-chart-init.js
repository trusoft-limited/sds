(function($){

 "use strict"; // Start of use strict


    var SufeeAdmin = {
        cpuLoad: function(){
            var init = 0;
            function getDateTimeSpec()
            {
                var str = "";
                var currentTime = new Date();
                var year = currentTime.getFullYear();
                var mnt = currentTime.getMonth() + 1;
                var day = currentTime.getDate();
                var hours = currentTime.getHours();
                var minutes = currentTime.getMinutes();
                var seconds = currentTime.getSeconds();
                if(mnt < 10)
                {
                    mnt = "0" + mnt;
                }
                if(day < 10)
                {
                    day = "0" + day
                }
                if (hours < 10) {
                    hours = "0" + hours;
                }
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (seconds < 10) {
                    seconds = "0" + seconds;
                }
                str += year + "-" + mnt + "-" + day;
                return str;
            }

            var lastId = 0;
            var x = document.getElementById("ejournal").innerText;
            var jsonData = JSON.parse(x);
            var dt = getDateTimeSpec();
            var mD = [];
            if(jsonData)
            {
                lastId = jsonData[0].id;
                for(var i = 0; i < jsonData.length; i++) 
                {
                    if (dt.indexOf(jsonData[i].current_date) !=-1) {
                        var d = parseFloat(parseFloat(jsonData[i].amount)/100).toFixed(2);
                        mD.push(parseFloat(d));
                    }
                }
            }
            //console.log(mD);
            //console.log(jsonData);
            //console.log(init)
            //console.log(lastId)

            var data = mD;
            var totalPoints = jsonData.length;

            function getRandomData() 
            {
                if(init)
                {
                    $.ajax({
                        type: "GET",
                        url : "/channels/portal/getfrom/" + lastId.toString(),
                        processData: false,
                        contentType: false,
                        
                        success : function(json) {
                            var j = json.message;
                            //console.log(j)
                            if(j !== "null")
                            {
                                var jsonData = JSON.parse(j);
                                var dt = getDateTimeSpec();
                                var mD = [];
                                lastId = jsonData[0].id;
                                for(var i = 0; i < jsonData.length; i++) {
                                    if (dt.indexOf(jsonData[i].current_date) !=-1) {
                                        var d = parseFloat(parseFloat(jsonData[i].amount)/100).toFixed(2);
                                        mD.push(parseFloat(d));
                                    }
                                }
                                data = mD;
                                totalPoints = jsonData.length;
                            }
                        },
                
                        complete: function(){
                            
                        },
                        
                        error : function(xhr,errmsg,err) {
                            var json = JSON.parse(xhr.responseText);
                            //console.log(json);
                        }
                    });
                    var databp = data;
                    var lenbp = totalPoints;
                    if ( data.length > 0 )
                        data = data.slice( 1 );
                    while ( data.length < totalPoints ) 
                    {
                        data.push(databp[lenbp - 1]);
                        data.push(0);
                    }
                    
                    var res = [];
                    for ( var i = 0; i < data.length; ++i ) {
                        res.push( [ i, data[ i ] ] )
                    }
                }else
                {
                    var res = [];
                    for ( var i = 0; i < data.length; ++i ) {
                        res.push( [ i, data[ i ] ] )
                    }
                }
                init++;
                return res;
            }

            var updateInterval = 30;
            $( "#updateInterval" ).val( updateInterval ).change( function () {
                var v = $( this ).val();
                if ( v && !isNaN( +v ) ) {
                    updateInterval = +v;
                    if ( updateInterval < 1 ) {
                        updateInterval = 1;
                    } else if ( updateInterval > 3000 ) {
                        updateInterval = 3000;
                    }
                    $( this ).val( "" + updateInterval );
                }
            } );

            var plot = $.plot( "#cpu-load", [ getRandomData() ], {
                series: {
                    shadowSize: 0 // Drawing is faster without shadows
                },
                yaxis: {
                    min: 0,
                    max: 100
                },
                xaxis: {
                    show: false
                },
                colors: [ "#007BFF" ],
                grid: {
                    color: "transparent",
                    hoverable: true,
                    borderWidth: 0,
                    backgroundColor: 'transparent'
                },
                tooltip: true,
                tooltipOpts: {
                    content: "NGN %y",
                    defaultTheme: false
                }


            } );

            function update() {

                plot.setData( [ getRandomData() ] );
                // Since the axes don't change, we don't need to call plot.setupGrid()
                plot.draw();
                setTimeout( update, updateInterval );
            }
            update();
        },

    pieFlot: function(){
        var x = document.getElementById("state").innerText;
        var jsonData = JSON.parse(x);
        var printbusy = 0;
        var printok = 0;
        var printnopaper = 0;
        var printothers = 0;
        for(var i = 0; i < jsonData.length; i++) {
            if(jsonData[i].printer_state === "Printer Ok")
            {
                printok++;
            }else if(jsonData[i].printer_state === "Out of paper")
            {
                printnopaper++;
            }else if(jsonData[i].printer_state === "Printer busy")
            {
                printbusy++;
            }else
            {
                printothers++;
            }

        }

        var data = [
            {
                label: "Printer Busy",
                data: printbusy,
                color: "#8fc9fb"
            },
            {
                label: "Printer Ok",
                data: printok,
                color: "#007BFF"
            },
            {
                label: "Out Of Paper",
                data: printnopaper,
                color: "#19A9D5"
            },
            {
                label: "Faulty Printer",
                data: printothers,
                color: "#DC3545"
            }
        ];

        var plotObj = $.plot( $( "#flot-pie" ), data, {
            series: {
                pie: {
                    show: true,
                    radius: 1,
                    label: {
                        show: false,

                    }
                }
            },
            grid: {
                hoverable: true
            },
            tooltip: {
                show: true,
                content: "%p.0%, %s, n=%n", // show percentages, rounding to 2 decimal places
                shifts: {
                    x: 20,
                    y: 0
                },
                defaultTheme: false
            }
        } );
    }
};

$(document).ready(function() {
    SufeeAdmin.cpuLoad();
    SufeeAdmin.pieFlot();
});


$( document ).ready(function() {
    var x = document.getElementById("ejournal").innerText;
    var jsonData = JSON.parse(x);
    var total = 0.00;
    for(var i = 0; i < jsonData.length; i++) 
    {
        if(jsonData[i].response_code === "00" || jsonData[i].response_code === "25")
        {
            total += parseFloat(jsonData[i].amount);
        }
    }   
    var famt = (total).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    $("#apprvTxn").text("NGN " + famt);
});

$( document ).ready(function() {
    var x = document.getElementById("ejournal").innerText;
    var jsonData = JSON.parse(x);
    var total = 0.00;
    for(var i = 0; i < jsonData.length; i++) 
    {
        if(jsonData[i].response_code === "00" || jsonData[i].response_code === "25")
        {

        }else
        {
            total += parseFloat(jsonData[i].amount);
        }
    }   
    var famt = (total).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    $("#failedTxn").text("NGN " + famt);
});


$( document ).ready(function() {
    var x = document.getElementById("ejournal").innerText;
    var jsonData = JSON.parse(x);
    var total = 0.00;
    for(var i = 0; i < jsonData.length; i++) 
    {
        total += parseFloat(jsonData[i].amount);
    }   
    var famt = (total).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    $("#allTxn").text("NGN " + famt);
});

$( document ).ready(function() {
    var x = document.getElementById("state").innerText;
    var jsonData = JSON.parse(x);
    var count = 0;
    for(var i = 0; i < jsonData.length; i++) {
        if(jsonData[i].printer_state !== "Printer Ok")
        {
            count++;
        }
    }
    $("#terminalIssue").text(count.toString());
});

})(jQuery);
