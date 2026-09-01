const { InstanceStatus } = require('@companion-module/base')

const axios = require('axios');
const crypto = require('crypto');

const md5 = (value) => crypto.createHash('md5').update(value).digest('hex');

//Parses a WWW-Authenticate header into its comma-separated key="value" pairs
function parseChallenge(header) {
	const scheme = header.split(' ')[0];
	const params = {};

	const pattern = /(\w+)=(?:"([^"]*)"|([^,\s]+))/g;
	let match;
	while ((match = pattern.exec(header)) !== null) {
		params[match[1].toLowerCase()] = match[2] !== undefined ? match[2] : match[3];
	}

	return { scheme, params };
}

class API {
	constructor(config) {
		let self = this;

		const apiHost = config.host
		const apiPort = config.httpPort

		self.baseUrl = `http://${apiHost}:${apiPort}/-wvhttp-01-/`

		self.username = config.username || ''
		self.password = config.password || ''

		//Kept between requests so a live challenge can be reused instead of
		//paying a 401 round trip on every poll
		self.challenge = null
		self.nonceCount = 0
	}

	get hasCredentials() {
		return this.username !== '' && this.password !== '';
	}

	//RFC 2617 Digest, which is what the camera's Livescope server asks for.
	//axios handles Basic on its own but has no Digest support.
	digestHeader(method, path) {
		let self = this;

		const { params } = self.challenge;

		self.nonceCount++;
		const nc = String(self.nonceCount).padStart(8, '0');
		const cnonce = crypto.randomBytes(8).toString('hex');

		const ha1 = md5(`${self.username}:${params.realm}:${self.password}`);
		const ha2 = md5(`${method}:${path}`);

		let response;
		let qop = '';

		if (params.qop) {
			//the camera may offer several; auth is the one we implement
			qop = params.qop.split(',').map((q) => q.trim()).includes('auth') ? 'auth' : '';
		}

		if (qop === 'auth') {
			response = md5(`${ha1}:${params.nonce}:${nc}:${cnonce}:auth:${ha2}`);
		}
		else {
			response = md5(`${ha1}:${params.nonce}:${ha2}`);
		}

		let header = `Digest username="${self.username}", realm="${params.realm}"`
			+ `, nonce="${params.nonce}", uri="${path}", response="${response}"`;

		if (params.opaque) {
			header += `, opaque="${params.opaque}"`;
		}

		if (qop === 'auth') {
			header += `, qop=auth, nc=${nc}, cnonce="${cnonce}"`;
		}

		return header;
	}

	authHeaderFor(path) {
		let self = this;

		if (!self.hasCredentials || self.challenge === null) {
			return undefined;
		}

		if (self.challenge.scheme.toLowerCase() === 'digest') {
			return self.digestHeader('GET', path);
		}

		const basic = Buffer.from(`${self.username}:${self.password}`).toString('base64');
		return `Basic ${basic}`;
	}

	async sendRequest(cmd) {
		let self = this;

		let requestUrl = self.baseUrl + cmd;
		//the digest uri is the path, not the whole URL
		let path = new URL(requestUrl).pathname + new URL(requestUrl).search;

		const attempt = async () => {
			const headers = {};
			const auth = self.authHeaderFor(path);

			if (auth !== undefined) {
				headers.Authorization = auth;
			}

			return await axios.get(requestUrl, {
				headers,
				//a 401 is a challenge to answer, not a transport failure
				validateStatus: (status) => (status >= 200 && status < 300) || status === 401,
			});
		}

		try {
			let response = await attempt();

			//Answer a challenge once, then retry. Cameras with guest access
			//never get here, so the no-credentials path is unchanged.
			if (response.status === 401 && self.hasCredentials) {
				const header = response.headers['www-authenticate'];

				if (header) {
					self.challenge = parseChallenge(header);
					self.nonceCount = 0;
					response = await attempt();
				}
			}

			if (response.status === 401) {
				//a stale challenge would otherwise be replayed forever
				self.challenge = null;

				return {
					status: 'failed',
					unauthorized: true,
				}
			}

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
	}
}

module.exports = API;
