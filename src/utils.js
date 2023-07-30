module.exports = {
	runCustomTrace: function(home, homeTime, transition, time, loop, loopCount) {
		let self = this;

		self.presetRecallMode = 'normal';
		self.data.presetRecallMode = 'normal';
		
		cmd = 'p=' + home; //home preset
		self.sendPTZ(self.ptzCommand, cmd);
		self.data.presetLastUsed = home;
		self.checkVariables();
		self.checkFeedbacks();

		//need to wait for the preset to finish before we can transition
		self.customTraceLoopInterval = setTimeout(self.runCustomTraceTransition.bind(self), (homeTime * 1000), home, homeTime, transition, time, loop, loopCount); //wait one second to give camera time to move
	},

	runCustomTraceTransition: function(home, homeTime, transition, time, loop, loopCount) {
		let self = this;

		self.presetRecallMode = 'time';
		self.data.presetRecallMode = 'time';
		cmd = 'p=' + transition; //transition preset
		cmd += '&p.ptztime=' + time;
		self.data.presetLastUsed = transition;
		self.sendPTZ(self.ptzCommand, cmd);
		self.checkVariables();
		self.checkFeedbacks();

		//now determine if we need to loop or not, and if so, wait for the preset to finish and then loop
		if (self.customTraceLoop == true) //hasn't been stopped by the stop action
		{
			if (loop) {
				self.customTraceLoopInterval = setTimeout(self.runCustomTrace.bind(self), (time + 100), home, homeTime, transition, time, loop, loopCount);
			}
			else {
				//make sure we haven't elapsed past our loop count
				if (self.customTraceLoopCount < loopCount) {
					self.customTraceLoopCount++;
					self.customTraceLoopInterval = setTimeout(self.runCustomTrace.bind(self), (time + 100), home, homeTime, transition, time, loop, loopCount);
				}
			}
		}
	}
}