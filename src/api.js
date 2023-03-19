const axios = require('axios');

class API {
	constructor(config) {
		const apiHost = config.host
		const apiPort = config.httpPort

		this.baseUrl = `http://${apiHost}:${apiPort}/-wvhttp-01-/`
	}

	async sendRequest(cmd) {
		let requestUrl = this.baseUrl + cmd;
		
		try {
			const response = await axios.get(requestUrl)
			if (!response.ok) {
				return {
					status: 'failed',
				}
			}
			return {
				status: 'success',
				response: await response,
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