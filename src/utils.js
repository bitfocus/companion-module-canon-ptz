module.exports = {
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
				//which bound did we hit, swap direction depending on that
				if (position >= self.customTracePresetArray.length - 1) {
					direction = 'backward';
					position = self.customTracePresetArray.length - 2;
					if (position == 0) {
						direction = 'forward';
						position = 1;
					}
				}
				else if (position < 0) {
					direction = 'forward';
					position = 1;
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