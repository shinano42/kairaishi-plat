const Client  = require('pg').Client;
const router = require('express').Router();
    


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

async function getMakerByYear(maker, year){
    let result = {};
    const client = new Client({
        user: 'developer',
        host: '127.0.0.1',
        database: 'kairaishi_test',
        password: 'root',
        port: 5432,
      })
    client.connect();
    let figures = await client.query(`SELECT id, name, price, scale, size, model_sculptor, hash, coloring, specification, copyright, material, "desc", maker_id, anime, "character", released_at, thumbnail, remake_records
            FROM public.figure
            WHERE (maker_id = ${maker} AND EXTRACT(year FROM released_at) = ${year} )
            ORDER BY released_at DESC;`);
    let years = await client.query(`SELECT DISTINCT EXTRACT( year from released_at) AS released_year
            FROM public.figure
            WHERE maker_id = ${maker}
            ORDER BY released_year DESC;`).then(years => {
                return years.rows.map((obj)=> obj.released_year);
              });
    result.figures = figures;
    result.years = years;
    client.end();
    return result;
}

const authCheck = (req, res, next) => {
    if (!req.user) {
        // if user is not logged in
        let year = (is_numeric(req.params.maker)) ?  parseInt(x, 10) : new Date().getFullYear() ;
        let maker = toMakerId(req.params.maker.toLowerCase());
        getMakerByYear(maker, year).then(results => {
            // process results here
            res.render('maker', { user: req.user, figures: results.figures.rows, years: results.years, year: year, makerName: req.params.maker});
        }).catch(err => {
            // process error here
            console.log(err);
        });;

        
    } else {
        // if logged in
        next();
    }
};



router.get('/:maker', authCheck, (req, res) => {
    let year = (is_numeric(req.params.maker)) ?  parseInt(x, 10) : new Date().getFullYear() ;
        let maker = toMakerId(req.params.maker.toLowerCase());
        getMakerByYear(maker, year).then(results => {
            // process results here
            res.render('maker', { user: req.user, figures: results.figures.rows, years: results.years, year: year, makerName: req.params.maker});
        }).catch(err => {
            // process error here
            console.log(err);
        });;
});

module.exports = router;

  