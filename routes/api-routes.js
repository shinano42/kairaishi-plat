const { route } = require('./auth-routes');

const Client  = require('pg').Client;
const router = require('express').Router();



const authCheck = (req, res, next) => {
    if (!req.user) {
        // if user is not logged in
        res.redirect('/auth/login');
        console.log('unauthorized user.')
    } else {
        // if logged in
        next();
    }
};

const toMakerId = (maker) => {
    const makerid = {
        "alter": 1,
        "kotobukiya": 2,
        "goodsmile": 3
    };
    return makerid[maker];
};
const is_numeric = (str) => {
    return /^\d+$/.test(str);
};

const checkLowerValid = (input) =>{
    let parseValue = parseInt(input);
   if ([0, '0', undefined, 'undefined', null, 'null'].includes(input) || (parseValue !== NaN &&  parseValue < 0)) {
       return 0;
   }
   return parseValue;
}

const checkUpperValid = (input) =>{
   let parseValue = parseInt(input);
  if ([0, '0', undefined, 'undefined', null, 'null'].includes(input) || (parseValue !== NaN &&  parseValue < 0)) {
      return null;
  }
  return parseValue;
}

async function getFiguresByMaker(maker, year) {
    const client = new Client({
        user: 'developer',
        host: '127.0.0.1',
        database: 'kairaishi_test',
        password: 'root',
        port: 5432,
      });
    client.connect();
    let figures = await client.query(`SELECT id, name, price, scale, size, model_sculptor, hash, coloring, specification, copyright, material, "desc", maker_id, anime, "character", released_at, thumbnail, remake_records
            FROM public.figure
            WHERE (maker_id = ${maker} AND EXTRACT(year FROM released_at) = ${year} )
            ORDER BY released_at DESC;`);
    client.end();
    return {figures: figures.rows, count: figures.rowCount}
}

async function getYearsByMaker(maker) {
    const client = new Client({
        user: 'developer',
        host: '127.0.0.1',
        database: 'kairaishi_test',
        password: 'root',
        port: 5432,
      });
    client.connect();
    let years = await client.query(`SELECT DISTINCT EXTRACT( year from released_at) AS released_year
            FROM public.figure
            WHERE maker_id = ${maker}
            ORDER BY released_year DESC;`).then(years => {
                return years.rows.map((obj)=> obj.released_year);
              });
    client.end();
    return { years: years };
}

async function getFigure(id, hash) {
    const client = new Client({
        user: 'developer',
        host: '127.0.0.1',
        database: 'kairaishi_test',
        password: 'root',
        port: 5432,
      });
    client.connect();
    let figure = await client.query(`SELECT  id, name, price, scale, size, model_sculptor, hash, coloring, specification, copyright, material, "desc", maker_id, anime, "character", released_at, thumbnail, remake_records
            FROM public.figure
            WHERE hash='${hash}' AND id=${id};`);
    client.end();
    return figure.rows[0];
}

async function getFigureByHash(hash) {
    const client = new Client({
        user: 'developer',
        host: '127.0.0.1',
        database: 'kairaishi_test',
        password: 'root',
        port: 5432,
      });
    client.connect();
    let figure = await client.query(`SELECT  id, name, price, scale, size, model_sculptor, hash, coloring, specification, copyright, material, "desc", maker_id, anime, "character", released_at, thumbnail, remake_records
            FROM public.figure
            WHERE hash='${hash}'`);
    client.end();
    return {figure: figure.rows, count: figure.rowCount };
}

async function toggleFavorites(user, figureId) {
    const client = new Client({
        user: 'developer',
        host: '127.0.0.1',
        database: 'kairaishi_test',
        password: 'root',
        port: 5432,
      });
    client.connect();
    let hasLiked = await client.query(`SELECT id, user_id, figure_id
	FROM public."Likes"
    WHERE user_id=${user.id} AND figure_id=${figureId};`).catch(e => console.error(e.stack));
    console.log(hasLiked);
    if(hasLiked.rowCount === 0) {
        let result = await client.query(`INSERT INTO public."Likes"(
            user_id, figure_id)
           VALUES ( ${user.id}, ${figureId});`);
        client.end();
        return {like: true, id: figureId, msg: 'like successfully'};
    } else {
        let result = await client.query(`DELETE FROM public."Likes"
        WHERE user_id=${user.id} AND figure_id=${figureId};`);
        client.end();
        return {like: false, id: figureId, msg: 'unlike successfully'};
    }
}

