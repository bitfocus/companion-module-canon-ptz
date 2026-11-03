
const { InstanceStatus } = require('@companion-module/base')

const API = require('./api')

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

//Settings the module reads that Table 3-4 leaves out. The app supports them (they
//appear in get_capability and validate_config), but they are asked for separately so
//that an app version that rejects one can't take the documented keys down too.
const TRACKING_CONFIG_EXTRA_KEYS = [
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

//What to log for a failed tracking request: the app's own status_code and description
//when it answered with one (e.g. E4_003 when the app isn't started), else the fallback
function trackingErrorText(result, fallback) {
	let errorResponse = result && result.errorResponse;
	let data = errorResponse && errorResponse.data;

	if (data && typeof data === 'object' && data.status_code) {
		return `${data.status_code} ${data.description} (HTTP ${errorResponse.status})`;
	}

	return fallback;
}

const NO_RESPONSE = 'No response received from server. Is the Camera Online? Are you running the Auto Tracking Add-On?';

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

		//Reuse one connection so its auth challenge carries over between polls,
		//rebuilding it only when the settings it was made from change
		let trackingApiKey = [self.config.host, self.config.httpPort, self.config.trackingAddonUrl, self.config.username, self.config.password].join('|');

		if (self.trackingApi === undefined || self.trackingApiKey !== trackingApiKey) {
			self.trackingApi = new API(self.config, self.config.trackingAddonUrl);
			self.trackingApiKey = trackingApiKey;
		}

		return await self.trackingApi.sendRequest(cmd);
	},

	trackingUnauthorized() {
		let self = this;

		if (!self.errorTrackingCount) {
			self.log('error', 'The camera rejected the login for the Auto Tracking Add-On. Check the username and password in the connection config, or enable guest access on the camera.');
			self.updateStatus(InstanceStatus.AuthenticationFailure)
		}

		self.errorTrackingCount++;
	},

	async getCameraTrackingConfig() {
		let self = this;

		let cmd = `get_config.cgi?keys=${TRACKING_CONFIG_KEYS.join(',')}`;
		let extraCmd = `get_config.cgi?keys=${TRACKING_CONFIG_EXTRA_KEYS.join(',')}`;
		//One after the other: both share a Digest nonce count, and the camera may
		//reject a request whose count arrives out of order
		let result = await self.sendTrackingRequest(cmd);
		let extraResult = await self.sendTrackingRequest(extraCmd);

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

					//The extra keys are optional: if the app rejects them, keep whatever was there before
					let extraConfig = parseTrackingConfig(extraResult) || {};

					self.data.trackingConfig = Object.assign({}, self.data.trackingConfig, extraConfig, config);
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
			else if (result && result.unauthorized === true) {
				self.trackingUnauthorized()
			}
			else {
				if (!self.errorTrackingCount) {
					if (self.config.verbose) {
						self.log('error', `Error Getting Tracking Config Data: ${trackingErrorText(result, NO_RESPONSE)}`);
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
			else if (result && result.unauthorized === true) {
				self.trackingUnauthorized()
			}
			else {
				if (!self.errorTrackingCount) {
					if (self.config.verbose) {
						self.log('error', `Error Getting Tracking Information Data: ${trackingErrorText(result, NO_RESPONSE)}`);
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
			else if (result && result.unauthorized === true) {
				self.trackingUnauthorized()
			}
			else {
				if (!self.errorTrackingCount) {
					if (self.config.verbose) {
						self.log('error', `Error Sending Tracking Command: ${trackingErrorText(result, NO_RESPONSE)}`);
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
