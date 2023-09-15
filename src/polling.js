const { InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const API = require('./api')

module.exports = {
	/**
	 * Inits the polling logic
	 */
	initPolling() {
		let self = this;

		// Cleanup old interval
		if (self.pollTimer) {
			clearInterval(self.pollTimer);
		}

		clearInterval(self.pollTimerOnlineStatus); //this one just runs every 5 minutes to see if the camera has come back online after being unplugged without having to restart the module instance

		// Setup polling if enabled
		if (self.pollTimer === undefined && self.config.poll_interval > 0) {
			self.pollTimer = setInterval(() => {
				self.getCameraInformation.bind(self)()
			}, self.config.poll_interval)
		}

		// Setup online status polling
		self.pollTimerOnlineStatus = setInterval(() => {
			self.getCameraInformation.bind(self)()
		}, 300000) //every 5 minutes
	},

	stopPolling() {
		let self = this;
		//self.log('error', 'Stopping Polling due to Server error.');
	
		clearInterval(self.pollTimer);
		delete self.pollTimer
	},

	async getCameraInformation() {
		let self = this;

		const connection = new API(self.config);

		const cmd = 'info.cgi'
	
		const result = await connection.sendRequest(cmd);

		//do something with data
		try {
			if (result && result.response && result.response.data) {
				let data = result.response.data;
				
				try {
					var str_raw = String(data)
					var str = {}

					self.data.info = [];

					str_raw = str_raw.split('\n') // Split Data in order to remove data before and after command

					for (var i in str_raw) {
						str = str_raw[i].trim() // remove new line, carriage return and so on.
						str = str.split('=') // Split Commands and data
						if ((str_raw[i].indexOf('p.') === -1) && (str_raw[i].indexOf('t.') === -1)) {
							
							if (self.config.verbose == true) {
								self.log('debug', 'Received CMD: ' + String(str_raw[i]))
							}
						}
						// Store Data
						str[0] = str[0].replace(':','');
						self.storeData(str)
					}

					self.updateStatus(InstanceStatus.Ok)

					self.checkVariables()
					self.checkFeedbacks()
				}
				catch(error) {
					if (self.config.verbose) {
						self.log('error', `Error Getting Data: ${error}`);
					}
					self.updateStatus(InstanceStatus.Error)
				}
			}
			else {
				if (!self.errorCount) {
					if (self.config.verbose) {
						self.log('error', `Error Getting Data: No response received from server. Is the Camera Online?`);
					}
					self.updateStatus(InstanceStatus.ConnectionFailure)
				}
				
				// Cleanup polling
				if (self.config.continuePolling !== true) {
					self.stopPolling()
				}
				
				self.errorCount++;
			}	
		}
		catch(error) {
			if (self.config.verbose) {
				self.log('error', `Error Getting Data: ${error}`);
			}
			self.updateStatus(InstanceStatus.Error)
			// Cleanup polling
			if (self.config.continuePolling !== true) {
				self.stopPolling()
			}
		}
	},

	storeData(str) {
		let self = this;

		self.data.info.push(str);
	
		try {
			// Store Values from Events
			switch (str[0]) {
				//Detect camera type and reinitialize the module based on the detected model
				case 'c.1.type':
					self.data.modelDetected = str[1];
					if (self.data.model !== self.data.modelDetected) {
						self.log('info', 'New model detected, reloading module: ' + self.data.modelDetected);
						self.initActions()
						self.initFeedbacks()
						self.initVariables()
						self.initPresets()
	
						self.checkVariables()
						self.checkFeedbacks()
					}
					break;
				//System
				case 'c.1.name.utf8':
					self.data.cameraName = str[1];
					break;
				case 'f.standby':
					self.data.powerState = str[1];
					break;
				case 'f.tally':
					self.data.tallyState = str[1];
					break;
				case 'f.tally.mode':
					if (str[1] === 'preview') {
						self.data.tallyPreview = self.data.tallyState;
					}
					else {
						self.data.tallyProgram = self.data.tallyState;
					}
					break;
				case 'c.1.zoom.mode':
					self.data.digitalZoom = str[1];
					break;
				case 'c.1.zoom':
					self.data.zoomValue = str[1];
					break;
				case 'c.1.is':
					self.data.imageStabilization = str[1];
					break;
				case 's.firmware':
					self.data.firmwareVersion = str[1];
					break;
				case 's.protocol':
					self.data.protocolVersion = str[1];
					break;
				//Zoom/Focus
				case 'c.1.focus.speed':
					self.data.focusSpeed = str[1];
					break;
				case 'c.1.focus.value':
					self.data.focusValue = str[1];
					break;
				case 'c.1.focus':
					self.data.autoFocusMode = str[1];
					break;
				//Pan/Tilt
				//Exposure
				case 'c.1.shooting':
					self.data.exposureShootingMode = str[1];
					break;
				case 'c.1.shooting.list':
					if (self.data.exposureShootingModeListString !== str[1]) { //only rebuild the actions if the list has changed
						self.data.exposureShootingModeListString = str[1];
						self.log('info', 'New Exposure Shooting Modes detected, reloading module: ' + self.data.exposureShootingModeListString);
						self.data.exposureShootingModeList = str[1].split(',');
						self.initActions()
						self.initPresets()
					}
					break;
				case 'c.1.exp':
					self.data.exposureMode = str[1];
					break;
				case 'c.1.exp.list':
					if (self.data.exposureModeListString !== str[1]) { //only rebuild the actions if the list has changed
						self.data.exposureModeListString = str[1];
						self.log('info', 'New Exposure Modes detected, reloading module: ' + self.data.exposureModeListString);
						self.data.exposureModeList = str[1].split(',');
						self.initActions()
						self.initPresets()
					}
					break;
				case 'c.1.ae.gainlimit.max':
					self.data.aeGainLimitMax = parseInt(str[1]);
					self.initActions()
					self.initPresets()
					break;
				case 'c.1.ae.gainlimit.max.min':
					self.data.aeGainLimitMaxMin = parseInt(str[1]);
					self.initActions()
					self.initPresets()
					break;
				case 'c.1.ae.gainlimit.max':
					self.data.aeGainLimitMaxMax = parseInt(str[1]);
					self.initActions()
					self.initPresets()
					break;
				case 'c.1.ae.brightness':
					self.data.aeBrightness = str[1];
					break;
				case 'c.1.ae.brightness.list':
					if (self.data.aeBrightnessListString !== str[1]) { //only rebuild the actions if the list has changed
						self.data.aeBrightnessListString = str[1];
						self.log('info', 'New AE Brightness List detected, reloading module: ' + self.data.aeBrightnessListString);
						self.data.aeBrightnessList = str[1].split(',');
						self.initActions()
						self.initPresets()
					}
					break;
				case 'c.1.ae.photometry':
					self.data.aePhotometry = str[1];
					break;
				case 'c.1.ae.photometry.list':
					if (self.data.aePhotometryListString !== str[1]) { //only rebuild the actions if the list has changed
						self.data.aePhotometryListString = str[1];
						self.log('info', 'New AE Photometry List detected, reloading module: ' + self.data.aePhotometryListString);
						self.data.aePhotometryList = str[1].split(',');
						self.initActions()
						self.initPresets()
					}
					break;
				case 'c.1.ae.flickerreduct':
					self.data.aeFlickerReduct = str[1];
					break;
				case 'c.1.ae.flickerreductlist':
					if (self.data.aeFlickerReductListString !== str[1]) { //only rebuild the actions if the list has changed
						self.data.aeFlickerReductListString = str[1];
						self.log('info', 'New AE Flicker Reduct List detected, reloading module: ' + self.data.aeFlickerReductListString);
						self.data.aeFlickerReductList = str[1].split(',');
						self.initActions()
						self.initPresets()
					}
					break;
				case 'c.1.ae.resp':
					self.data.aeResp = parseInt(str[1]);
					break;
				case 'c.1.ae.resp.min':
					self.data.aeRespMin = parseInt(str[1]);
					self.initActions()
					self.initPresets()
					break;
				case 'c.1.ae.resp.max':
					self.data.aeRespMax = parseInt(str[1]);
					self.initActions()
					self.initPresets()
					break;
				case 'c.1.me.shutter.mode':
					self.data.shutterMode = str[1];
					break;
				case 'c.1.me.shutter':
					self.data.shutterValue = str[1];
					break;
				case 'c.1.me.shutter.list':
					if (self.data.shutterListString !== str[1]) { //only rebuild the actions if the list has changed
						self.data.shutterListString = str[1];
						self.log('info', 'New Shutter Modes detected, reloading module: ' + self.data.shutterListString);
						self.data.shutterList = str[1].split(',');
						self.initActions()
						self.initPresets()
					}
					break;
				case 'c.1.me.diaphragm.mode':
					self.data.irisMode = str[1];
					break;
				case 'c.1.me.diaphragm':
					self.data.irisValue = str[1];
					break;
				case 'c.1.me.diaphragm.list':
					if (self.data.irisListString !== str[1]) { //only rebuild the actions if the list has changed
						self.data.irisListString = str[1];
						self.log('info', 'New Iris Modes detected, reloading module: ' + self.data.irisListString);
						self.data.irisList = str[1].split(',');
						self.initActions()
						self.initPresets()
					}
					break;
				case 'c.1.me.gain.mode':
					self.data.gainMode = str[1];
					break;
				case 'c.1.me.gain':
					self.data.gainValue = str[1];
					break;
				case 'c.1.nd.filter':
					self.data.ndfilterValue = str[1];
					break;
				case 'c.1.blacklevel':
					self.data.pedestalValue = str[1];
					break;
				//White Balance
				case 'c.1.wb':
					self.data.whitebalanceMode = str[1];
					break;
				case 'c.1.wb.list':
					if (self.data.whitebalanceModeListString !== str[1]) { //only rebuild the actions if the list has changed
						self.data.whitebalanceModeListString = str[1];
						self.log('info', 'New White Balance Modes detected, reloading module: ' + self.data.whitebalanceModeListString);
						self.data.whitebalanceModeList = str[1].split(',');
						self.initActions()
						self.initPresets()
					}
					break;
				case 'c.1.wb.kelvin':
					self.data.kelvinValue = str[1];
					break;
				case 'c.1.wb.kelvin.list':
					if (self.data.kelvinListString !== str[1]) { //only rebuild the actions if the list has changed
						self.data.kelvinListString = str[1];
						self.log('info', 'New Kelvin Modes detected, reloading module: ' + self.data.kelvinListString);
						self.data.kelvinList = str[1].split(',');
						self.initActions()
						self.initPresets()
					}
					break;
				case 'c.1.wb.shift.rgain':
					self.data.rGainValue = str[1];
					break;
				case 'c.1.wb.shift.bgain':
					self.data.bGainValue = str[1];
					break;
				case 'p':
					self.data.presetLastUsed = parseInt(str[1]);
					self.checkVariables()
					self.checkFeedbacks()
					break;
				case 'p.count':
					let presetCount = parseInt(str[1]) || 100;
					for (let i = 1; i <= presetCount; i++) {
						if (str[0] === ('p.' + i + '.name.utf8')) {
							self.data['presetname' + i] = str[1];
							if ((self.data['presetname' + i] === '') || (self.data['presetname' + i] === ('preset' + i))) {
								self.data['presetname' + i] = i;
							}
						}
					}
					break;
				default:
					break;
			}
			
		}
		catch(error) {
			self.log('error', 'Error parsing response from PTZ: ' + String(error))
			console.log(error);
		}
	},

	getCameraInformation_Delayed() {
		let self = this;

		setTimeout(self.getCameraInformation.bind(self), 500);
	}
}