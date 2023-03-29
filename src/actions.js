var { MODELS, SERIES_SPECS } = require('./models.js')
const c = require('./choices.js')

const API = require('./api.js')

module.exports = {
	// ######################
	// #### Send Actions ####
	// ######################

	async sendPTZ(command, str) {
		try {
			if (str !== undefined) {
				const connection = new API(this.config)

				let cmd = `${command}${str}`

				if (this.config.verbose) {
					this.log('debug', `Sending command: ${cmd}`);
				}

				const result = await connection.sendRequest(cmd)

				if (result.status === 'success') {
					this.updateStatus('ok')
				} else {
					this.updateStatus('error')
					this.log('error', result.status);
				}
			}
		} catch (error) {
			this.updateStatus('error')

			let errorText = String(error);

			if (errorText.match('ECONNREFUSED')) {
				this.log('error', 'Unable to connect to the server.')
			}
			else if (errorText.match('ETIMEDOUT') || errorText.match('ENOTFOUND')) {
				this.log('error', 'Connection to server has timed out.')
			}
			else {
				this.log('error', `An error has occurred: ${errorText}`);
			}
		}
	},

	// ##########################
	// #### Instance Actions ####
	// ##########################
	initActions: function () {
		let actions = {}
		let SERIES = {}
		let cmd = ''

		// Set the model and series selected, if in auto, detect what model is connected
		if (this.config.model === 'Auto') {
			this.data.model = this.data.modelDetected
		} else {
			this.data.model = this.config.model
		}

		if (this.data.model !== '') {
			this.data.series = MODELS.find((MODELS) => MODELS.id == this.data.model).series
		}

		// Find the specific commands for a given series
		if (
			this.data.series === 'Auto' ||
			this.data.series === 'Other' ||
			SERIES_SPECS.find((SERIES_SPECS) => SERIES_SPECS.id == this.data.series) == undefined
		) {
			SERIES = SERIES_SPECS.find((SERIES_SPECS) => SERIES_SPECS.id == 'Other')
		}
		else {
			SERIES = SERIES_SPECS.find((SERIES_SPECS) => SERIES_SPECS.id == this.data.series)
		}

		var s = SERIES.actions;

		//check if any lists need to be updated
		if (this.data.exposureShootingModeList !== null) {
			s.exposureShootingMode.dropdown = c.CHOICES_EXPOSURESHOOTINGMODES_BUILD(this.data.exposureShootingModeList); //rebuild the list by running the function again
		}

		if (this.data.exposureModeList !== null) {
			s.exposureMode.dropdown = c.CHOICES_EXPOSUREMODES_BUILD(this.data.exposureModeList); //rebuild the list by running the function again
		}

		if (this.data.aeBrightnessList !== null) {
			s.aeBrightness.dropdown = c.CHOICES_AEBRIGHTNESS_BUILD(this.data.aeBrightnessList); //rebuild the list by running the function again
		}

		if (this.data.aePhotometryList !== null) {
			s.aePhotometry.dropdown = c.CHOICES_AEPHOTOMETRY_BUILD(this.data.aePhotometryList); //rebuild the list by running the function again
		}

		if (this.data.aeFlickerReductList !== null) {
			s.aeFlickerReduct.dropdown = c.CHOICES_AEFLICKERREDUCT_BUILD(this.data.aeFlickerReductList); //rebuild the list by running the function again
		}

		if (this.data.shutterList !== null) {
			s.shutter.dropdown = c.CHOICES_SHUTTER_BUILD(this.data.shutterList); //rebuild the list by running the function again
		}

		if (this.data.irisList !== null) {
			s.iris.dropdown = c.CHOICES_IRIS_BUILD(this.data.irisList); //rebuild the list by running the function again
		}

		if (this.data.kelvinList !== null) {
			s.kelvin.dropdown = c.CHOICES_KELVIN_BUILD(this.data.kelvinList); //rebuild the list
		}

		if (this.data.whitebalanceModeList !== null) {
			s.whitebalanceMode.dropdown = c.CHOICES_WBMODE_BUILD(this.data.whitebalanceModeList); //rebuild the list by running the function again
		}

		// ########################
		// #### System Actions ####
		// ########################

		if (s.powerState == true) {
			actions.powerOff = {
				name: 'System - Power Off',
				options: [],
				callback: async (action) => {
					cmd = 'cmd=standby'
					this.sendPTZ(this.powerCommand, cmd);
					this.data.powerState = 'standby';
					this.getCameraInformation_Delayed();
				}
			}

			actions.powerOn = {
				name: 'System - Power On',
				options: [],
				callback: async (action) => {
					cmd = 'cmd=idle'
					this.sendPTZ(this.powerCommand, cmd);
					this.data.powerState = 'idle';
					this.getCameraInformation_Delayed();
				}
			}

			actions.powerToggle = {
				name: 'System - Power Toggle',
				options: [],
				callback: async (action) => {
					if (this.data.powerState === 'idle') {
						cmd = 'cmd=standby';
						this.data.powerState = 'standby';
					}
					else {
						cmd = 'cmd=idle';
						this.data.powerState = 'idle';
					}
					this.sendPTZ(this.powerCommand, cmd);
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.cameraName.cmd) {
			actions.cameraName = {
				name: 'Set Camera Name',
				options: [
					{
						type: 'textinput',
						label: 'Camera Name',
						id: 'name',
						default: 'Camera',
						tooltip: 'Set the name of the camera.'
					}
				],
				callback: async (action) => {
					cmd = 'c.1.name.utf8=' + action.options.name;
					if (cmd !== '') {
						this.sendPTZ(this.ptzCommand, cmd)
					}
				}
			}
		}

		if (s.tallyProgram == true) {
			actions.tallyProgramOff = {
				name: 'System - Tally Off (Program)',
				options: [],
				callback: async (action) => {
					cmd = 'tally=off&tally.mode=program'
					this.sendPTZ(this.ptzCommand, cmd)
					this.data.tallyProgram = 'off';
					if (this.data.tallyPreview === 'on') {
						cmd = 'tally=on&tally.mode=preview'
						this.sendPTZ(this.ptzCommand, cmd);
					}
					this.getCameraInformation_Delayed();
				}
			}

			actions.tallyProgramOn = {
				name: 'System - Tally On (Program)',
				options: [],
				callback: async (action) => {
					cmd = 'tally=on&tally.mode=program'
					this.sendPTZ(this.ptzCommand, cmd)
					this.data.tallyProgram = 'on';
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.tallyPreview == true) {
			actions.tallyPreviewOff = {
				name: 'System - Tally Off (Preview)',
				options: [],
				callback: async (action) => {
					cmd = 'tally=off&tally.mode=preview'
					this.sendPTZ(this.ptzCommand, cmd)
					this.data.tallyPreview = 'off';
					if (this.data.tallyProgram === 'on') {
						cmd = 'tally=on&tally.mode=program'
						this.sendPTZ(this.ptzCommand, cmd);
					}
					this.getCameraInformation_Delayed();
				}
			}

			actions.tallyPreviewOn = {
				name: 'System - Tally On (Preview)',
				options: [],
				callback: async (action) => {
					cmd = 'tally=on&tally.mode=preview'
					this.sendPTZ(this.ptzCommand, cmd)
					this.data.tallyPreview = 'on';
					this.getCameraInformation_Delayed();
				}
			}

			actions.tallyToggle = {
				name: 'System - Tally Toggle',
				options: [],
				callback: async (action) => {
					if (this.data.tallyProgram === 'on') {
						cmd = 'tally=on&tally.mode=preview';
						this.data.tallyPreview = 'on';
						this.data.tallyProgram = 'off';
					}
					else {
						cmd = 'tally=on&tally.mode=program';
						this.data.tallyProgram = 'on';
						this.data.tallyPreview = 'off';
					}	
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.digitalZoom == true) {
			actions.digitalZoom = {
				name: 'Digital Zoom On/Off',
				options: [
					{
						type: 'dropdown',
						label: 'On/Off',
						id: 'bol',
						default: 0,
						choices: [
							{ id: 0, label: 'Off' },
							{ id: 1, label: 'On' },
						],
					},
				],
				callback: async (action) => {
					if (action.options.bol == 0) {
						cmd = 'c.1.zoom.mode=off'
						this.data.digitalZoom = 'off';
					}
					if (action.options.bol == 1) {
						cmd = 'c.1.zoom.mode=dzoom'
						this.data.digitalZoom = 'dzoom';
					}
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.imageStabilization == true) {
			actions.imageStabilization = {
				name: 'Image Stabilization On/Off',
				options: [
					{
						type: 'dropdown',
						label: 'On/Off',
						id: 'bol',
						default: 0,
						choices: [
							{ id: 0, label: 'Off' },
							{ id: 1, label: 'On' },
						],
					},
				],
				callback: async (action) => {
					if (action.options.bol == 0) {
						cmd = 'c.1.is=off'
						this.data.imageStabilization = 'off';
					}
					if (action.options.bol == 1) {
						cmd = 'c.1.is=on1'
						this.data.imageStabilization = 'on1';
					}
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.custom == true) {
			actions.customCommand = {
				name: 'Send Custom Command',
				options: [
					{
						type: 'textinput',
						label: 'Custom Command',
						id: 'command',
						default: '',
						tooltip: 'Send a custom command. If it is not a supported command, the device may reject it.'
					}
				],
				callback: async (action) => {
					cmd = action.options.command
					if (cmd !== '') {
						this.sendPTZ(this.ptzCommand, cmd)
						this.getCameraInformation_Delayed();
					}
				}
			}
		}

		// ##########################
		// #### Pan/Tilt Actions ####
		// ##########################

		if (s.panTilt == true) {
			actions.left = {
				name: 'Pan/Tilt - Pan Left',
				options: [],
				callback: async (action) => {
					cmd = 'pan=left&pan.speed.dir=' + this.ptSpeed
					this.sendPTZ(this.ptzCommand, cmd)
				}
			}

			actions.right = {
				name: 'Pan/Tilt - Pan Right',
				options: [],
				callback: async (action) => {
					cmd = 'pan=right&pan.speed.dir=' + this.ptSpeed
					this.sendPTZ(this.ptzCommand, cmd)
				}
			}

			actions.up = {
				name: 'Pan/Tilt - Tilt Up',
				options: [],
				callback: async (action) => {
					cmd = 'tilt=up&tilt.speed.dir=' + this.ptSpeed
					this.sendPTZ(this.ptzCommand, cmd)
				}
			}

			actions.down = {
				name: 'Pan/Tilt - Tilt Down',
				options: [],
				callback: async (action) => {
					cmd = 'tilt=down&tilt.speed.dir=' + this.ptSpeed
					this.sendPTZ(this.ptzCommand, cmd)
				}
			}

			actions.upLeft = {
				name: 'Pan/Tilt - Up Left',
				options: [],
				callback: async (action) => {
					cmd = 'pan=left&pan.speed.dir=' + this.ptSpeed + '&tilt=up&tilt.speed.dir=' + this.ptSpeed
					this.sendPTZ(this.ptzCommand, cmd)
				}
			}

			actions.upRight = {
				name: 'Pan/Tilt - Up Right',
				options: [],
				callback: async (action) => {
					cmd = 'pan=right&pan.speed.dir=' + this.ptSpeed + '&tilt=up&tilt.speed.dir=' + this.ptSpeed
					this.sendPTZ(this.ptzCommand, cmd)
				}
			}

			actions.downLeft = {
				name: 'Pan/Tilt - Down Left',
				options: [],
				callback: async (action) => {
					cmd = 'pan=left&pan.speed.dir=' + this.ptSpeed + '&tilt=down&tilt.speed.dir=' + this.ptSpeed
					this.sendPTZ(this.ptzCommand, cmd)
				}
			}

			actions.downRight = {
				name: 'Pan/Tilt - Down Right',
				options: [],
				callback: async (action) => {
					cmd = 'pan=right&pan.speed.dir=' + this.ptSpeed + '&tilt=down&tilt.speed.dir=' + this.ptSpeed
					this.sendPTZ(this.ptzCommand, cmd)
				}
			}

			actions.stop = {
				name: 'Pan/Tilt - Stop',
				options: [],
				callback: async (action) => {
					cmd = 'pan=stop&tilt=stop'
					this.sendPTZ(this.ptzCommand, cmd)
				}
			}

			actions.home = {
				name: 'Pan/Tilt - Home',
				options: [],
				callback: async (action) => {
					cmd = 'pan=0&tilt=0'
					this.sendPTZ(this.ptzCommand, cmd)
				}
			}
		}

		if (s.ptSpeed == true) {
			actions.ptSpeedU = {
				name: 'Pan/Tilt - Speed Up',
				options: [],
				callback: async (action) => {
					if (this.ptSpeedIndex == 0) {
						this.ptSpeedIndex = 0
					} else if (this.ptSpeedIndex > 0) {
						this.ptSpeedIndex--
					}
					this.ptSpeed = c.CHOICES_PT_SPEED[this.ptSpeedIndex].id
					this.data.panTiltSpeedValue = this.ptSpeed;
					this.getCameraInformation_Delayed();
				}
			}

			actions.ptSpeedD = {
				name: 'Pan/Tilt - Speed Down',
				options: [],
				callback: async (action) => {
					if (this.ptSpeedIndex == c.CHOICES_PT_SPEED.length) {
						this.ptSpeedIndex = c.CHOICES_PT_SPEED.length
					} else if (this.ptSpeedIndex < c.CHOICES_PT_SPEED.length) {
						this.ptSpeedIndex++
					}
					this.ptSpeed = c.CHOICES_PT_SPEED[this.ptSpeedIndex].id
					this.data.panTiltSpeedValue = this.ptSpeed;
					this.getCameraInformation_Delayed();
				}
			}

			actions.ptSpeedS = {
				name: 'Pan/Tilt - Set Speed',
				options: [
					{
						type: 'dropdown',
						label: 'Pan/Tilt Speed Setting',
						id: 'speed',
						default: 625,
						choices: c.CHOICES_PT_SPEED,
					},
				],
				callback: async (action) => {
					this.ptSpeed = action.options.speed
					var idx = -1
					for (var i = 0; i < c.CHOICES_PT_SPEED.length; ++i) {
						if (c.CHOICES_PT_SPEED[i].id == this.ptSpeed) {
							idx = i
							break
						}
					}
					if (idx > -1) {
						this.ptSpeedIndex = idx
					}
					this.ptSpeed = c.CHOICES_PT_SPEED[this.ptSpeedIndex].id
					this.data.panTiltSpeedValue = this.ptSpeed;
					this.getCameraInformation_Delayed();
				}
			}
		}

		// ######################
		// #### Lens Actions ####
		// ######################

		if (s.zoom == true) {
			actions.zoomI = {
				name: 'Lens - Zoom In',
				options: [],
				callback: async (action) => {
					cmd = 'zoom=tele&zoom.speed.dir=' + this.zSpeed
					this.sendPTZ(this.ptzCommand, cmd)
				}
			}

			actions.zoomO = {
				name: 'Lens - Zoom Out',
				options: [],
				callback: async (action) => {
					cmd = 'zoom=wide&zoom.speed.dir=' + this.zSpeed
					this.sendPTZ(this.ptzCommand, cmd)
				}
			}

			actions.zoomS = {
				name: 'Lens - Zoom Stop',
				options: [],
				callback: async (action) => {
					cmd = 'zoom=stop'
					this.sendPTZ(this.ptzCommand, cmd)
				}
			}
		}

		if (s.zoomValue == true) {
			actions.zoomValue = {
				name: 'Lens - Set Zoom Value',
				options: [
					{
						type: 'textinput',
						label: 'Zoom Value',
						id: 'value',
						default: '',
						tooltip: 'Set a custom zoom level. If it is not within range, the device may reject it.'
					}
				],
				callback: async (action) => {
					cmd = 'zoom=' + action.options.value;
					this.sendPTZ(this.ptzCommand, cmd)
				}
			}
		}

		if (s.zoomSpeed == true) {
			actions.zSpeedS = {
				name: 'Lens - Set Zoom Speed',
				options: [
					{
						type: 'dropdown',
						label: 'Zoom Speed Setting',
						id: 'speed',
						default: 8,
						choices: c.CHOICES_ZOOM_SPEED,
					},
				],
				callback: async (action) => {
					this.zSpeed = action.options.speed
					var idx = -1
					for (var i = 0; i < c.CHOICES_ZOOM_SPEED.length; ++i) {
						if (c.CHOICES_ZOOM_SPEED[i].id == this.zSpeed) {
							idx = i
							break
						}
					}
					if (idx > -1) {
						this.zSpeedIndex = idx
					}
					this.zSpeed = c.CHOICES_ZOOM_SPEED[this.zSpeedIndex].id
					this.data.zoomSpeed = this.zSpeed;
					this.getCameraInformation_Delayed();
				}
			}

			actions.zSpeedU = {
				name: 'Lens - Zoom Speed Up',
				options: [],
				callback: async (action) => {
					if (this.zSpeedIndex == 0) {
						this.zSpeedIndex = 0
					} else if (this.zSpeedIndex > 0) {
						this.zSpeedIndex--
					}
					this.zSpeed = c.CHOICES_ZOOM_SPEED[this.zSpeedIndex].id
					this.data.zoomSpeed = this.zSpeed;
					this.getCameraInformation_Delayed();
				}
			}

			actions.zSpeedD = {
				name: 'Lens - Zoom Speed Down',
				options: [],
				callback: async (action) => {
					if (this.zSpeedIndex == c.CHOICES_ZOOM_SPEED.length) {
						this.zSpeedIndex = c.CHOICES_ZOOM_SPEED.length
					} else if (this.zSpeedIndex < c.CHOICES_ZOOM_SPEED.length) {
						this.zSpeedIndex++
					}
					this.zSpeed = c.CHOICES_ZOOM_SPEED[this.zSpeedIndex].id
					this.data.zoomSpeed = this.zSpeed;
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.focus == true) {
			actions.focusN = {
				name: 'Lens - Focus Near',
				options: [],
				callback: async (action) => {
					cmd = 'focus.action=near'
					this.sendPTZ(this.ptzCommand, cmd)
				}
			}

			actions.focusF = {
				name: 'Lens - Focus Far',
				options: [],
				callback: async (action) => {
					cmd = 'focus.action=far'
					this.sendPTZ(this.ptzCommand, cmd)
				}
			}

			actions.focusS = {
				name: 'Lens - Focus Stop',
				options: [],
				callback: async (action) => {
					cmd = 'focus.action=stop'
					this.sendPTZ(this.ptzCommand, cmd)
				}
			}
		}

		if (s.focusSpeed == true) {
			actions.fSpeedS = {
				name: 'Lens - Set Focus Speed',
				options: [
					{
						type: 'dropdown',
						label: 'Focus Speed Setting',
						id: 'speed',
						default: 1,
						choices: c.CHOICES_FOCUS_SPEED,
					},
				],
				callback: async (action) => {
					this.fSpeed = action.options.speed
					var idx = -1
					for (var i = 0; i < c.CHOICES_FOCUS_SPEED.length; ++i) {
						if (c.CHOICES_FOCUS_SPEED[i].id == this.fSpeed) {
							idx = i
							break
						}
					}
					if (idx > -1) {
						this.fSpeedIndex = idx
					}
					this.fSpeed = c.CHOICES_FOCUS_SPEED[this.fSpeedIndex].id
					this.data.focusSpeed = this.fSpeed;

					this.checkVariables();
					
					cmd = 'focus.speed=' + this.data.focusSpeed;
					this.sendPTZ(this.ptzCommand, cmd);
					this.getCameraInformation_Delayed();
				}
			}

			actions.fSpeedU = {
				name: 'Lens - Focus Speed Up',
				options: [],
				callback: async (action) => {
					if (this.fSpeedIndex <= 0) {
						this.fSpeedIndex = 0
					} else if (this.fSpeedIndex > 0) {
						this.fSpeedIndex--
					}
					this.fSpeed = c.CHOICES_FOCUS_SPEED[this.fSpeedIndex].id
					this.data.focusSpeed = this.fSpeed;

					this.checkVariables();

					cmd = 'focus.speed=' + this.data.focusSpeed;
					this.sendPTZ(this.ptzCommand, cmd);
					this.getCameraInformation_Delayed();
				}
			}

			actions.fSpeedD = {
				name: 'Lens - Focus Speed Down',
				options: [],
				callback: async (action) => {
					if (this.fSpeedIndex >= c.CHOICES_FOCUS_SPEED.length) {
						this.fSpeedIndex = c.CHOICES_FOCUS_SPEED.length - 1
					} else if (this.fSpeedIndex < c.CHOICES_FOCUS_SPEED.length - 1) {
						this.fSpeedIndex++
					}
					this.fSpeed = c.CHOICES_FOCUS_SPEED[this.fSpeedIndex].id
					this.data.focusSpeed = this.fSpeed;

					this.checkVariables();

					cmd = 'focus.speed=' + this.data.focusSpeed;
					this.sendPTZ(this.ptzCommand, cmd);
					this.getCameraInformation_Delayed();
				}
			}

			actions.fSpeedToggle = {
				name: 'Lens - Focus Speed Toggle',
				options: [],
				callback: async (action) => {
					if (this.fSpeedIndex >= c.CHOICES_FOCUS_SPEED.length - 1) {
						this.fSpeedIndex = 0
					} else if (this.fSpeedIndex < c.CHOICES_FOCUS_SPEED.length - 1) {
						this.fSpeedIndex++
					}

					this.fSpeed = c.CHOICES_FOCUS_SPEED[this.fSpeedIndex].id
					this.data.focusSpeed = this.fSpeed;

					this.checkVariables();
					
					cmd = 'focus.speed=' + this.data.focusSpeed;
					this.sendPTZ(this.ptzCommand, cmd);
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.autoFocus == true) {
			actions.focusM = {
				name: 'Lens - Focus Mode (Auto/Manual Focus)',
				options: [
					{
						type: 'dropdown',
						label: 'Auto / Manual Focus',
						id: 'bol',
						default: 0,
						choices: [
							{ id: 0, label: 'Auto Focus' },
							{ id: 1, label: 'Manual Focus' },
						],
					},
				],
				callback: async (action) => {
					if (action.options.bol == 0) {
						cmd = 'focus=auto'
						this.data.focusMode = 'auto';
					}
					if (action.options.bol == 1) {
						cmd = 'focus=manual'
						this.data.focusMode = 'manual';
					}
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}

			actions.focusToggle = {
				name: 'Lens - Toggle Focus Mode (Auto/Manual Focus)',
				options: [],
				callback: async (action) => {
					if (this.data.focusMode === 'auto') {
						this.data.focusMode = 'manual';
					}
					else {
						this.data.focusMode = 'auto';
					}
					cmd = 'focus=' + this.data.focusMode;
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.oneshotAutoFocus == true) {
			actions.focusOSAF = {
				name: 'Lens - Focus - One Shot Auto Focus',
				options: [],
				callback: async (action) => {
					cmd = 'focus=one_shot'
					this.sendPTZ(this.ptzCommand, cmd)
				}
			}
		}

		// ##########################
		// #### Exposure Actions ####
		// ##########################

		if (s.exposureShootingMode.cmd) {
			actions.exposureShootingMode = {
				name: 'Exposure Shooting Mode',
				options: [
					{
						type: 'dropdown',
						label: 'Exposure Shooting Mode',
						id: 'val',
						default: s.exposureShootingMode.dropdown[0].id,
						choices: s.exposureShootingMode.dropdown
					}
				],
				callback: async (action) => {
					cmd = s.exposureShootingMode.cmd + action.options.val;
					this.sendPTZ(this.ptzCommand, cmd);
										
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.exposureMode.cmd) {
			actions.exposureM = {
				name: 'Exposure Mode',
				options: [
					{
						type: 'dropdown',
						label: 'Exposure Mode',
						id: 'val',
						default: s.exposureMode.dropdown[0].id,
						choices: s.exposureMode.dropdown
					}
				],
				callback: async (action) => {
					cmd = 'c.1.shooting=manual';
					this.sendPTZ(this.ptzCommand, cmd);
					this.data.exposureShootingMode = 'manual';
					cmd = 'c.1.exp=' + action.options.val;
					this.sendPTZ(this.ptzCommand, cmd);
					this.data.exposureMode = action.options.val;
					this.getCameraInformation_Delayed();
				}
			}

			actions.exposureModeToggle = {
				name: 'Exposure Mode Toggle',
				options: [],
				callback: async (action) => {
					this.exposureModeIndex = s.exposureMode.dropdown.findIndex((EXPOSUREMODE) => EXPOSUREMODE.id == this.data.exposureMode);

					if (!this.exposureModeIndex) {
						this.exposureModeIndex = 0;
					}

					if (this.exposureModeIndex >= s.exposureMode.dropdown.length - 1) {
						this.exposureModeIndex = 0;
					} else if (this.exposureModeIndex < s.exposureMode.dropdown.length) {
						this.exposureModeIndex++;
					}

					this.exposureMode = s.exposureMode.dropdown[this.exposureModeIndex].id
					this.data.exposureMode = this.exposureMode;

					if (this.data.exposureMode === 'fullauto') {
						cmd = 'c.1.shooting=fullauto';
						this.sendPTZ(this.ptzCommand, cmd);
						this.data.exposureShootingMode = 'fullauto';
						this.data.exposureMode = 'fullauto';
					}
					else {
						cmd = 'c.1.shooting=manual';
						this.sendPTZ(this.ptzCommand, cmd);
						this.data.exposureShootingMode = 'manual';
						cmd = 'c.1.exp=' + this.data.exposureMode;
						this.sendPTZ(this.ptzCommand, cmd);
					}		
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.aeGainLimit) {
			actions.aeGainLimit = {
				name: 'AE Gain Limit Max',
				options: [
					{
						type: 'number',
						label: 'Value',
						id: 'val',
						tooltip: 'Sets the Gain Limit Max',
						min: this.data.aeGainLimitMaxMin,
						max: this.data.aeGainLimitMaxMax,
						default: 330,
						step: 1,
						required: true,
						range: false
					}
				],
				callback: async (action) => {
					cmd = 'c.1.ae.gainlimit.max=' + action.options.val;
					this.sendPTZ(this.ptzCommand, cmd);
					this.data.aeGainLimitMax = action.options.val;
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.aeBrightness.cmd) {
			actions.aeBrightness = {
				name: 'AE Brightness',
				options: [
					{
						type: 'dropdown',
						label: 'AE Brightness',
						id: 'val',
						default: s.aeBrightness.dropdown[0].id,
						choices: s.aeBrightness.dropdown
					}
				],
				callback: async (action) => {
					cmd = 'c.1.ae.brightness=' + action.options.val;
					this.sendPTZ(this.ptzCommand, cmd);
					this.data.aeBrightness = action.options.val;
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.aePhotometry.cmd) {
			actions.aePhotometry = {
				name: 'AE Photometry',
				options: [
					{
						type: 'dropdown',
						label: 'AE Photometry',
						id: 'val',
						default: s.aePhotometry.dropdown[0].id,
						choices: s.aePhotometry.dropdown
					}
				],
				callback: async (action) => {
					cmd = 'c.1.ae.photometry=' + action.options.val;
					this.sendPTZ(this.ptzCommand, cmd);
					this.data.aePhotometry = action.options.val;
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.aeFlickerReduct.cmd) {
			actions.aeFlickerReduct = {
				name: 'AE Flicker Reduct',
				options: [
					{
						type: 'dropdown',
						label: 'AE Flicker Reduct',
						id: 'val',
						default: s.aeFlickerReduct.dropdown[0].id,
						choices: s.aeFlickerReduct.dropdown
					}
				],
				callback: async (action) => {
					cmd = 'c.1.ae.flickerreduct=' + action.options.val;
					this.sendPTZ(this.ptzCommand, cmd);
					this.data.aeFlickerReduct = action.options.val;
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.aeResp) {
			actions.aeResp = {
				name: 'AE Resp',
				options: [
					{
						type: 'number',
						label: 'Value',
						id: 'val',
						tooltip: 'Sets the AE Resp Value',
						min: this.data.aeRespMin,
						max: this.data.aeRespMax,
						default: 1,
						step: 1,
						required: true,
						range: false
					}
				],
				callback: async (action) => {
					cmd = 'c.1.ae.resp=' + action.options.val;
					this.sendPTZ(this.ptzCommand, cmd);
					this.data.aeResp = action.options.val;
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.shutter.cmd) {
			if (s.shutter.dropdown === undefined) {
				s.shutter.dropdown = c.CHOICES_SHUTTER_OTHER();
			}

			actions.shutterM = {
				name: 'Exposure - Shutter Mode (Auto Shutter)',
				options: [
					{
						type: 'dropdown',
						label: 'Auto / Manual Shutter',
						id: 'bol',
						default: 0,
						choices: [
							{ id: 0, label: 'Auto Shutter' },
							{ id: 1, label: 'Manual Shutter' },
						],
					},
				],
				callback: async (action) => {
					if (action.options.bol == 0) {
						cmd = 'c.1.me.shutter.mode=auto'
					}
					if (action.options.bol == 1) {
						cmd = 'c.1.me.shutter.mode=speed'
					}
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}

			actions.shutterToggle = {
				name: 'Exposure - Toggle Shutter Mode (Auto/Manual Shutter)',
				options: [],
				callback: async (action) => {
					if (this.data.shutterMode === 'auto') {
						this.data.shutterMode = 'speed';
					}
					else {
						this.data.shutterMode = 'auto';
					}
					cmd = 'c.1.me.shutter.mode=' + this.data.shutterMode;
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}

			actions.shutterUp = {
				name: 'Exposure - Shutter Up',
				options: [],
				callback: async (action) => {
					if (this.shutterIndex == s.shutter.dropdown.length) {
						this.shutterIndex = s.shutter.dropdown.length
					} else if (this.shutterIndex < s.shutter.dropdown.length) {
						this.shutterIndex++
					}
					this.shutterValue = s.shutter.dropdown[this.shutterIndex].id
					this.data.shutterValue = this.shutterValue;

					if (this.shutterValue === 'auto') {
						cmd = 'c.1.me.shutter.mode=auto'
						this.sendPTZ(this.ptzCommand, cmd)
					}
					else {
						cmd = 'c.1.me.shutter.mode=speed'
						this.sendPTZ(this.ptzCommand, cmd)
						cmd = s.shutter.cmd + this.shutterValue
						this.sendPTZ(this.ptzCommand, cmd)
					}
					this.getCameraInformation_Delayed();
				}
			}

			actions.shutterDown = {
				name: 'Exposure - Shutter Down',
				options: [],
				callback: async (action) => {
					if (this.shutterIndex == 0) {
						this.shutterIndex = 0
					}
					else if (this.shutterIndex > 0) {
						this.shutterIndex--
					}
					this.shutterValue = s.shutter.dropdown[this.shutterIndex].id
					this.data.shutterValue = this.shutterValue;

					if (this.shutterValue === 'auto') {
						cmd = 'c.1.me.shutter.mode=auto'
						this.sendPTZ(this.ptzCommand, cmd)
					}
					else {
						cmd = 'c.1.me.shutter.mode=speed'
						this.sendPTZ(this.ptzCommand, cmd)
						cmd = s.shutter.cmd + this.shutterValue
						this.sendPTZ(this.ptzCommand, cmd)
					}
					this.getCameraInformation_Delayed();
				}
			}

			actions.shutterSet = {
				name: 'Exposure - Set Shutter',
				options: [
					{
						type: 'dropdown',
						label: 'Shutter Setting',
						id: 'val',
						default: s.shutter.dropdown[0].id,
						choices: s.shutter.dropdown,
					},
				],
				callback: async (action) => {
					this.shutterValue = action.options.val;
					this.data.shutterValue = this.shutterValue;

					if (this.shutterValue === 'auto') {
						cmd = 'c.1.me.shutter.mode=auto'
						this.sendPTZ(this.ptzCommand, cmd)
					}
					else {
						cmd = 'c.1.me.shutter.mode=speed'
						this.sendPTZ(this.ptzCommand, cmd)

						this.shutterIndex = s.shutter.dropdown.findIndex((SHUTTER) => SHUTTER.id == action.options.val);
						cmd = s.shutter.cmd + this.shutterValue;
						this.sendPTZ(this.ptzCommand, cmd);
					}
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.iris.cmd) {
			if (s.iris.dropdown === undefined) {
				s.iris.dropdown = c.CHOICES_IRIS_OTHER();
			}

			actions.irisU = {
				name: 'Exposure - Iris Up',
				options: [],
				callback: async (action) => {
					if (this.irisIndex == s.iris.dropdown.length) {
						this.irisIndex = s.iris.dropdown.length
					} else if (this.irisIndex < s.iris.dropdown.length) {
						this.irisIndex++
					}
					this.irisValue = s.iris.dropdown[this.irisIndex].id
					this.data.irisValue = this.irisValue;
					
					if (this.irisValue === 'auto') {
						cmd = 'c.1.me.diaphragm.mode=auto'
						this.sendPTZ(this.ptzCommand, cmd)
					}
					else {
						cmd = 'c.1.me.diaphragm.mode=manual'
						this.sendPTZ(this.ptzCommand, cmd)
						cmd = s.iris.cmd + this.irisValue
						this.sendPTZ(this.ptzCommand, cmd)
					}
					this.getCameraInformation_Delayed();
				}
			}

			actions.irisD = {
				name: 'Exposure - Iris Down',
				options: [],
				callback: async (action) => {
					if (this.irisIndex == 0) {
						this.irisIndex = 0
					} else if (this.irisIndex > 0) {
						this.irisIndex--
					}
					this.irisValue = s.iris.dropdown[this.irisIndex].id
					this.data.irisValue = this.irisValue;
					
					if (this.irisValue === 'auto') {
						cmd = 'c.1.me.diaphragm.mode=auto'
						this.sendPTZ(this.ptzCommand, cmd)
					}
					else {
						cmd = 'c.1.me.diaphragm.mode=manual'
						this.sendPTZ(this.ptzCommand, cmd)
						cmd = s.iris.cmd + this.irisValue
						this.sendPTZ(this.ptzCommand, cmd)
					}
					this.getCameraInformation_Delayed();
				}
			}

			actions.irisS = {
				name: 'Exposure - Set Iris',
				options: [
					{
						type: 'dropdown',
						label: 'Iris Setting',
						id: 'val',
						default: s.iris.dropdown[0].id,
						choices: s.iris.dropdown,
					},
				],
				callback: async (action) => {
					this.irisIndex = s.iris.dropdown.findIndex((IRIS) => IRIS.id == action.options.val);
					this.irisValue = action.options.val;
					this.data.irisValue = this.irisValue;

					if (this.irisValue === 'auto') {
						cmd = 'c.1.me.diaphragm.mode=auto'
						this.sendPTZ(this.ptzCommand, cmd)
					}
					else {
						cmd = 'c.1.me.diaphragm.mode=manual'
						this.sendPTZ(this.ptzCommand, cmd)

						cmd = s.iris.cmd + this.irisValue;
						this.sendPTZ(this.ptzCommand, cmd);
					}
					this.getCameraInformation_Delayed();
				}
			}

			actions.irisM = {
				name: 'Exposure - Iris Mode (Auto Iris)',
				options: [
					{
						type: 'dropdown',
						label: 'Auto / Manual Iris',
						id: 'bol',
						default: 0,
						choices: [
							{ id: 0, label: 'Auto Iris' },
							{ id: 1, label: 'Manual Iris' },
						],
					},
				],
				callback: async (action) => {
					if (action.options.bol == 0) {
						cmd = 'c.1.me.diaphragm.mode=auto'
					}
					if (action.options.bol == 1) {
						cmd = 'c.1.me.diaphragm.mode=manual'
					}
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}

			actions.irisToggle = {
				name: 'Exposure - Toggle Iris Mode (Auto/Manual Iris)',
				options: [],
				callback: async (action) => {
					if (this.data.irisMode === 'auto') {
						this.data.irisMode = 'manual';
					}
					else {
						this.data.irisMode = 'auto';
					}
					cmd = 'c.1.me.diaphragm.mode=' + this.data.irisMode;
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.gain.cmd) {
			if (s.gain.dropdown === undefined) {
				s.gain.dropdown = c.CHOICES_GAIN_OTHER();
			}

			actions.gainU = {
				name: 'Exposure - Gain Up',
				options: [],
				callback: async (action) => {
					if (this.gainIndex == s.gain.dropdown.length) {
						this.gainIndex = s.gain.dropdown.length
					} else if (this.gainIndex < s.gain.dropdown.length) {
						this.gainIndex++
					}
					this.gainValue = s.gain.dropdown[this.gainIndex].id
					this.data.gainValue = this.gainValue;

					if (this.gainValue === 'auto') {
						cmd = 'c.1.me.gain.mode=auto'
						this.sendPTZ(this.ptzCommand, cmd)
					}
					else {
						cmd = 'c.1.me.gain.mode=manual'
						this.sendPTZ(this.ptzCommand, cmd)
						cmd = s.gain.cmd + this.gainValue
						this.sendPTZ(this.ptzCommand, cmd)
					}
					this.getCameraInformation_Delayed();
				}
			}

			actions.gainD = {
				name: 'Exposure - Gain Down',
				options: [],
				callback: async (action) => {
					if (this.gainIndex == 0) {
						this.gainIndex = 0
					} else if (this.gainIndex > 0) {
						this.gainIndex--
					}
					this.gainValue = s.gain.dropdown[this.gainIndex].id
					this.data.gainValue = this.gainValue;

					if (this.gainValue === 'auto') {
						cmd = 'c.1.me.gain.mode=auto'
						this.sendPTZ(this.ptzCommand, cmd)
					}
					else {
						cmd = 'c.1.me.gain.mode=manual'
						this.sendPTZ(this.ptzCommand, cmd)
						cmd = s.gain.cmd + this.gainValue
						this.sendPTZ(this.ptzCommand, cmd)
					}
					this.getCameraInformation_Delayed();
				}
			}

			actions.gainToggle = {
				name: 'Exposure - Toggle Gain Mode (Auto/Manual Gain)',
				options: [],
				callback: async (action) => {
					if (this.data.gainMode === 'auto') {
						this.data.gainMode = 'manual';
					}
					else {
						this.data.gainMode = 'auto';
					}
					cmd = 'c.1.me.gain.mode=' + this.data.gainMode;
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}

			actions.gainS = {
				name: 'Exposure - Set Gain',
				options: [
					{
						type: 'dropdown',
						label: 'Gain setting',
						id: 'val',
						default: s.gain.dropdown[0].id,
						choices: s.gain.dropdown,
					},
				],
				callback: async (action) => {
					this.gainIndex = action.options.val;

					if (this.gainValue === 'auto') {
						cmd = 'c.1.me.gain.mode=auto'
						this.sendPTZ(this.ptzCommand, cmd)
					}
					else {
						cmd = 'c.1.me.gain.mode=manual'
						this.sendPTZ(this.ptzCommand, cmd)

						this.gainIndex = s.gain.dropdown.findIndex((GAIN) => GAIN.id == action.options.val);
						this.gainValue = action.options.val;
						this.data.gainValue = this.gainValue;
						cmd = s.gain.cmd + this.gainValue;
						this.sendPTZ(this.ptzCommand, cmd);
					}
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.ndfilter.cmd) {
			if (s.ndfilter.dropdown === undefined) {
				s.ndfilter.dropdown = c.CHOICES_NDFILTER_OTHER;
			}

			actions.ndfilterUp = {
				name: 'Exposure - ND Filter Up',
				options: [],
				callback: async (action) => {
					if (this.ndfilterIndex == s.ndfilter.dropdown.length) {
						this.ndfilterIndex = s.ndfilter.dropdown.length
					} else if (this.ndfilterIndex < s.ndfilter.dropdown.length) {
						this.ndfilterIndex++
					}
					this.ndfilterValue = s.ndfilter.dropdown[this.ndfilterIndex].id
					this.data.ndfilterValue = this.ndfilterValue;
					cmd = s.ndfilter.cmd + this.ndfilterValue
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}

			actions.ndfilterDown = {
				name: 'Exposure - ND Filter Down',
				options: [],
				callback: async (action) => {
					if (this.ndfilterIndex == 0) {
						this.ndfilterIndex = 0
					} else if (this.ndfilterIndex > 0) {
						this.ndfilterIndex--
					}
					this.ndfilterValue = s.ndfilter.dropdown[this.ndfilterIndex].id
					this.data.ndfilterValue = this.ndfilterValue;
					cmd = s.ndfilter.cmd + this.ndfilterValue
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}

			actions.filterSet = {
				name: 'Exposure - Set ND Filter',
				options: [
					{
						type: 'dropdown',
						label: 'ND Filter Setting',
						id: 'val',
						default: s.ndfilter.dropdown[0].id,
						choices: s.ndfilter.dropdown,
					},
				],
				callback: async (action) => {
					this.ndfilterIndex = s.ndfilter.dropdown.findIndex((NDFILTER) => NDFILTER.id == action.options.val);
					this.ndfilterValue = action.options.val;
					this.data.ndfilterValue = this.ndfilterValue;
					cmd = s.ndfilter.cmd + this.ndfilterValue;
					this.sendPTZ(this.ptzCommand, cmd);
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.pedestal.cmd) {
			if (s.pedestal.dropdown === undefined) {
				s.pedestal.dropdown = c.CHOICES_PEDESTAL_OTHER();
			}

			actions.pedestalUp = {
				name: 'Exposure - Pedestal Up',
				options: [],
				callback: async (action) => {
					if (this.pedestalIndex == s.pedestal.dropdown.length) {
						this.pedestalIndex = s.pedestal.dropdown.length
					} else if (this.pedestalIndex < s.pedestal.dropdown.length) {
						this.pedestalIndex++
					}
					this.pedestalValue = s.pedestal.dropdown[this.pedestalIndex].id
					this.data.pedestalValue = this.pedestalValue;
					cmd = s.pedestal.cmd + this.pedestalValue
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}

			actions.pedestalDown = {
				name: 'Exposure - Pedestal Down',
				options: [],
				callback: async (action) => {
					if (this.pedestalIndex == 0) {
						this.pedestalIndex = 0
					} else if (this.pedestalIndex > 0) {
						this.pedestalIndex--
					}
					this.pedestalValue = s.pedestal.dropdown[this.pedestalIndex].id
					this.data.pedestalValue = this.pedestalValue;
					cmd = s.pedestal.cmd + this.pedestalValue
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}

			actions.pedestalSet = {
				name: 'Exposure - Set Pedestal',
				options: [
					{
						type: 'dropdown',
						label: 'Pedestal Setting',
						id: 'val',
						default: s.pedestal.dropdown[0].id,
						choices: s.pedestal.dropdown,
					},
				],
				callback: async (action) => {
					this.pedestalIndex = s.pedestal.dropdown.findIndex((PEDESTAL) => PEDESTAL.id == action.options.val);
					this.pedestalValue = s.pedestal.dropdown[this.pedestalIndex].id
					this.data.pedestalValue = this.pedestalValue;
					cmd = s.pedestal.cmd + this.pedestalValue;
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}
		}

		// ##########################
		// #### White Balance Actions ####
		// ##########################

		if (s.whitebalanceMode.cmd) {
			if (s.whitebalanceMode.dropdown === undefined) {
				s.whitebalanceMode.dropdown = c.CHOICES_WBMODE_OTHER;
			}

			actions.whitebalanceModeSet = {
				name: 'White Balance - Set Mode',
				options: [
					{
						type: 'dropdown',
						label: 'White Balance Mode Setting',
						id: 'val',
						default: s.whitebalanceMode.dropdown[0].id,
						choices: s.whitebalanceMode.dropdown,
					},
				],
				callback: async (action) => {
					cmd = s.whitebalanceMode.cmd + action.options.val;
					this.sendPTZ(this.ptzCommand, cmd);
					this.getCameraInformation_Delayed();
				}
			}

			actions.whitebalanceModeToggle = {
				name: 'White Balance Mode Toggle',
				options: [],
				callback: async (action) => {
					this.whitebalanceModeIndex = s.whitebalanceMode.dropdown.findIndex((WBMODE) => WBMODE.id == this.data.whitebalanceMode);

					if (!this.whitebalanceModeIndex) {
						this.whitebalanceModeIndex = 0;
					}

					if (this.whitebalanceModeIndex >= s.whitebalanceMode.dropdown.length - 1) {
						this.whitebalanceModeIndex = 0;
					} else if (this.whitebalanceModeIndex < s.whitebalanceMode.dropdown.length - 1) {
						this.whitebalanceModeIndex++;
					}

					this.whitebalanceMode = s.whitebalanceMode.dropdown[this.whitebalanceModeIndex].id
					this.data.whitebalanceMode = this.whitebalanceMode;

					cmd = s.whitebalanceMode.cmd + this.data.whitebalanceMode;
					this.sendPTZ(this.ptzCommand, cmd);
					this.getCameraInformation_Delayed();
				}
			}

			actions.whitebalanceCalibration = {
				name: 'White Balance Calibration',
				options: [
					{
						type: 'dropdown',
						label: 'White Balance Mode',
						id: 'mode',
						default: 'a',
						choices: [ { id: 'a', label: 'WB A Mode'}, { id: 'b', label: 'WB B Mode'}]
					}
				],
				callback: async (action) => {
					cmd = 'c.1.wb.action=one_shot_' + action.options.mode;
					this.sendPTZ(this.ptzCommand, cmd);
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.kelvin.cmd) {
			if (s.kelvin.dropdown === undefined) {
				s.kelvin.dropdown = c.CHOICES_KELVIN_OTHER();
			}
			actions.kelvinUp = {
				name: 'White Balance - Kelvin Value Up',
				options: [],
				callback: async (action) => {
					if (this.kelvinIndex >= s.kelvin.dropdown.length) {
						this.kelvinIndex = s.kelvin.dropdown.length
					} else if (this.kelvinIndex < s.kelvin.dropdown.length) {
						this.kelvinIndex++
					}
					this.kelvinValue = s.kelvin.dropdown[this.kelvinIndex].id
					this.data.kelvinValue = this.kelvinValue;
					cmd = s.kelvin.cmd + this.kelvinValue
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}

			actions.kelvinDown = {
				name: 'White Balance - Kelvin Value Down',
				options: [],
				callback: async (action) => {
					if (this.kelvinIndex <= 0) {
						this.kelvinIndex = 0
					} else if (this.kelvinIndex > 0) {
						this.kelvinIndex--
					}
					this.kelvinValue = s.kelvin.dropdown[this.kelvinIndex].id
					this.data.kelvinValue = this.kelvinValue;
					cmd = s.kelvin.cmd + this.kelvinValue
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}

			actions.kelvinSet = {
				name: 'White Balance - Set Kelvin Value',
				options: [
					{
						type: 'dropdown',
						label: 'Kelvin Setting',
						id: 'val',
						default: s.kelvin.dropdown[0].id,
						choices: s.kelvin.dropdown,
					},
				],
				callback: async (action) => {
					this.kelvinIndex = s.kelvin.dropdown.findIndex((KELVIN) => KELVIN.id == action.options.val);
					this.kelvinValue = action.options.val;
					this.data.kelvinValue = this.kelvinValue;
					cmd = s.kelvin.cmd + this.kelvinValue;
					this.sendPTZ(this.ptzCommand, cmd);
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.rGain.cmd) {
			if (s.rGain.dropdown === undefined) {
				s.rGain.dropdown = c.CHOICES_RGAIN_OTHER();
			}
			actions.rGainUp = {
				name: 'White Balance - Red Gain Up',
				options: [],
				callback: async (action) => {
					if (this.rGainIndex >= s.rGain.dropdown.length) {
						this.rGainIndex = s.rGain.dropdown.length
					} else if (this.rGainIndex < s.rGain.dropdown.length) {
						this.rGainIndex++
					}
					this.rGainValue = s.rGain.dropdown[this.rGainIndex].id
					this.data.rGainValue = this.rGainValue;
					cmd = s.rGain.cmd + this.rGainValue
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}

			actions.rGainDown = {
				name: 'White Balance - Red Gain Down',
				options: [],
				callback: async (action) => {
					if (this.rGainIndex <= 0) {
						this.rGainIndex = 0
					} else if (this.rGainIndex > 0) {
						this.rGainIndex--
					}
					this.rGainValue = s.rGain.dropdown[this.rGainIndex].id
					this.data.rGainValue = this.rGainValue;
					cmd = s.rGain.cmd + this.rGainValue
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}

			actions.rGainSet = {
				name: 'White Balance - Set Red Gain',
				options: [
					{
						type: 'dropdown',
						label: 'Red Gain Setting',
						id: 'val',
						default: s.rGain.dropdown[0].id,
						choices: s.rGain.dropdown
					},
				],
				callback: async (action) => {
					this.rGainIndex = s.rGain.dropdown.findIndex((RGAIN) => RGAIN.id == action.options.val);
					this.rGainValue = action.options.val;
					this.data.rGainValue = this.rGainValue;
					cmd = s.rGain.cmd + this.rGainValue;
					this.sendPTZ(this.ptzCommand, cmd);
					this.getCameraInformation_Delayed();
				}
			}
		}

		if (s.bGain.cmd) {
			if (s.bGain.dropdown === undefined) {
				s.bGain.dropdown = c.CHOICES_BGAIN_OTHER();
			}
			actions.bGainUp = {
				name: 'White Balance - Blue Gain Up',
				options: [],
				callback: async (action) => {
					if (this.bGainIndex >= s.bGain.dropdown.length) {
						this.bGainIndex = s.bGain.dropdown.length
					} else if (this.bGainIndex < s.bGain.dropdown.length) {
						this.bGainIndex++
					}
					this.bGainValue = s.bGain.dropdown[this.bGainIndex].id
					this.data.bGainValue = this.bGainValue;
					cmd = s.bGain.cmd + this.bGainValue;
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}

			actions.bGainDown = {
				name: 'White Balance - Blue Gain Down',
				options: [],
				callback: async (action) => {
					if (this.bGainIndex <= 0) {
						this.bGainIndex = 0
					} else if (this.bGainIndex > 0) {
						this.bGainIndex--
					}
					this.bGainValue = s.bGain.dropdown[this.bGainIndex].id
					this.data.bGainValue = this.bGainValue;
					cmd = s.bGain.cmd + this.bGainValue;
					this.sendPTZ(this.ptzCommand, cmd)
					this.getCameraInformation_Delayed();
				}
			}

			actions.bGainSet = {
				name: 'White Balance - Set Blue Gain',
				options: [
					{
						type: 'dropdown',
						label: 'Blue Gain Setting',
						id: 'val',
						default: s.bGain.dropdown[0].id,
						choices: s.bGain.dropdown,
					},
				],
				callback: async (action) => {
					this.bGainIndex = s.bGain.dropdown.findIndex((BGAIN) => BGAIN.id == action.options.val);
					this.bGainValue = action.options.val;
					this.data.bGainValue = this.bGainValue;
					cmd = s.bGain.cmd + this.bGainValue;
					this.sendPTZ(this.ptzCommand, cmd);
					this.getCameraInformation_Delayed();
				}
			}
		}

		// #########################
		// #### Presets Actions ####
		// #########################

		if (s.presets == true) {
			actions.savePset = {
				name: 'Preset - Save',
				options: [
					{
						type: 'dropdown',
						label: 'Preset Number',
						id: 'val',
						default: c.CHOICES_PRESETS()[0].id,
						choices: c.CHOICES_PRESETS(),
					},
					{
						type: 'textinput',
						label: 'Preset Name',
						id: 'name',
						default: 'preset',
						tooltip: 'Set the name of the preset.'
					},
					{
						type: 'checkbox',
						label: 'Save Position (PTZ)',
						id: 'save_ptz',
						default: true
					},
					{
						type: 'checkbox',
						label: 'Save Focus',
						id: 'save_focus',
						default: true
					},
					{
						type: 'checkbox',
						label: 'Save Exposure',
						id: 'save_exposure',
						default: true
					},
					{
						type: 'checkbox',
						label: 'Save White Balance',
						id: 'save_whitebalance',
						default: true
					},
					{
						type: 'checkbox',
						label: 'Save Image Stabilization (IS)',
						id: 'save_is',
						default: true
					},
					{
						type: 'checkbox',
						label: 'Save CP',
						id: 'save_cp',
						default: true
					}
				],
				callback: async (action) => {
					cmd = 'p=' + action.options.val + '&name=' + action.options.name;
					if ((action.options.save_ptz) && (action.options.save_focus) && (action.options.save_exposure) && (action.options.save_whitebalance) && (action.options.save_is) && (action.options.save_cp)) {
						cmd += '&all=enabled';
					}
					else {
						if (action.options.save_ptz) {
							cmd += '&ptz=enabled';
						}
						else {
							cmd += '&ptz=disabled';
						}
						if (action.options.save_focus) {
							cmd += '&focus=enabled';
						}
						else {
							cmd += '&focus=disabled';
						}
						if (action.options.save_exposure) {
							cmd += '&exp=enabled';
						}
						else {
							cmd += '&exp=disabled';
						}
						if (action.options.save_whitebalance) {
							cmd += '&wb=enabled';
						}
						else {
							cmd += '&wb=disabled';
						}
						if (action.options.save_is) {
							cmd += '&is=enabled';
						}
						else {
							cmd += '&is=disabled';
						}
						if (action.options.save_cp) {
							cmd += '&cp=enabled';
						}
						else {
							cmd += '&cp=disabled';
						}
					}
					this.sendPTZ(this.savePresetCommand, cmd);
				}
			}
		
			actions.recallPset = {
				name: 'Preset - Recall',
				options: [
					{
						type: 'dropdown',
						label: 'Preset Number',
						id: 'val',
						default: c.CHOICES_PRESETS()[0].id,
						choices: c.CHOICES_PRESETS(),
					},
				],
				callback: async (action) => {
					//need to determine drive mode first (normal, time, speed) and then recall with appropriate command
					if (!this.presetRecallMode) {
						this.presetRecallMode = 'normal';
						this.data.presetRecallMode = 'normal';
					}

					cmd = 'p=' + action.options.val;

					switch(this.presetRecallMode) {
						case 'time':
							cmd += '&p.ptztime=' + this.data.presetTimeValue;
							break;
						case 'speed':
							cmd += '&p.ptzspeed=' + this.data.presetSpeedValue;
							break;
					}

					this.data.presetLastUsed = action.options.val;

					this.sendPTZ(this.ptzCommand, cmd);
				}
			}
		}
		if (s.presets == true) {
			actions.recallModePsetToggle = {
				name: 'Preset - Toggle Recall Mode',
				options: [],
				callback: async (action) => {
					this.presetRecallModeIndex = c.CHOICES_PRESETRECALLMODES.findIndex((PRESETRECALLMODE) => PRESETRECALLMODE.id == this.data.presetRecallMode);

					if (!this.presetRecallModeIndex) {
						this.presetRecallModeIndex = 0;
					}

					if (this.presetRecallModeIndex >= c.CHOICES_PRESETRECALLMODES.length - 1) {
						this.presetRecallModeIndex = 0;
					} else if (this.presetRecallModeIndex < c.CHOICES_PRESETRECALLMODES.length - 1) {
						this.presetRecallModeIndex++;
					}

					this.presetRecallMode = c.CHOICES_PRESETRECALLMODES[this.presetRecallModeIndex].id
					this.data.presetRecallMode = this.presetRecallMode;
					this.checkVariables();
				}
			}

			actions.recallModePset = {
				name: 'Preset - Set Recall Mode',
				options: [
					{
						type: 'dropdown',
						label: 'Preset Mode',
						id: 'val',
						default: c.CHOICES_PRESETRECALLMODES[0].id,
						choices: c.CHOICES_PRESETRECALLMODES
					},
				],
				callback: async (action) => {
					this.presetRecallMode = action.options.val;
					this.data.presetRecallMode = action.options.val;
					this.checkVariables();
				}
			}
		}

		if (s.timePset == true) {
			actions.timePsetUp = {
				name: 'Preset - Drive Time Up',
				options: [],
				callback: async (action) => {
					let choices_pstime = c.CHOICES_PSTIME();

					if (this.presetDriveTimeIndex >= choices_pstime.length) {
						this.presetDriveTimeIndex = choices_pstime.length
					} else if (this.presetDriveTimeIndex < choices_pstime.length) {
						this.presetDriveTimeIndex++
					}
					this.presetTimeValue = choices_pstime[this.presetDriveTimeIndex].id
					this.data.presetTimeValue = this.presetTimeValue;
					this.checkVariables();
				}				
			}

			actions.timePsetDown = {
				name: 'Preset - Drive Time Down',
				options: [],
				callback: async (action) => {
					let choices_pstime = c.CHOICES_PSTIME();

					if (this.presetDriveTimeIndex <= 0) {
						this.presetDriveTimeIndex = 0
					} else if (this.presetDriveTimeIndex > 0) {
						this.presetDriveTimeIndex--
					}
					this.presetTimeValue = choices_pstime[this.presetDriveTimeIndex].id
					this.data.presetTimeValue = this.presetTimeValue;
					this.checkVariables();
				}
			}

			actions.timePset = {
				name: 'Preset - Set Drive Time',
				options: [
					{
						type: 'dropdown',
						label: 'Time Seconds',
						id: 'time',
						default: 2000,
						choices: c.CHOICES_PSTIME(),
					},
				],
				callback: async (action) => {
					this.presetRecallTime = action.options.time;
					this.data.presetTimeValue = action.options.time;
					this.checkVariables();
				}
			}
		}

		if (s.speedPset == true) {
			actions.speedPsetUp = {
				name: 'Preset - Drive Speed Up',
				options: [],
				callback: async (action) => {
					let choices_psspeed = c.CHOICES_PSSPEED();

					if (this.presetDriveSpeedIndex >= choices_psspeed.length) {
						this.presetDriveSpeedIndex = choices_psspeed.length
					} else if (this.presetDriveSpeedIndex < choices_psspeed.length) {
						this.presetDriveSpeedIndex++
					}
					this.presetSpeedValue = choices_psspeed[this.presetDriveSpeedIndex].id
					this.data.presetSpeedValue = this.presetSpeedValue;
					this.checkVariables();
				}				
			}

			actions.speedPsetDown = {
				name: 'Preset - Drive Speed Down',
				options: [],
				callback: async (action) => {
					let choices_psspeed = c.CHOICES_PSSPEED();

					if (this.presetDriveSpeedIndex <= 0) {
						this.presetDriveSpeedIndex = 0
					} else if (this.presetDriveSpeedIndex > 0) {
						this.presetDriveSpeedIndex--
					}
					this.presetSpeedValue = choices_psspeed[this.presetDriveSpeedIndex].id
					this.data.presetSpeedValue = this.presetSpeedValue;
					this.checkVariables();
				}
			}

			actions.speedPset = {
				name: 'Preset - Set Drive Speed',
				options: [
					{
						type: 'dropdown',
						label: 'Speed Setting',
						id: 'speed',
						default: 100,
						choices: c.CHOICES_PSSPEED(),
					},
				],
				callback: async (action) => {
					this.presetRecallSpeed = action.options.speed;
					this.data.presetSpeedValue = action.options.speed;
					this.checkVariables();
				}
			}
		}

		if (s.traces == true) {
			actions.tracePrepare = {
				name: 'Trace - Prepare',
				options: [
					{
						type: 'dropdown',
						label: 'Trace Number',
						id: 'trace',
						default: 1,
						choices: [
							{ id: 1, label: 'Trace 1'},
							{ id: 2, label: 'Trace 2'},
							{ id: 3, label: 'Trace 3'},
							{ id: 4, label: 'Trace 4'},
							{ id: 5, label: 'Trace 5'},
							{ id: 6, label: 'Trace 6'},
							{ id: 7, label: 'Trace 7'},
							{ id: 8, label: 'Trace 8'},
							{ id: 9, label: 'Trace 9'},
							{ id: 10, label: 'Trace 10'},
						],
					}
				],
				callback: async (action) => {
					let trace = action.options.trace;

					cmd = 'control?t=' + trace + '&cmd=prepare'
					this.sendPTZ(this.traceCommand, cmd);
				}
			}

			actions.traceStart = {
				name: 'Trace - Start',
				options: [
					{
						type: 'dropdown',
						label: 'Trace Number',
						id: 'trace',
						default: 1,
						choices: [
							{ id: 1, label: 'Trace 1'},
							{ id: 2, label: 'Trace 2'},
							{ id: 3, label: 'Trace 3'},
							{ id: 4, label: 'Trace 4'},
							{ id: 5, label: 'Trace 5'},
							{ id: 6, label: 'Trace 6'},
							{ id: 7, label: 'Trace 7'},
							{ id: 8, label: 'Trace 8'},
							{ id: 9, label: 'Trace 9'},
							{ id: 10, label: 'Trace 10'},
						],
					}
				],
				callback: async (action) => {
					let trace = action.options.trace;

					cmd = 'control?t=' + trace + '&cmd=start'
					this.sendPTZ(this.traceCommand, cmd);
				}
			}

			actions.traceStop = {
				name: 'Trace - Stop',
				options: [
					{
						type: 'dropdown',
						label: 'Trace Number',
						id: 'trace',
						default: 1,
						choices: [
							{ id: 1, label: 'Trace 1'},
							{ id: 2, label: 'Trace 2'},
							{ id: 3, label: 'Trace 3'},
							{ id: 4, label: 'Trace 4'},
							{ id: 5, label: 'Trace 5'},
							{ id: 6, label: 'Trace 6'},
							{ id: 7, label: 'Trace 7'},
							{ id: 8, label: 'Trace 8'},
							{ id: 9, label: 'Trace 9'},
							{ id: 10, label: 'Trace 10'},
						],
					}
				],
				callback: async (action) => {
					let trace = action.options.trace;

					cmd = 'control?t=' + trace + '&cmd=stop'
					this.sendPTZ(this.traceCommand, cmd);
				}
			}
		}

		this.setActionDefinitions(actions)
	}
}
