const API = require('./api')

module.exports = {
	/**
	 * Inits the polling logic
	 */
	initPolling() {
		// Cleanup old interval
		if (this.pollingInterval) {
			clearInterval(this.pollingInterval)
		}

		// Setup polling if enabled
		if (this.pollTimer === undefined && this.config.poll_interval > 0) {
			this.pollTimer = setInterval(() => {
				this.getCameraInformation.bind(this)()
			}, this.config.poll_interval)
		}
	},

	stopPolling() {
		//this.log('error', 'Stopping Polling due to Server error.');
	
		clearInterval(this.pollTimer);
		delete this.pollTimer
	},

	async getCameraInformation() {
		const connection = new API(this.config);

		const cmd = 'info.cgi'
	
		const result = await connection.sendRequest(cmd);

		//do something with xml
		try {
			if (result && result.response && result.response.body) {
				let readable = result.response.body;
				const chunks = [];
			
				readable.on('readable', () => {
					let chunk;
					while (null !== (chunk = readable.read())) {
						chunks.push(chunk);
					}
				});
			
				readable.on('end', () => {
					const data = chunks.join('');
					try {
						var str_raw = String(result.data)
						var str = {}
	
						this.data.info = [];
	
						str_raw = str_raw.split('\n') // Split Data in order to remove data before and after command
	
						for (var i in str_raw) {
							str = str_raw[i].trim() // remove new line, carriage return and so on.
							str = str.split('=') // Split Commands and data
							if ((str_raw[i].indexOf('p.') === -1) && (str_raw[i].indexOf('t.') === -1)) {
								
								if (this.config.debug == true) {
									this.log('info', 'Received CMD: ' + String(str_raw[i]))
								}
							}
							// Store Data
							str[0] = str[0].replace(':','');
							this.storeData(str)
						}
	
						this.updateStatus('ok')

						this.checkVariables()
						this.checkFeedbacks()
					}
					catch(error) {
						if (this.config.verbose) {
							this.log('error', `Error Getting Data: ${error}`);
						}
						this.updateStatus('error')
					}
				});
			}
			else {
				if (!this.errorCount) {
					if (this.config.verbose) {
						this.log('error', `Error Getting Data: No response received from server. Is the Camera Online?`);
					}
					this.updateStatus('error')
				}
				
				// Cleanup polling
				this.stopPolling()
	
				this.errorCount++;
			}	
		}
		catch(error) {
			if (this.config.verbose) {
				this.log('error', `Error Getting Data: ${error}`);
			}
			this.updateStatus('error')
			// Cleanup polling
			this.stopPolling()
		}
	},

	storeData(str) {
		this.data.info.push(str);
	
		try {
			// Store Values from Events
			switch (str[0]) {
				//Detect camera type and reinitialize the module based on the detected model
				case 'c.1.type':
					this.data.modelDetected = str[1];
					if (this.data.model !== this.data.modelDetected) {
						this.log('info', 'New model detected, reloading module: ' + this.data.modelDetected);
						this.initActions()
						this.initFeedbacks()
						this.initVariables()
						this.initPresets()
	
						this.checkVariables()
						this.checkFeedbacks()
					}
					break;
				//System
				case 'c.1.name.utf8':
					this.data.cameraName = str[1];
					break;
				case 'f.standby':
					this.data.powerState = str[1];
					break;
				case 'f.tally':
					this.data.tallyState = str[1];
					break;
				case 'f.tally.mode':
					if (str[1] === 'preview') {
						this.data.tallyPreview = this.data.tallyState;
					}
					else {
						this.data.tallyProgram = this.data.tallyState;
					}
					break;
				case 'c.1.zoom.mode':
					this.data.digitalZoom = str[1];
					break;
				case 'c.1.zoom':
					this.data.zoomValue = str[1]; //XF605 zoom value
					break;
				case 'c.1.is':
					this.data.imageStabilization = str[1];
					break;
				case 's.firmware':
					this.data.firmwareVersion = str[1];
					break;
				case 's.protocol':
					this.data.protocolVersion = str[1];
					break;
				//Zoom/Focus
				case 'c.1.focus.speed':
					this.data.focusSpeed = str[1];
					break;
				case 'c.1.focus.value':
					this.data.focusValue = str[1];
					break;
				case 'c.1.focus':
					this.data.autoFocusMode = str[1];
					break;
				//Pan/Tilt
				//Exposure
				case 'c.1.shooting':
					this.data.exposureShootingMode = str[1];
					break;
				case 'c.1.shooting.list':
					if (this.data.exposureShootingModeListString !== str[1]) { //only rebuild the actions if the list has changed
						this.data.exposureShootingModeListString = str[1];
						this.log('info', 'New Exposure Shooting Modes detected, reloading module: ' + this.data.exposureShootingModeListString);
						this.data.exposureShootingModeList = str[1].split(',');
						this.initActions()
						this.initPresets()
					}
					break;
				case 'c.1.exp':
					this.data.exposureMode = str[1];
					break;
				case 'c.1.exp.list':
					if (this.data.exposureModeListString !== str[1]) { //only rebuild the actions if the list has changed
						this.data.exposureModeListString = str[1];
						this.log('info', 'New Exposure Modes detected, reloading module: ' + this.data.exposureModeListString);
						this.data.exposureModeList = str[1].split(',');
						this.initActions()
						this.initPresets()
					}
					break;
				case 'c.1.ae.gainlimit.max':
					this.data.aeGainLimitMax = parseInt(str[1]);
					this.initActions()
					this.initPresets()
					break;
				case 'c.1.ae.gainlimit.max.min':
					this.data.aeGainLimitMaxMin = parseInt(str[1]);
					this.initActions()
					this.initPresets()
					break;
				case 'c.1.ae.gainlimit.max':
					this.data.aeGainLimitMaxMax = parseInt(str[1]);
					this.initActions()
					this.initPresets()
					break;
				case 'c.1.ae.brightness':
					this.data.aeBrightness = str[1];
					break;
				case 'c.1.ae.brightness.list':
					if (this.data.aeBrightnessListString !== str[1]) { //only rebuild the actions if the list has changed
						this.data.aeBrightnessListString = str[1];
						this.log('info', 'New AE Brightness List detected, reloading module: ' + this.data.aeBrightnessListString);
						this.data.aeBrightnessList = str[1].split(',');
						this.initActions()
						this.initPresets()
					}
					break;
				case 'c.1.ae.photometry':
					this.data.aePhotometry = str[1];
					break;
				case 'c.1.ae.photometry.list':
					if (this.data.aePhotometryListString !== str[1]) { //only rebuild the actions if the list has changed
						this.data.aePhotometryListString = str[1];
						this.log('info', 'New AE Photometry List detected, reloading module: ' + this.data.aePhotometryListString);
						this.data.aePhotometryList = str[1].split(',');
						this.initActions()
						this.initPresets()
					}
					break;
				case 'c.1.ae.flickerreduct':
					this.data.aeFlickerReduct = str[1];
					break;
				case 'c.1.ae.flickerreductlist':
					if (this.data.aeFlickerReductListString !== str[1]) { //only rebuild the actions if the list has changed
						this.data.aeFlickerReductListString = str[1];
						this.log('info', 'New AE Flicker Reduct List detected, reloading module: ' + this.data.aeFlickerReductListString);
						this.data.aeFlickerReductList = str[1].split(',');
						this.initActions()
						this.initPresets()
					}
					break;
				case 'c.1.ae.resp':
					this.data.aeResp = parseInt(str[1]);
					break;
				case 'c.1.ae.resp.min':
					this.data.aeRespMin = parseInt(str[1]);
					this.initActions()
					this.initPresets()
					break;
				case 'c.1.ae.resp.max':
					this.data.aeRespMax = parseInt(str[1]);
					this.initActions()
					this.initPresets()
					break;
				case 'c.1.me.shutter.mode':
					this.data.shutterMode = str[1];
					break;
				case 'c.1.me.shutter':
					this.data.shutterValue = str[1];
					break;
				case 'c.1.me.shutter.list':
					if (this.data.shutterListString !== str[1]) { //only rebuild the actions if the list has changed
						this.data.shutterListString = str[1];
						this.log('info', 'New Shutter Modes detected, reloading module: ' + this.data.shutterListString);
						this.data.shutterList = str[1].split(',');
						this.initActions()
						this.initPresets()
					}
					break;
				case 'c.1.me.diaphragm.mode':
					this.data.irisMode = str[1];
					break;
				case 'c.1.me.diaphragm':
					this.data.irisValue = str[1];
					break;
				case 'c.1.me.diaphragm.list':
					if (this.data.irisListString !== str[1]) { //only rebuild the actions if the list has changed
						this.data.irisListString = str[1];
						this.log('info', 'New Iris Modes detected, reloading module: ' + this.data.irisListString);
						this.data.irisList = str[1].split(',');
						this.initActions()
						this.initPresets()
					}
					break;
				case 'c.1.me.gain.mode':
					this.data.gainMode = str[1];
					break;
				case 'c.1.me.gain':
					this.data.gainValue = str[1];
					break;
				case 'c.1.nd.filter':
					this.data.ndfilterValue = str[1];
					break;
				case 'c.1.blacklevel':
					this.data.pedestalValue = str[1];
					break;
				//White Balance
				case 'c.1.wb':
					this.data.whitebalanceMode = str[1];
					break;
				case 'c.1.wb.list':
					if (this.data.whitebalanceModeListString !== str[1]) { //only rebuild the actions if the list has changed
						this.data.whitebalanceModeListString = str[1];
						this.log('info', 'New White Balance Modes detected, reloading module: ' + this.data.whitebalanceModeListString);
						this.data.whitebalanceModeList = str[1].split(',');
						this.initActions()
						this.initPresets()
					}
					break;
				case 'c.1.wb.kelvin':
					this.data.kelvinValue = str[1];
					break;
				case 'c.1.wb.kelvin.list':
					if (this.data.kelvinListString !== str[1]) { //only rebuild the actions if the list has changed
						this.data.kelvinListString = str[1];
						this.log('info', 'New Kelvin Modes detected, reloading module: ' + this.data.kelvinListString);
						this.data.kelvinList = str[1].split(',');
						this.initActions()
						this.initPresets()
					}
					break;
				case 'c.1.wb.shift.rgain':
					this.data.rGainValue = str[1];
					break;
				case 'c.1.wb.shift.bgain':
					this.data.bGainValue = str[1];
					break;
				case 'p':
					this.data.presetLastUsed = parseInt(str[1]);
					break;
				default:
					break;
			}
	
			for (let i = 1; i <= 100; i++) {
				if (str[0] === ('p.' + i + '.name.utf8')) {
					this.data['presetname' + i] = str[1];
				}
			}
		}
		catch(error) {
			this.log('error', 'Error parsing response from PTZ: ' + String(error))
		}
	},

	getCameraInformation_Delayed() {
		setTimeout(this.getCameraInformation.bind(this), 500);
	}
}