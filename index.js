import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  password: "pnsql",
  database: "world",
  port: 5432
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function getCountries(){
  const result = await db.query('select country_code from visited_countries');
  const countries = [];

  result.rows.forEach((country)=>{
    countries.push(country.country_code);
  })

  console.log(countries);
  return countries;
}

app.get("/", async (req, res) => {

  const countries = await getCountries();
  res.render('index.ejs', {countries:countries, total: countries.length});
});

app.post('/add', async(req,res)=>{
  const newCountry = req.body.country;
  try{
    const newCodeResult = await db.query(`select country_code from countries where lower(country_name) like '%' || $1 || '%';`, [newCountry.toLowerCase()]);
    const newCode = newCodeResult.rows[0].country_code;
    try{
        console.log(newCode);
        await db.query(`insert into visited_countries(country_code) values('${newCode}');`);
        res.redirect('/'); 
    }
    catch(err){
      console.log(err);

      const countries = await getCountries();
      res.render('index.ejs', {countries:countries, total: countries.length, error:'You have already added this country, try again..'})
    }
  }catch(err){
    console.log(err);
    const countries = await getCountries();
    res.render('index.ejs', {countries:countries, total: countries.length, error:'Entered country does not exist,please check the spelling and try again..'})
  }
  
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
