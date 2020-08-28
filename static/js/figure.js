
$(document).ready(function(){

    const to2bit = (n) => {
        return n < 10 ? '0' + n : n + '';
    };
    let figureId = window.location.pathname.split('/').splice(-1)[0];
    sycLike(figureId);
    

    getComments(figureId).then(data=> {
        updateComment(data);
    });

    getFavorites(figureId).then(data=> {
        let likes =  data.result[0].count || 0;
        $('.likes').text(likes)
    });

    $('.comment-btn').click(function() {
        let comment  = $('.textarea').text();
        let figureId = window.location.pathname.split('/').splice(-1)[0];
        postComment(figureId, comment).then((data) => {
            $('.textarea').empty();
            console.log(data);
            updateComment(data, true);
        });
    });

    

    $('.like-btn').click(function() {
        $.ajax({
            type: 'POST',
            url: '/api/favorites',
            data: {
                id: figureId
            },
            success: function (data) {
                if (data.like) {
                    $('.o-heart').addClass('like');
                    $('.likes').text(parseInt(parseInt($('.likes').text())) + 1);
                } else {
                    $('.o-heart').removeClass('like');
                    $('.likes').text(parseInt(parseInt($('.likes').text())) -1);
                }
                
            },
            dataType: 'json'
        });
    });

    async function sycLike(figureId) {
        $.ajax({
            type: 'GET',
            url: '/api/figure/isliked',
            data: {
                id: figureId
            },
            success: function (data) {
                if (data.like) {
                    $('.o-heart').addClass('like');
                } else {
                    $('.o-heart').removeClass('like');
                }
            },
            dataType: 'json'
        });
    }

    async function getComments(figureId) {
        let result = await $.ajax({
            type: 'GET',
            url: '/api/comment',
            data: {
                id: figureId
            },
            success: function (data) {
                return data;
            },
            dataType: 'json'
        });
        return result;
    }

    async function getFavorites(figureId) {
        let result = await $.ajax({
            type: 'GET',
            url: '/api/favorites/figure',
            data: {
                id: figureId
            },
            success: function (data) {
                return data;
            },
            dataType: 'json'
        });
        return result;
    }

    

    async function postComment(figureId, comment) {
        let result = await $.ajax({
            type: 'POST',
            url: '/api/comment',
            data: {
                id: figureId,
                comment: comment
            },
            success: function (data) {
                
            },
            dataType: 'json'
        });
        return result;
    }

    const updateComment = (data) => {
        $('.comments-container').empty();
        $.kairaishi = {};
        $.kairaishi.comments = data.comments;
        data.comments.map((comment, index) => {
            let date = new Date(comment.modified_at);
            var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            let timeLabel = `${date.getFullYear()}-${to2bit(date.getMonth()+1)}-${to2bit(date.getDate())}`;
            let tools ;
            if (data.user !== null &&  (data.user.id === comment.user_id)) {
                tools = `<div class="tools position-absolute top-right">
                                <a class="edit-btn text-primary" data-id="${comment.id}">
                                    <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
                                </a>
                                <a class="delete-btn text-danger" data-id="${comment.id}">
                                    <i class="fa fa-trash-o" aria-hidden="true"></i>
                                </a>
                            </div>`;
            } else {
                tools =``;
            }
            $(`<div class="comment-wrapper position-relative comment-${comment.id}">
                <div class="avatar-container">
                    <div class="avatar mr-2">
                        <img src="${comment.thumbnail}" class="profile-img rounded-circle">
                    </div>
                </div>
                <div class="comment-body">
                    <div class="user">
                        <span class="name vertical-middle mr-1">${comment.name}</span>
                        <span class="username vertical-middle mr-2">@${comment.username}</span>
                        <span class="time vertical-middle mr-2">${timeLabel}</span>
                    </div>
                    <div class="comment-content mt-1">
                        ${comment.contents}
                    </div>
                </div>
                ${tools}
                <div class="mt-2 position-relative btn-wrapper cmt-submit btn-${comment.id}"  data-id="${comment.id}" style="display:none;">
                    <button type="button" class="btn position-absolute btn-right twitter-color-bg">Submit</button>
                </div>
            </div>`).appendTo($('.comments-container'));
            
        });
        $('.delete-btn').click(function() {
            let commentId = $(this).data('id');
            $.ajax({
                type: 'DELETE',
                url: '/api/comment',
                data: {
                    id: commentId
                },
                success: function (data) {
                    if(data.deleted) {
                        let comments = $.kairaishi.comments.filter((comment, index) => {
                            return comment.id !== parseInt(commentId);
                        });
                        let commentData = {comments: data.comments, user: data.user}
                        updateComment(commentData);
                    }
                },
                dataType: 'json'
            });
        });

        $('.edit-btn').click(function() {
            let commentId = $(this).data('id');
            $(`.comment-${commentId} .comment-content`).addClass('textarea').attr('contenteditable', 'true');
            $(`.btn-${commentId}`).css('display', 'block');
        });
        $(`.cmt-submit`).click(function() {
            let commentId = $(this).data('id');
            let commentMsg = $(`.comment-${commentId} .comment-content`).text().trim();
            $.ajax({
                type: 'PUT',
                url: '/api/comment',
                data: {
                    id: commentId,
                    comment: commentMsg
                },
                success: function (data) {
                    if(data.updated) {
                        let comments = $.kairaishi.comments.map((comment, index) => {
                            if (comment.id === parseInt(commentId)) {
                                comment.contents = commentMsg;
                            }
                            return comment;
                        });
                        let commentData = {comments: comments, user: data.user}
                        updateComment(commentData);
                    }
                },
                dataType: 'json'
            });
        });
    }

    async function getAuthorizationStatus() {
        let status = await $.ajax({
            type: 'GET',
            url: '/api/user/isauthorized',
            success: function (data) {
                console.log(data);
            },
            dataType: 'json'
        });
        return status;
    }



});



