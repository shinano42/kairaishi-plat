const router = require('express').Router();
const Client  = require('pg').Client;


const authCheck = (req, res, next) => {
    if (!req.user) {
        // if user is not logged in
        res.redirect('/auth/login');
    } else {
        // if logged in
        next();
    }
};

const is_numeric = (str) => {
    return /^\d+$/.test(str);
};

async function getFigure(id, hash) {
    const client = new Client({
        user: 'developer',
        host: '127.0.0.1',
        database: 'kairaishi_test',
        password: 'root',
        port: 5432,
      });
    client.connect();
    let figure = await client.query(`SELECT  public.figure.id, public.figure.name, price, scale, size, model_sculptor, hash, coloring, specification, copyright, material, "desc", public.manufacturer.name AS maker, maker_id, anime, "character", released_at, thumbnail, remake_records
            FROM public.figure
            INNER JOIN public.manufacturer
            ON public.manufacturer.id = public.figure.maker_id
            WHERE hash='${hash}' AND public.figure.id=${id};`);
    if (figure.rowCount !== 0) {
        let images = await client.query(`SELECT id, figure_id, url
                FROM public.image
                WHERE figure_id = ${id};`).catch(error => console.log(error));
        let pLinks = await client.query(`SELECT id, figure_id, name, "desc", url
                FROM public.purchase_link
                WHERE figure_id = ${id};`).catch(error => console.log(error));
        client.end();
        return {figure: figure.rows[0], images: images.rows, purchaseLinks: pLinks.rows};
    } else {
        return [];
    }
    
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


async function getImages(fid) {
    const client = new Client({
        user: 'developer',
        host: '127.0.0.1',
        database: 'kairaishi_test',
        password: 'root',
        port: 5432,
      });
    client.connect();
    let result = await client.query(`SELECT id, figure_id, url
        FROM public.image
        WHERE figure_id = ${fid};`).catch(error => console.log(error));
    client.end();
    if (result === undefined) {
        return {success: false};
    } else {
        return {success: true, result: result.rows, count: result.rowCount};
    }
}

router.get('/:hash/:id',  (req, res) => {
    // check mobile device
    let id = (is_numeric(req.params.id)) ?  parseInt(req.params.id, 10) : null ;
    if (is_numeric(req.params.id)) {
        try {
            getFigure(id, req.params.hash).then((data) =>{
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
                let released_at = new Date(data.figure.released_at);
                let month = released_at.getMonth();
                console.log(data);
                let monthClass = map[month].toLowerCase();
                let fields = ['name', 'anime', 'maker', 'scale', 'size', 'price', 'released_at', 'specification', 'material', 'model_sculptor', 'coloring'];
                
                res.render('figure', { user: req.user, figure: data.figure, color: monthClass, imgs: data.images, pLinks: data.purchaseLinks, fields: fields});
            }).catch((err) =>{
                console.error(err);
            });
        } catch (error) {
            console.error(error);
        }
        
    } else {
        getFigureByHash(req.params.hash).then((figure) =>{
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
            let released_at = new Date(figure.released_at);
            let month = released_at.getMonth();
            let monthClass = map[month].toLowerCase();
            res.render('figure', { user: req.user, figure: figure, color: monthClass});
        });
    }
});

module.exports = router;