function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

function sleep(n) {
  msleep(n * 1000);
}

// config
const config = require('./config.json');
const authToken = config.authToken
const accountSid = config.accountSid
const twilioNumber = config.twilioNumber
const phone = config.phone
const email = config.email
const password = config.password
const screensPath = config.path // ./output/

// libs
const looksSame = require('looks-same');
const twilio = require('twilio');
const puppeteer = require('puppeteer');
const client = require('twilio')(accountSid, authToken);





// vars
var isDifferent = false;
var canSleep = false;
var firstCheck = false;

// functions
function checker(image, compare, isFinal){
  var isEqual = true;
  console.log("Checking...")
  looksSame(image, compare, (error,equal) => {
    if(error) console.log(err);
    isEqual = equal.equal;
  })
  if(isEqual === false){
    console.log("Difference found!")
    if(isFinal === false){
      firstCheck = true;
    } else {
      isDifferent = true;
    }
  }
}

function call() {
  console.log("Calling...")
  client.calls
    .create({
      url: 'http://demo.twilio.com/docs/voice.xml',
      to: phone,
      from: twilioNumber
    }).then((err, call) => {
      if (err) console.log(err);
      else console.log("Calling...")
    })
  process.exit()
  sleep(10);
}




// .emphasis-title --> h2

console.log("- Notify1337 -");

(async () => {
  //init browser
  console.log("[+] Initializing");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const override = Object.assign(page.viewport(), {
    width: 1366,
    height: 700
  });
  await page.setViewport(override);

  //define takeScreen function

  //loading page
  await page.goto('https://github.com/AlaaZorkane/', {
    waitUntil: 'load'
  });
  console.log("[+] Page loaded", page.url());

  //logging in
  console.log("[+] Logging in using", email);
  /*await page.type('#user_email', email);
  await page.type('#user_password', password);*/

  /*await page.click('div.button_Container button.MainButton');
  await page.click('a button.btn');*/
  sleep(6)
  console.log("[+] Logged in successfully :)");

  // Process
  console.log("[+] Listening for changes...");


  await page.screenshot({
    path: "./output/original.png",
    fullPage: false
  });

  while (!isDifferent) {
    if (canSleep) sleep(5);

    console.log("Reloading...")

    await page.reload({
      waitUntil: 'load'
    });
    await page.screenshot({
      path: "./output/ToCompare.png",
      fullPage: false
    });

    checker("./output/original.png", "./output/ToCompare.png", false)
    sleep(5)
    if (firstCheck) {
      console.log("First Check triggered!")
      sleep(5)
      await page.reload({
        waitUntil: 'load'
      });
      await page.screenshot({
        path: "./output/Validation.png",
        fullPage: false
      });
      console.log("Initiating second check...")
      checker("./output/original.png", "./output/Validation.png", true)
      if (isDifferent) {
        console.log("Calling function...")
        call()
      } else {
        firstCheck = false;
        isDifferent = false;
      }
    }

  }

  console.log('"So, when the time comes...the boy must die?"')
  await browser.close();

})();