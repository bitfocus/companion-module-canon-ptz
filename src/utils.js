const { MODELS, SERIES_SPECS } = require('./models.js')

module.exports = {
	//Resolve the configured or camera-reported model name to its SERIES_SPECS
	//profile. Canon's c.<c>.type spelling doesn't always match the id in
	//MODELS -- rev 011 writes the XF605 with no hyphen, while MODELS has
	//"Canon XF-605" -- so fall back to a normalised comparison before giving
	//up. An unknown model must degrade to the "Other" profile: dereferencing
	//the miss is what crashed the module once per poll in #87.
	resolveSeries: function (model) {
		let self = this;

		let series = '';

		if (model !== '' && model !== undefined) {
			let match = MODELS.find((MODEL) => MODEL.id == model);

            if (match === undefined) {
				const normalise = (name) => String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
				match = MODELS.find((MODEL) => normalise(MODEL.id) === normalise(model));

				if (match !== undefined) {
					self.log('debug', `Model '${model}' matched '${match.id}' after normalising the name.`);
				}
			}

			if (match !== undefined) {
				series = match.series;
			}
			else {
				if (!self.unknownModelLogged) {
					self.log('warn', `Unrecognised camera model '${model}'. Falling back to the 'Other' profile -- please report this so it can be added.`);
					self.unknownModelLogged = true;
				}
				series = 'Other';
			}
		}

		return series;
	},

	//The profile for a series, or the "Other" profile when it has none of its own
	seriesSpec: function (series) {
		if (series === 'Auto' || series === 'Other' || series === '') {
			return SERIES_SPECS.find((SPEC) => SPEC.id == 'Other');
		}

		return SERIES_SPECS.find((SPEC) => SPEC.id == series)
			|| SERIES_SPECS.find((SPEC) => SPEC.id == 'Other');
	},

	runCustomTrace: function(loop, loopMode, repeatCount, position, direction) {
		let self = this;

		//check that the position is still within the bounds of the array
		if (position > self.customTracePresetArray.length - 1 || position < 0) {
			//we've reached the bounds of the array, so check the loop mode to know what to do next
			if (loopMode == 'normal') {
				direction = 'forward';
				position = 0;
			}
			else if (loopMode == 'pendulum') {
				//which bound did we hit, swap direction depending on that.
				//Stepping one back from the bound is what reverses the swing.
				let last = self.customTracePresetArray.length - 1;

				if (position > last) {
					direction = 'backward';
					position = last - 1;
				}
				else if (position < 0) {
					direction = 'forward';
					position = 1;
				}

				//With two presets the turn lands on the opposite end, which is
				//correct; with one there is nowhere to swing to, so stay put.
				//Clamping here rather than special-casing the two-preset turn,
				//which is what used to send it straight back out again (#33).
				if (position > last) {
					position = last;
				}
				else if (position < 0) {
					position = 0;
				}
			}
		}

		let presetObj = self.customTracePresetArray[position];

		if (presetObj) {
			let cmd = 'p=' + presetObj.preset; //preset
			cmd += '&p.ptztime=' + presetObj.time;
			self.sendPTZ(self.ptzCommand, cmd);

			self.data.presetLastUsed = presetObj.preset;

			self.checkVariables();
			self.checkFeedbacks();

			//now determine if we need to loop or not, and if so, wait for the preset to finish and then loop
			if (self.customTraceLoop == true) //hasn't been stopped by the stop action
			{
				//get the next position
				if (direction == 'forward') {
					position++;
				}
				else if (direction == 'backward') {
					position--;
				}

				if (loop) {
					self.customTraceLoopInterval = setTimeout(self.runCustomTrace.bind(self), (presetObj.time + 100), loop, loopMode, repeatCount, position, direction);
				}
				else {
					//make sure we haven't elapsed past our loop count
					if (self.customTraceLoopCount < repeatCount) {
						self.customTraceLoopCount++;
						self.customTraceLoopInterval = setTimeout(self.runCustomTrace.bind(self), (presetObj.time + 100), loop, loopMode, repeatCount, position, direction);
					}
				}
			}
		}
		else {
			//undefined for some reason
		}
	},

	//Preset numbers arrive from text inputs that may contain variables, so they
	//can be anything at all by the time they get here
	//Step one place through an action's dropdown, starting from the value the
	//camera last reported rather than from a cached cursor position.
	//
	//The cursor approach this replaces drifted: it only resynced when polling
	//came round (5s by default), so held or rapid presses walked it past what
	//the camera had actually reached, and anything that moved the camera from
	//elsewhere -- the camera's own controls, Canon's app, a preset recall --
	//left it pointing at the wrong entry entirely.
	stepChoice: function (dropdown, currentValue, direction, steps) {
		let self = this;

		if (!Array.isArray(dropdown) || dropdown.length === 0) {
			return undefined;
		}

		let index = dropdown.findIndex((CHOICE) => CHOICE.id == currentValue);

		if (index === -1) {
			//The camera can report a value the hard-coded list doesn't hold:
			//firmware shifts the ranges, and modes like 'auto' sit outside the
			//numeric run. Snapping to the nearest entry keeps the next press
			//sensible. Leaving findIndex's -1 in place is what made the next
			//press jump to index 0 -- the gain dropping to 0 dB in #57.
			index = self.nearestChoice(dropdown, currentValue);
		}

		let distance = parseInt(steps);
		if (isNaN(distance) || distance < 1) {
			distance = 1;
		}

		let next = index + (direction === 'up' ? distance : -distance);

		if (next < 0) {
			next = 0;
		}
		else if (next > dropdown.length - 1) {
			next = dropdown.length - 1;
		}

		return dropdown[next];
	},

	//Index of the numerically closest entry, or 0 when nothing compares
	nearestChoice: function (dropdown, value) {
		const target = parseFloat(value);

		if (isNaN(target)) {
			return 0;
		}

		let best = 0;
		let bestDistance = Infinity;

		for (let i = 0; i < dropdown.length; i++) {
			const candidate = parseFloat(dropdown[i].id);

			if (isNaN(candidate)) {
				continue;
			}

			const distance = Math.abs(candidate - target);

			if (distance < bestDistance) {
				bestDistance = distance;
				best = i;
			}
		}

		return best;
	},

	//Variables arrive as strings, so a checkbox driven by one has to accept
	//whatever a user is likely to put in a custom variable
	//Look up any parameter from the last info.cgi response by name. The poll
	//stores every line it received, so anything the camera reports can be read
	//back without the module needing a dedicated field for it.
	parameterValue: function (name) {
		let self = this;

		if (!Array.isArray(self.data.info)) {
			return undefined;
		}

		const wanted = String(name).trim();

		for (let i = 0; i < self.data.info.length; i++) {
			const entry = self.data.info[i];

			if (Array.isArray(entry) && entry[0] === wanted) {
				return entry[1];
			}
		}

		return undefined;
	},

	parseBoolean: function (value) {
		if (typeof value === 'boolean') {
			return value;
		}

		const text = String(value).trim().toLowerCase();

		return text === 'true' || text === '1' || text === 'yes' || text === 'on' || text === 'enabled';
	},

	clampPreset: function (value, fallback) {
		let preset = parseInt(value);

		if (isNaN(preset)) {
			return fallback;
		}

		if (preset < 1) {
			return 1;
		}

		if (preset > 100) {
			return 100;
		}

		return preset;
	},

	stopMotionPset: function() {
		let self = this;

		if (self.motionPsetRunning == true) {
			self.log('info', 'Stopping Motion Between Two Presets.');
		}

		self.motionPsetRunning = false;
		clearTimeout(self.motionPsetTimer);
	},

	stopCustomTrace: function() {
		let self = this;

		if (self.customTraceLoop == true) {
			//this is really just for the log
			self.log('info', 'Stopping Custom Trace.');
		}

		//clear the interval anyway
		self.customTraceLoop = false;
		self.customTraceLoopCount = 0;
		clearTimeout(self.customTraceLoopInterval);
	}
}
