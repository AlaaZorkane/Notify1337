const sleep = async (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

let config = require('./config.json');
let https = require('https');
let looksSame = require('looks-same');
const puppeteer = require('puppeteer');

// config

let apiKey = config.apiKey
let email = config.email
let password = config.password
let phone = config.phone
let screensPath = config.path // ./output/

var isDifferent = false;


// .emphasis-title --> h2

console.log("- Notify1337 -");

(async () => {
  //init browser
  console.log("[+] Initializing");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const override = Object.assign(page.viewport(), {
    width: 1366,
    height: 1000
  });
  await page.setViewport(override);

  //loading page
  await page.goto('https://candidature.1337.ma/users/sign_in', {
    waitUntil: 'load'
  });
  console.log("[+] Page loaded", page.url());

  //logging in
  console.log("[+] Logging in using", email);
  await page.type('#user_email', email);
  await page.type('#user_password', password);
  await page.click('.form-actions .btn');
  await page.waitForNavigation();
  console.log("[+] Logged in successfully :)");

  // Process
  console.log("[+] Listening for changes...");



  while (!isDifferent) {
    await page.screenshot({
      path: `${screensPath}screen1.png`,
      fullPage: true
    });

    // SLEEP HERE FOR 1 MIN
    //cron ain't for sleeps, its for calling something every x time with a delay won't work here u just gotta use that stupid sleep thing
    
    // hmm hmmmmm, I need a sleep, I cant see where I can use that f this type of algorithm
    // Wanna sleep everything that comes after this right ?
    
    
    await sleep(10000)

    await page.reload({
      waitUntil: 'load'
    });

    await page.screenshot({
      path: `${screensPath}screen2.png`,
      fullPage: true
    });
    looksSame(`${screensPath}screen1.png`, `${screensPath}screen2.png`, async (error, equal) => {
      if (equal) {
        console.log("[-] No differences - 1min for next retry...")
      } else {
        console.log("[+] Difference found, launching validation function... (1min)");
        await sleep(10000);
        await page.screenshot({
          path: `${screensPath}screenValidation.png`,
          fullPage: true
        });
        validate(`${screensPath}screen1.png`, `${screensPath}screenValidation.png`);
      }
    });
  }

  console.log('"So, when the time comes...the boy must die?"')
  await browser.close();
})();

function validate(screen1,screen2){
  looksSame(screen1,screen2, (error,equal) => {
    if(equal){
      console.log("[-] False alarm, retrying...")
    } else {
      isDifferent = !isDifferent;
      console.log("[+] Launching fire function...")
      fire();
    }
  })
}

function fire(){
  for(i=0; i<3; i++) console.log("PHONE CALL")
}