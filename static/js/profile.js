$(document).ready(function(){
    
    getFiguresByMaker().then((likes) => {
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
        let row;
        likes.result.map((figure, index, arr) => {
            let time  = new Date(figure.released_at);
            let month = time.getMonth();
            if (index%4 === 0) {
                row = $('<div class="my-5 row"></div>');
            }
            
            let monthLab = `mt-1 month-tag position-absolute text-center ${map[month].toLowerCase()}`;
            row.append($(`<div class="mt-4 col-md-3 col-12">
                                <div class="card" style="height: 455px;">
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
                            </div>`));
            if(index%4 === 3 || arr.length === (index+1)) {
                row.appendTo($('.favorites-container'));
            }
        });
        $('.loading-container').css('display', 'none');
    });


    async function getFiguresByMaker() {
        let result =  await $.ajax({
            type: 'GET',
            url: `/api/favorites`,
            success: function (data) {
                return data;
            },
            dataType: 'json'
        });
        return result;
    }
});


