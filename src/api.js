const { InstanceStatus } = require('@companion-module/base')

const axios = require('axios');

class API {
	constructor(config) {
		let self = this;

		const apiHost = config.host
		const apiPort = config.httpPort

		self.baseUrl = `http://${apiHost}:${apiPort}/-wvhttp-01-/`
	}

	async sendRequest(cmd) {
		let self = this;
		
		let requestUrl = self.baseUrl + cmd;
		
		try {
			const response = await axios.get(requestUrl)
			self.updateStatus(InstanceStatus.Ok);
			return {
				status: 'ok',
				response: response
			}
		} catch (err) {
			console.log(err)
			return {
				status: 'failed',
			}
		}
	}
}

module.exports = API;