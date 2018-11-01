const webdriver = require('selenium-webdriver');
const {Builder, By} = webdriver;

const sendmail = require('sendmail')(/* {silent: true} */);

const headlessChromeCapabilities = webdriver.Capabilities.chrome();
headlessChromeCapabilities.set('chromeOptions', {args: ['--headless']});

(async() => {
	while (true) {
		let isAppointmentAvailable = false;

		try {
			isAppointmentAvailable = await checkIsAppointmentAvailable();
		}
		catch (error) {
			console.error(error);
		}

		if(isAppointmentAvailable) {
			console.log('Sending email');
			await sendEmail();

			//await sleep(3 * 60 * 60 * 1000); // 3 hours

			await sleep(15 * 60 * 1000);
		}

		await sleep(5 * 60 * 1000); // 5 minutes
	}
})();

async function checkIsAppointmentAvailable() {
	let driver = new Builder()
		.forBrowser('chrome')
		.withCapabilities(headlessChromeCapabilities)
		.build();

	await driver.get('https://my.uscis.gov/en/appointment/new?appointment%5Binternational%5D=false');

	await driver.findElement(By.id('appointments_appointment_zip')).sendKeys('11201');
	await driver.findElement(By.id('field_office_query')).click();
	await driver.sleep(2 * 1000);

	// OVERRIDING CODE HERE BECAUSE IT DOESNT WORK
	// await driver.findElement(By.id('create-appointment')).click();

	// Jack: click NYC button
	await driver.findElement(By.id('NYC')).click();
	// Jack: click create appointment button for NYC
	await driver.findElement(By.xpath("//input[contains(@title, 'New York City')]")).click();

	// hehe
	console.log('Check');
	console.log('Test Send');
	sendEmail();

	let text = await driver.findElement(By.className('appointment-time-slots')).getText();
	console.log(`${new Date()}: ${text}`);
	let isAvailable = !text.includes('there are no available appointments.');

	await driver.quit();

	return isAvailable;
}

async function sendEmail() {
	return new Promise((resolve, reject) => {
		sendmail({
				from: 'jchong2838@gmail.com',
				//to: 'lyang0322@gmail.com, jchong2838@gmail.com',
				to: 'jchong2838@gmail.com',
				subject: 'Test InfoPass Appointment Available',
				text: 'https://my.uscis.gov/en/appointment/new?appointment%5Binternational%5D=false'
			}, function(err, reply) {
				if(err) {
					console.log('THERE WAS AN ERROR SENDING THE EMAIL');
					console.log(err && err.stack);
					reject();
				}
				else {
					console.dir(reply);
					resolve();
				}
			}
		);
	});
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
