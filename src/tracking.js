
const { InstanceStatus } = require('@companion-module/base')

const axios = require('axios');

//get_config.cgi needs at least one key, and one unknown key fails the whole request
//with HTTP 400 / E4_120. These are the settings the module reads that are in the
//documented setting list (Auto Tracking Protocol Specifications v1.02, Table 3-4).
const TRACKING_CONFIG_KEYS = [
	'trackingEnable',
	'zoomControlEnable',
	'targetSizeLevel',
	'autoZoomEnable',
	'targetSelection',
	'sensitivity',
	'targetPosition',
	'trackingDisableAreaEnable',
];

//Settings the module reads that are not in the app 1.4.0 list. They are asked for
//separately so that an app that rejects them can't take the documented keys down too.
const TRACKING_CONFIG_LEGACY_KEYS = [
	'tiltFixed',
	'recoveryControl',
	'recoveryControlTime',
	'trackingRestartEnable',
	'trackingStartTime',
	'visibilityLimitEnable',
	'visibilityLimitUpper',
	'visibilityLimitLeft',
	'visibilityLimitRight',
	'visibilityLimitLower',
];

//Returns the setting values from a get_config.cgi response, or undefined if the app
//didn't report success
function parseTrackingConfig(result) {
	if (!result || !result.response || !result.response.data || typeof result.response.data !== 'object') {
		return undefined;
	}

	let { status_code, description, ...settings } = result.response.data;

	if (!String(status_code).startsWith('G0_')) {
		return undefined;
	}

	return settings;
}

