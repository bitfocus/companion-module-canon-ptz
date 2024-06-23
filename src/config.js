const { Regex } = require('@companion-module/base')

const { MODELS } = require('./models.js')

module.exports = {
	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value:
					"This module controls Canon cameras using the XC protocol. You can find supported models in the dropdown below.<br/>If your camera isn't in the list below, feel free to try it anyway with the option 'Other Cameras'.",
			},
			{
				type: 'bonjour-device',
				id: 'bonjourHost',
				label: 'Device',
				width: 7,
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Camera IP',
				width: 4,
				isVisible: (options) => !options['bonjourHost'],
				default: '',
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'httpPort',
				label: 'HTTP Port (Default: 80)',
				width: 3,
				isVisible: (options) => !options['bonjourHost'],
				default: 80,
				regex: Regex.PORT,
			},
			{
				type: 'static-text',
				id: 'dummy1',
				width: 12,
				label: ' ',
				value: ' ',
			},
			{
				type: 'static-text',
				id: 'modelInfo',
				width: 12,
				label: 'Camera Model',
				value: 'Please Select the camera model.',
			},
			{
				type: 'dropdown',
				id: 'model',
				label: 'Select Your Camera Model',
				width: 6,
				default: MODELS[0].id,
				choices: MODELS,
				minChoicesForSearch: 5,
			},
			{
				type: 'static-text',
				id: 'intervalInfo',
				width: 12,
				label: 'Update Interval',
				value:
					'Please enter the amount of time in milliseconds to request new information from the camera. Set to 0 to disable.',
			},
			{
				type: 'textinput',
				id: 'interval',
				label: 'Update Interval',
				width: 3,
				default: 5000,
			},
			{
				type: 'checkbox',
				id: 'continuePolling',
				label: 'Continue Polling even in error state',
				width: 3,
				default: false,
				isVisible: (configValues) => configValues.interval > 0,
			},
			{
				type: 'static-text',
				id: 'dummy2',
				width: 12,
				label: ' ',
				value: ' ',
			},
			{
				type: 'checkbox',
				id: 'enableTracking',
				label: 'Enable Auto Tracking Add-On Features',
				width: 3,
				default: false,
			},
			{
				type: 'textinput',
				id: 'trackingAddonUrl',
				label: 'Auto Tracking CGI Add-on URL',
				default: '/cgi-addon/Auto_Tracking_RA-AT001/app_ctrl/',
				isVisible: (configValues) => configValues.enableTracking == true
			},
			{
				type: 'textinput',
				id: 'trackingInterval',
				label: 'Tracking Update Interval (how often to request latest tracking data)',
				default: 250,
				isVisible: (configValues) => configValues.enableTracking == true
			},
			{
				type: 'static-text',
				id: 'Info',
				width: 12,
				label: 'Other Settings',
				value:
					'These setting can be left on the default values and should give you a consistent setup, but they are there for you to use if need be.',
			},
			{
				type: 'checkbox',
				id: 'verbose',
				width: 1,
				label: 'Verbose Mode',
				default: true,
			}
		]
	}
}
