const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()
console.log(process.env.OVERRIDE_PATH)
const envConfig = dotenv.parse(fs.readFileSync(process.env.OVERRIDE_PATH))
for (const k in envConfig) {
  process.env[k] = envConfig[k]
}
const express = require("express");
const bodyParser = require('body-parser')
const util = require('util');
const CronJob = require('cron').CronJob;
// Convert into Promise version of same
const exec = util.promisify(require('child_process').exec);
const readFile = util.promisify(require('fs').readFile);
const writeFile = util.promisify(require('fs').writeFile);

// Cron Job
const job = new CronJob(process.env.CRON_PATTERN, feedChecker, null, true, 'Asia/Jerusalem', null, true);

// Server
const app = express();
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Rest api
app
.get('/manual-feed', async (req, res) => {
  try {
    await feed()
    return res.status(200).json({success: true});
  } catch(error) {
    res.status(400).json({success: false, error})
  }
})
.get('/settings', async (req, res) => {
  try {
    const settings = await readConfigfile();
    delete settings.system;
    return res.status(200).json(settings);
  }catch(error) {
    res.status(400).json({success: false, error})
  }
})
.post('/settings', async (req, res) => {
  try {
    const availableKeys = ['petName','petPictureUrl','morningTime','feedTime','turnSeconds','numberOfFeedEveryDay','delayHoursBetweenFeeds'];
    const newConfig = {}
    availableKeys.forEach(v => {
      if (v in req.body && req.body[v]) newConfig[v] = req.body[v];
    })
    await setConfig(newConfig);
    const settings = await readConfigfile();
    delete settings.system;
    return res.status(200).json({success: true, settings});
  }catch(error) {
    res.status(400).json({success: false, error})
  }
})

.listen(process.env.SERVER_PORT, () => {
  console.log(`Server running on port ${process.env.SERVER_PORT}`);
 });

async function readConfigfile() {
  const rawData = await readFile(process.env.CONFIG_PATH, { flag: 'rs' });
  return JSON.parse(rawData);
}

async function setConfig(newConfig) {
  let config = await readConfigfile();
  config = {
    ...config,
    ...newConfig
  }
  return await writeFile(process.env.CONFIG_PATH, JSON.stringify(config));
}

function getTodayFeedTimeDate(feedTime) {
  const todayFeedTime = new Date()
  todayFeedTime.setDate(todayFeedTime.getDate())
  todayFeedTime.setHours(feedTime.split(':')[0])
  todayFeedTime.setHours(feedTime.split(':')[1])
  todayFeedTime.setMilliseconds(0)
  return todayFeedTime;
}
function getTodayStart(morningTime) {
  const todayStart = new Date()
  todayStart.setHours(morningTime.split(':')[0])
  todayStart.setMinutes(morningTime.split(':')[1])
  todayStart.setMilliseconds(0)
  return todayStart;
}

async function feedChecker() {
  console.log(`CRON: Check for feed... ${new Date()}`)
  try {
    const config = await readConfigfile();
    
    const todayStart = getTodayStart(config.morningTime)
    const todayFeedTime = getTodayFeedTimeDate(config.feedTime)
    const lastFeed = new Date(config.lastFeedTsList.slice(-1)[0])
    const now = new Date()

    // IF: 
    //   there isnt last feed
    //   OR
    //   last feed is before 00:00 of today AND now is equal or after feed time
    //   - feed
    // Else 
    //   - dont feed
    if ((config.lastFeedTsList.length && lastFeed.getTime() < todayStart.getTime() && todayFeedTime.getTime() < now.getTime()) 
      || config.lastFeedTsList.length === 0) {
        await feed()
      }
    console.log('CRON: Feed-check process is finished')
  } catch(error) {
    console.error(error)
  }
}

async function feed() {
  try {
    console.log('Feed...')
    const config = await readConfigfile();
    if (config.system.inFeedingProcess) throw 'Error: machine busy in feeding process'
    await setConfig({system: {inFeedingProcess: true}}) // <-- Lock
    // Feed
    const command = `sudo python ${process.env.RPI_SERVO_CONTROLLER_PATH} -d ${process.env.ROTATION_DIRECTION} -t ${config.turnSeconds}`
    console.log(command);
    const {stdout, stderr} = await exec(command, { shell: true })
    if (stderr) throw stderr;
    // Complete feed
    await setConfig({lastFeedTsList: [...config.lastFeedTsList, (new Date).getTime()]})
    console.log('feed completed.')
  } catch (error) {
    console.error(`Error: feed command failed. ${error}`)
    throw error
  } finally {
    await setConfig({system: {inFeedingProcess: false}}) // <-- Unlock
  }
}