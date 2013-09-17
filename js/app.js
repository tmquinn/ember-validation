App = Ember.Application.create();

App.Router.map(function () {
	// put your routes here
});

LGTM.configure('defer', Ember.RSVP.defer);

App.MyDataValidator = LGTM.validator()
	.validates('email')
		.required('Email is required')
			.email('Enter a Valid Email')
	.validates('mobileNumber')
		.when('noMobileNumber', function (noMobileNumber) {
			return !noMobileNumber;
		})
			.required('Enter Mobile Number')
				.using(function (number) {
					if (number) {
						var normalizedNumber = number.replace(/[^\d]/g, '');
						return (normalizedNumber && normalizedNumber.length === 10);
					} else {
						return false;
					}
				}, 'Enter a Valid Phone number')
	.build();

App.IndexRoute = Ember.Route.extend({
	model: function () {
		return this.store.createRecord('my-data', {id: 1, noMobileNumber: false});
	}
});

App.MyDataModel = DS.Model.extend({
	email: DS.attr({ type: 'string' }),
	mobileNumber: DS.attr({ type: 'string'}),
	noMobileNumber: DS.attr({ type: 'boolean' })
});

App.IndexController = Ember.ObjectController.extend({

	mobileNumberPlaceholder: 'Mobile Phone Number',

	errors: Ember.Object.create({}),

	noMobileNumber: function (key, value) {

		var model = this.get('model');
		if (value === undefined) {
			return model.get(key);
		} else {
			model.set(key, value);
			if (value) {
				model.set('mobileNumber', '');
				this.set('mobileNumberPlaceholder', 'None');
			} else {
				this.set('mobileNumberPlaceholder', 'Mobile Phone Number');
			}
			return value;
		}
	}.property('model.noMobileNumber'),

	actions: {
		validateMe: function () {
			var model = this.get('model');

			App.MyDataValidator.validate(model)
				.then(function (results) {
					var errorsResults = results.errors;

					this.set('errors', Ember.Object.create());

					var errors = this.get('errors');

					if (!results.valid) {
						for (errorField in errorsResults) {
							if (errorsResults.hasOwnProperty(errorField)) {
								console.log(errorField, errorsResults[errorField]);
								errors.set(errorField, errorsResults[errorField][0]);
							}
						}
					}
				}.bind(this),
				// Fail
				function () {
					console.log('fail', arguments);
				});

		}
	}
});

App.ValidateField = Ember.TextField.extend({
	classNames: ['validate-field'],

	errorMsg: function (key, value) {
		try {
			this.$().tooltip('destroy');
		} catch (err) {
			console.log(err);
		}

		if (value) {
			this.$().tooltip({
				title: value,
				trigger: 'manual'
			});

			this.$().tooltip('show');
			return value;
		} else {

			return '';
		}
	}.property()
});