async function getComments(figureId) {
    const client = new Client({
        user: 'developer',
        host: '127.0.0.1',
        database: 'kairaishi_test',
        password: 'root',
        port: 5432,
      });
    client.connect();
    let result = await client.query(`SELECT public.comments.id, user_id, figure_id, contents, modified_at, username, public."Users".name, thumbnail
	FROM public.comments
	INNER JOIN public."Users"
	ON public.comments.user_id = public."Users".id
	WHERE figure_id = ${figureId}
	ORDER BY modified_at DESC;`).catch(e => console.error(e.stack));
        
    client.end();
    if (result === undefined) {
        return {success: false};
    } else {
        console.log(1111);
        return {success: true, comments: result.rows, count: result.rowCount};
    }
}


async function commentOnFigure(user, figureId, userComment) {
    const client = new Client({
        user: 'developer',
        host: '127.0.0.1',
        database: 'kairaishi_test',
        password: 'root',
        port: 5432,
      });
    client.connect();
    let query = await client.query(`INSERT INTO public.comments(
        user_id,  figure_id, contents, modified_at)
        VALUES ($1, $2, $3, to_timestamp($4/ 1000.0));`, [ user.id, figureId, userComment, Date.now()]).catch(e => console.error(e.stack));
        
    if (query !== undefined) {
        let result = await client.query(`SELECT public.comments.id, user_id, figure_id, contents, modified_at, username, thumbnail
            FROM public.comments
            INNER JOIN public."Users"
            ON public.comments.user_id = public."Users".id
            WHERE figure_id = ${figureId}
            ORDER BY modified_at DESC`).catch(e => console.error(e.stack));
        client.end();
        if (result === undefined) {
            return {success: false};
        } else {
            return {success: true, comments: result.rows, user: user};
        }
    }
}

async function deleteComment(user, commentId) {
    const client = new Client({
        user: 'developer',
        host: '127.0.0.1',
        database: 'kairaishi_test',
        password: 'root',
        port: 5432,
      });
    client.connect();
    let query = await client.query(`DELETE FROM public.comments
        WHERE id=${commentId} AND user_id=${user.id};`).catch(e => console.error(e.stack));
    client.end();
    if (query === undefined) {
        return {deleted: false, user: user};
    } else {
        return {deleted: true, user: user};
    }
}

async function updateComment(user, commentId, userComment) {
    const client = new Client({
        user: 'developer',
        host: '127.0.0.1',
        database: 'kairaishi_test',
        password: 'root',
        port: 5432,
      });
    client.connect();
    let query = await client.query(`UPDATE public.comments
        SET contents='${userComment}', modified_at=to_timestamp(${Date.now()}/ 1000.0)
        WHERE id=${commentId} AND user_id=${user.id};`).catch(e => console.error(e.stack));
        
        client.end();
        if (query === undefined) {
            return {updated: false};
        } else {
            return {updated: true, user: user};
        }
        
}


async function getFavorites(user) {
    const client = new Client({
        user: 'developer',
        host: '127.0.0.1',
        database: 'kairaishi_test',
        password: 'root',
        port: 5432,
      });
    
    client.connect();
    let result = await client.query(`SELECT public.figure.id, public.figure.name, price, scale, size, model_sculptor, hash, coloring, specification, copyright, material, "desc", public.manufacturer.name as maker,  maker_id, anime, "character", released_at, thumbnail, remake_records, public."Likes".user_id AS user_id
    FROM public.figure 
    INNER JOIN public."Likes" ON public."Likes".figure_id = public.figure.id
    INNER JOIN public.manufacturer ON public.manufacturer.id = public.figure.maker_id 
    WHERE user_id = ${user.id} ORDER BY public.figure.id ASC;`).catch(e => console.error(e.stack));
        
    client.end();
    if (result === undefined) {
        return {success: false, result: null};
    } else {
        return {success: true, result: result.rows, count: result.rowCount};
    }
}

