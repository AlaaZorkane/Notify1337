let config = require('./config.json');
let axios = require('axios');
let cheerio = require('cheerio');
let https = require('https');

// .emphasis-title --> h2

console.log(
  "- 1337.ma SCRAPPER -\n",
  "[+] Getting page..."
)
const instance = axios.create({
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false
  })
});
instance.get('https://1337.ma/');

// At request level
const agent = new https.Agent({  
  rejectUnauthorized: false
});

const getPageData = () => {
  axios.get('https://1337.ma/', { httpsAgent: agent })
  .then((response) => {
    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);
      test = $('div .container > div .emphasis-title > h2')
      return test.text()
    }
  }, (err) => console.log(err));
}


console.log( getPageData() );