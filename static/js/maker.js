$(document).ready(function(){

    
    // Loading Animation
    getFiguresByMaker(2020).then((result) => {
        setFiguresData(result.figures)
        renderFigure(result.figures);
        // Loading Animation pause
    });

    

    $('#releasedMonth').on('change', function() {
        let month = $(this).find(":selected").val();
        // Loading Animation
        filterFigures(month).then((figures) => {
            renderFigure(figures);
            // Loading Animation pause
        });
    });

    $('#releasedYear').on('change', function() {
        console.log($(this).find(":selected").val());
        let year = parseInt($(this).find(":selected").val());
        getFiguresByMaker(year).then((result) => {
            setFiguresData(result.figures)
            renderFigure(result.figures);
            // Loading Animation pause
        });
    });

    
    


    async function getFiguresByMaker(year) {
        let maker = window.location.pathname.split('/').slice(-1)[0].toLowerCase();
        let date = new Date();
        let result =  await $.ajax({
            type: 'GET',
            url: `/api/maker/${maker}`,
            success: function (data) {
                return data;
            },
            data: {
                year: year
            },
            dataType: 'json'
        });
        return result;
    }

    const setFiguresData = (figures) => {
        $.kairaishi = {};
        $.kairaishi.figures = figures;
    }

    const renderFigure = (figures) => {
        $('.figures-container').empty();
        const map  = {
            0: 'Jan',
            1: 'Feb',
            2: 'Mar',
            3: 'Apr',
            4: 'May',
            5: 'June',
            6: 'July',
            7: 'Aug',
            8: 'Sept',
            9: 'Oct',
            10: 'Nov',
            11: 'Dec'
        }
        var row;
        figures.map((figure, index) => {
            if (index%4 === 0) {
                row = '<div class="my-5 row">';
            }
            let time  = new Date(figure.released_at);
            let month = time.getMonth();
            let monthLab = `mt-1 month-tag position-absolute text-center ${map[month].toLowerCase()}`;
            row += `<div class="mt-4 col-md-3 col-12">
                            <div class="card card-lg">
                                <img  class="card-img-top" src="https://raw.githubusercontent.com/kairaishi/kairaishi/master${figure.thumbnail}">
                                <div class="card-body position-relative">
                                    <a href="/figures/${figure.hash}/${figure.id}" class="card-link">
                                        <h5 class="card-title">${figure.name.substring(0, 40)}</h5>
                                    </a>
                                    <div class="${monthLab}" data-month="${month+1}">
                                        <span>${map[time.getMonth()]}</span>
                                    </div>
                                </div>
                            </div>  
                        </div>`;
            if(index%4 === 3 || figures.length === (index+1)) {
                row += '</div>';
                $(row).appendTo($('.figures-container'));
                $('.figures-container .month-tag').click( function() {
                    let month = $(this).data("month");
                    $('#releasedMonth').val(month).trigger("change");
            
                });
            }
        });
        $('.loading-container').css('display', 'none');
    }

    async function filterFigures(filterMonth) {
        var result = await $.kairaishi.figures.filter((figure, index) => {
            let released_at = new Date(figure.released_at);
            let month = released_at.getMonth() + 1;
            return (parseInt(filterMonth) === -1) ? true : month == filterMonth;
        });
        return result;
    }
    
      


    $(".figure-like").click(function() {
        $.ajax({
            type: 'GET',
            url: '/api/figure/isliked',
            data: {
                id: 1726
            },
            success: function (data) {
                console.log(data);
            },
            dataType: 'json'
        });
    });
    // $('.comment').click(function() {
    //     $.ajax({
    //         type: 'POST',
    //         url: '/api/comment',
    //         data: {
    //             id: 1726,
    //             comment: 'こんばんは'
    //         },
    //         success: function (data) {
    //             console.log(data);
    //         },
    //         dataType: 'json'
    //     });
    // });

    // $('.deletecomment').click(function() {
    //     $.ajax({
    //         type: 'DELETE',
    //         url: '/api/comment',
    //         data: {
    //             id: 2
    //         },
    //         success: function (data) {
    //             console.log(data);
    //         },
    //         dataType: 'json'
    //     });
    // });
    
    // $('.updatecomment').click(function() {
    //     $.ajax({
    //         type: 'PUT',
    //         url: '/api/comment',
    //         data: {
    //             id: 3,
    //             comment: 'リア充'
    //         },
    //         success: function (data) {
    //             console.log(data);
    //         },
    //         dataType: 'json'
    //     });
    // });



   

    // $('.price').click(function() {
    //     $.ajax({
    //         type: 'GET',
    //         url: '/api/price',
    //         success: function (data) {
    //             console.log(data);
    //         },
    //         data: {
    //             upper: 8000,
    //             lower: -1
    //         },
    //         dataType: 'json'
    //     });
    // });
});