async function getFigureFavorites(figureId) {
    const client = new Client({
        user: 'developer',
        host: '127.0.0.1',
        database: 'kairaishi_test',
        password: 'root',
        port: 5432,
      });
    client.connect();
    let result = await client.query(`SELECT COUNT(id)
        FROM public."Likes"
        WHERE figure_id = ${figureId};`).catch(e => console.error(e.stack));
        
    client.end();
    if (result === undefined) {
        return {success: false, result: null};
    } else {
        return {success: true, result: result.rows, count: result.rowCount};
    }
}

async function getUserIsLiked(user, figureId) {
    const client = new Client({
        user: 'developer',
        host: '127.0.0.1',
        database: 'kairaishi_test',
        password: 'root',
        port: 5432,
      });
    client.connect();
    let result = await client.query(`SELECT id, user_id, figure_id
    FROM public."Likes"
    WHERE user_id = ${user.id} AND figure_id = ${figureId}`).catch(e => console.error(e.stack));
        
    client.end();
    if (result.rowCount  === 0) {
        return {like: false};
    } else {
        return {like: true};
    }
}

async function getRandomFigures(n) {
    const client = new Client({
        user: 'developer',
        host: '127.0.0.1',
        database: 'kairaishi_test',
        password: 'root',
        port: 5432,
      });
    client.connect();
    let result = await client.query(`SELECT id, name, price, scale, size, model_sculptor, hash, coloring, specification, copyright, material, "desc", maker_id, anime, "character", released_at, thumbnail, remake_records FROM public.figure
        ORDER BY RANDOM()
        LIMIT ${n};`).catch(e => console.error(e.stack));
        
    client.end();
    if (result === undefined) {
        return {success: false, result: null};
    } else {
        return {success: true, result: result.rows, count: result.rowCount};
    }
}



async function searchFigures(keyword, field) {
    const client = new Client({
        user: 'developer',
        host: '127.0.0.1',
        database: 'kairaishi_test',
        password: 'root',
        port: 5432,
      });
    client.connect();
    let queryField = 'public.figure.' + field;
    let result = await client.query(`SELECT id, name, price, scale, size, model_sculptor, hash, coloring, specification, copyright, material, "desc", maker_id, anime, "character", released_at, thumbnail, remake_records
        FROM public.figure
        WHERE ${queryField} LIKE '%${keyword}%'`).catch(e => console.error(e.stack));
        
    client.end();
    if (result === undefined) {
        return {success: false, result: null};
    } else {
        return {success: true, result: result.rows, count: result.rowCount};
    }
}

async function searchByPrice(lower, upper) {
    const client = new Client({
        user: 'developer',
        host: '127.0.0.1',
        database: 'kairaishi_test',
        password: 'root',
        port: 5432,
      });
    client.connect();
    let threshold = 8000;
    let upperBound =  (upper == null) ? threshold : upper;
    if (lower > upperBound) {
        let tmp = upperBound;
        upperBound = lower;
        lower = tmp;
    }
    let result = await client.query(`SELECT id, name, price, scale, size, model_sculptor, hash, coloring, specification, copyright, material, "desc", maker_id, anime, "character", released_at, thumbnail, remake_records
    FROM public.figure
    WHERE public.figure.price BETWEEN ${lower} AND ${upperBound}
    ORDER BY released_at DESC;`).catch(e => console.error(e.stack));
    if (result === undefined) {
        return {success: false, result: null};
    } else {
        return {success: true, result: result.rows, count: result.rowCount};
    }
}

