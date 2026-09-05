module.exports = [
	function (context, props) {
		return {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}
	},

	//"Use variables for the save options" was a checkbox before the save options
	//could also come from the module toggles. Fold the old checkbox into the
	//save_source dropdown so existing Save Preset buttons keep their behaviour.
	function (context, props) {
		const updatedActions = []

		for (const action of props.actions) {
			if (action.actionId !== 'savePset') {
				continue
			}

			if (action.options.save_source !== undefined) {
				continue
			}

			action.options.save_source = action.options.use_variables_save ? 'variables' : 'button'
			delete action.options.use_variables_save

			updatedActions.push(action)
		}

		return {
			updatedConfig: null,
			updatedActions: updatedActions,
			updatedFeedbacks: [],
		}
	},
]
