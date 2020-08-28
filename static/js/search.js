$(document).ready(function(){
    $('.loading-container').css('display', 'none');

    $('.search-btn').click(function() {
        let field = $('#field').val();
        let keyword = $('#keyword').val();
        $('.loading-container').css('display', 'block');
        search(field, keyword).then((data) => {
            if (data.result !== null　&& data.count > 0) {
                renderFigure(data.result);
            }
        });
    });

    $('#keyword').on('keypress',function(e) {
        if(e.keyCode == 13) {
            $('.search-btn').click();
        }
    });

    async function search(field, keyword) {
        let result =  await $.ajax({
            type: 'GET',
            url: `/api/search`,
            success: function (data) {
                return data;
            },
            data: {
                field: field,
                keyword: keyword
            },
            dataType: 'json'
        });
        return result;
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
            }
        });
        $('.loading-container').css('display', 'none');
    }
});