router.get('/maker/:maker', (req, res) => {
    let year = (is_numeric(req.query.year)) ?  parseInt(req.query.year, 10) : new Date().getFullYear() ;
    let maker = toMakerId(req.params.maker.toLowerCase());
    getFiguresByMaker(maker, year).then((figures) => {
        res.send(figures);
    })

});

router.get('/:maker/years', (req, res) => {
    let maker = toMakerId(req.params.maker.toLowerCase());
    getYearsByMaker(maker).then((yrs) => {
        res.send(yrs);
    });

});

router.get('/figures/:hashcode',  (req, res) => {
    let id = (is_numeric(req.query.id)) ?  parseInt(req.query.id, 10) : null ;
    if (is_numeric(req.query.id)) {
        getFigure(id, req.params.hashcode).then((figure) =>{
            res.send(figure);
        });
    } else {
        getFigureByHash(req.params.hashcode).then((figure) =>{
            res.send(figure);
        });
    }
});

router.get('/random/figures',  (req, res) => {
    let n = (is_numeric(req.query.n)) ?  parseInt(req.query.n, 10) : null ;
    console.log(n);
    getRandomFigures(n).then((result) => {
        res.status(200).send(result);
    });
});

router.post('/favorites', authCheck,  (req, res) => {
    let id = (is_numeric(req.body.id)) ?  parseInt(req.body.id, 10) : null ;
    toggleFavorites(req.user, id).then((result) => {
        res.status(200).send(result);
    });
});

router.get('/favorites', authCheck, (req, res) =>{
    getFavorites(req.user).then((result) => {
        res.status(200).send(result);
    });
});

router.get('/figure/isliked', authCheck, (req, res) =>{
    let figureId = (is_numeric(req.query.id)) ?  parseInt(req.query.id, 10) : null ;
    getUserIsLiked(req.user, figureId).then((result) => {
        res.status(200).send(result);
    });
});

router.get('/favorites/figure', (req, res)=> {
    let figureId = (is_numeric(req.query.id)) ?  parseInt(req.query.id, 10) : null ;
    getFigureFavorites(figureId).then((result)=> {
        res.status(200).send(result);
    });
})

router.get('/comment', (req, res) => {
    let id = (is_numeric(req.query.id)) ?  parseInt(req.query.id, 10) : null ;
    getComments(id).then((result) => {
        console.log('comment');
        if (!req.user) {
            result.user = null;
        } else {
            result.user = Object.assign({}, {id: req.user.id, name: undefined, username: req.user.username, thumbnail: req.user.thumbnail}) ;
        }
        console.log(result);
        res.status(200).send(result);
    });
});

router.post('/comment', authCheck, (req, res) => {
    let id = (is_numeric(req.body.id)) ?  parseInt(req.body.id, 10) : null ;
    console.log(req.body.comment);
    commentOnFigure(req.user, id, req.body.comment).then((result) => {
        res.status(200).send(result);
    });
});

router.delete('/comment', authCheck, (req, res) => {
    let commentId = (is_numeric(req.body.id)) ?  parseInt(req.body.id, 10) : null ;
    deleteComment(req.user, commentId).then((result) => {
        res.status(200).send(result);
    });
});

router.put('/comment', authCheck, (req, res) => {
    let commentId = (is_numeric(req.body.id)) ?  parseInt(req.body.id, 10) : null ;
    updateComment(req.user, commentId, req.body.comment).then((result) => {
        res.status(200).send(result);
    });
});

router.get('/search', (req, res) => {
    let keyword = req.query.keyword;
    let field = req.query.field;
    searchFigures(keyword, field).then((result) => {
        res.status(200).send(result);
    });
});


router.get('/price', (req, res) => {
    let lowerInput = checkLowerValid(req.query.lower);
    let upperInput = checkUpperValid(req.query.upper);

    searchByPrice(lowerInput, upperInput).then((result) => {
        res.status(200).send(result);
    });
});


router.get('/user/isauthorized', (req, res) => {
    let user = Object.assign({}, {id: req.user.id, name: undefined, username: req.user.username, thumbnail: req.user.thumbnail});
    res.send(user || { username: null});
});



module.exports = router;