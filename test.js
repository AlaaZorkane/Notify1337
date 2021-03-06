function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

function sleep(n) {
  msleep(n * 1000);
}

function runScript(scriptPath, callback) {

  // keep track of whether callback has been invoked to prevent multiple invocations
  var invoked = false;

  var process = childProcess.fork(scriptPath);

  // listen for errors as they may prevent the exit event from firing
  process.on('error', function (err) {
    if (invoked) return;
    invoked = true;
    callback(err);
  });

  // execute the callback once the process has finished running
  process.on('exit', function (code) {
    if (invoked) return;
    invoked = true;
    var err = code === 0 ? null : new Error('exit code ' + code);
    callback(err);
  });

}


const config = require('./config.json');
const looksSame = require('looks-same');
const twilio = require('twilio');
const childProcess = require('child_process');
const puppeteer = require('puppeteer');

// config

const authToken = config.authToken
const accountSid = config.accountSid
const twilioNumber = config.twilioNumber
const phone = config.phone

const email = config.email
const password = config.password

const screensPath = config.path // ./output/

const client = require('twilio')(accountSid, authToken);

function call() {
  console.log("call function launched..")
  client.calls
    .create({
      url: 'http://demo.twilio.com/docs/voice.xml',
      to: phone,
      from: twilioNumber
    }).then((err, call) => {
      if (err) console.log(err);
      else console.log("Calling...")
    })
}

var isDifferent = false;
var canSleep = false;


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

    await page.reload({
      waitUntil: 'load'
    });
    await page.screenshot({
      path: "./output/ToCompare.png",
      fullPage: false
    });

    looksSame("./output/original.png", "./output/ToCompare.png", async (error, equal) => {
      if (equal.equal) {
        console.log(`[-] No differences - 1min for next retry...[${equal.equal}]`)
        if (!canSleep) canSleep = true;
      } else {
        console.log("[+] Difference found, launching validation function... (3min)");
        sleep(5)

        await page.reload({
          waitUntil: 'load'
        });
        await page.screenshot({
          path: `${screensPath}screenValidation.png`,
          fullPage: false
        });
        looksSame(`${screensPath}original.png`, `${screensPath}screenValidation.png`, (error, equal) => {
          if (equal.equal) {
            console.log("[-] False alarm, retrying...")
          } else {
            isDifferent = !isDifferent;

            // CALL
            console.log("[!] Calling...")
          }
        })
      }
    });
  }
  await call()
  console.log('"So, when the time comes...the boy must die?"')
  await browser.close();

})();