module.exports = {
	initTrackingPolling() {
		let self = this;

		// Cleanup old interval
		if (self.pollTrackingTimer) {
			clearInterval(self.pollTrackingTimer);
		}

		// Setup polling if enabled
		if (self.pollTrackingTimer === undefined && self.config.enableTracking == true) {
			self.pollTrackingTimer = setInterval(() => {
				self.getCameraTrackingConfig.bind(self)();
				self.getCameraTrackingInformation.bind(self)();
			}, self.config.trackingInterval)
		}
	},

	stopTrackingPolling() {
		let self = this;
		//self.log('error', 'Stopping Polling due to Server error.');

		clearInterval(self.pollTrackingTimer);
		delete self.pollTrackingTimer
	},

	async sendTrackingRequest(cmd) {
		let self = this;

		if (self.config.trackingAddonUrl == undefined || self.config.trackingAddonUrl == '') {
			self.config.trackingAddonUrl = '/cgi-addon/Auto_Tracking_RA-AT001/app_ctrl/';
		}

		let trackingBaseUrl = `http://${self.config.host}:${self.config.httpPort}${self.config.trackingAddonUrl}`;

		let requestUrl = `${trackingBaseUrl}${cmd}`;

		try {
			const response = await axios.get(requestUrl)
			return {
				status: 'ok',
				response: response
			}
		} catch (err) {
			//console.log(err)
			return {
				status: 'failed',
			}
		}
	},

	async getCameraTrackingConfig() {
		let self = this;

		let cmd = `get_config.cgi?keys=${TRACKING_CONFIG_KEYS.join(',')}`;
		let legacyCmd = `get_config.cgi?keys=${TRACKING_CONFIG_LEGACY_KEYS.join(',')}`;
		let [result, legacyResult] = await Promise.all([
			self.sendTrackingRequest(cmd),
			self.sendTrackingRequest(legacyCmd),
		]);

		//do something with data
		try {
			if (result && result.response && result.response.data) {
				try {
					let config = parseTrackingConfig(result);

					if (config === undefined) {
						if (self.config.verbose) {
							self.log('error', `Error Getting Tracking Config Data: ${result.response.data.status_code} ${result.response.data.description}`);
						}
						return;
					}

					//The legacy keys are optional: if the app rejects them, keep whatever was there before
					let legacyConfig = parseTrackingConfig(legacyResult) || {};

					self.data.trackingConfig = Object.assign({}, self.data.trackingConfig, legacyConfig, config);
					self.updateStatus(InstanceStatus.Ok)

					self.checkVariables()
					self.checkFeedbacks()
				}
				catch(error) {
					if (self.config.verbose) {
						self.log('error', `Error Getting Data: ${error}`);
					}
					//self.updateStatus(InstanceStatus.Error)
				}
			}
			else {
				if (!self.errorTrackingCount) {
					if (self.config.verbose) {
						self.log('error', `Error Getting Tracking Config Data: No response received from server. Is the Camera Online? Are you running the Auto Tracking Add-On?`);
						clearInterval(self.pollTrackingTimer);
					}
					//self.updateStatus(InstanceStatus.ConnectionFailure)
				}

				// Cleanup polling
				if (self.config.continuePolling !== true) {
					self.stopTrackingPolling()
				}

				self.errorTrackingCount++;
			}
		}
		catch(error) {
			if (self.config.verbose) {
				self.log('error', `Error Getting Data: ${error}`);
			}
			//self.updateStatus(InstanceStatus.Error)
			// Cleanup polling
			if (self.config.continuePolling !== true) {
				self.stopTrackingPolling()
			}
		}
	},

	async getCameraTrackingInformation() {
		let self = this;

		let cmd = 'track_info.cgi';
		let result = await self.sendTrackingRequest(cmd);

		//do something with data
		try {
			if (result && result.response && result.response.data) {
				let data = result.response.data;

				try {
					self.data.trackingInformation = data;
					//do stuff with the info data here

					self.updateStatus(InstanceStatus.Ok)

					self.checkVariables()
					self.checkFeedbacks()
				}
				catch(error) {
					if (self.config.verbose) {
						self.log('error', `Error Getting Data: ${error}`);
					}
					//self.updateStatus(InstanceStatus.Error)
				}
			}
			else {
				if (!self.errorTrackingCount) {
					if (self.config.verbose) {
						self.log('error', `Error Getting Tracking Information Data: No response received from server. Is the Camera Online? Are you running the Auto Tracking Add-On?`);
						clearInterval(self.pollTrackingTimer);
					}
					//self.updateStatus(InstanceStatus.ConnectionFailure)
				}

				// Cleanup polling
				if (self.config.continuePolling !== true) {
					self.stopTrackingPolling()
				}

				self.errorTrackingCount++;
			}
		}
		catch(error) {
			if (self.config.verbose) {
				self.log('error', `Error Getting Data: ${error}`);
			}
			//self.updateStatus(InstanceStatus.Error)
			// Cleanup polling
			if (self.config.continuePolling !== true) {
				self.stopTrackingPolling()
			}
		}
	},

	async sendTrackingCommand(base, cmd) {
		let self = this;

		let command = `${base}?${cmd}`;

		let result = await self.sendTrackingRequest(command);

		//do something with data
		try {
			if (result && result.response && result.response.data) {
				let data = result.response.data;

				try {
					let str_raw = String(data)
					//don't particularly care about the response here I guess
				}
				catch(error) {
					if (self.config.verbose) {
						self.log('error', `Error Getting Data: ${error}`);
					}
					//self.updateStatus(InstanceStatus.Error)
				}
			}
			else {
				if (!self.errorTrackingCount) {
					if (self.config.verbose) {
						self.log('error', `Error Sending Tracking Command: No response received from server. Is the Camera Online? Are you running the Auto Tracking Add-On?`);
					}
					//self.updateStatus(InstanceStatus.ConnectionFailure)
				}

				// Cleanup polling
				if (self.config.continuePolling !== true) {
					self.stopTrackingPolling()
				}

				self.errorTrackingCount++;
			}
		}
		catch(error) {
			if (self.config.verbose) {
				self.log('error', `Error Sending Tracking Command: ${error}`);
			}
			//self.updateStatus(InstanceStatus.Error)
			// Cleanup polling
			if (self.config.continuePolling !== true) {
				self.stopTrackingPolling()
			}
		}
	}
}
