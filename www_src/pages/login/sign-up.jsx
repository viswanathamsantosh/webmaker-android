var React = require('react/addons');
var api = require('../../lib/api');
var FormInput = require('./form-input.jsx');

// <SignUp />
// Component for the Sign Up/Create user form. See Login view for usage.
var SignUp = React.createClass({

  mixins: [React.addons.LinkedStateMixin, require('../../lib/validators')],

  // Props:
  //   show
  //     boolean
  //     Shows the entire component if true, hides if false
  //   setParentState
  //     function(state)
  //     Calls setState on parent component (Login) given a state object.
  //     Useful for setting the loading or mode state of the Login view.
  //
  getDefaultProps: function () {
    return {};
  },

  // State:
  //   globalError
  //     string or boolean
  //     Indicates whether or not a an error was received from the server.
  //   username
  //   email
  //   password
  //     string
  //     These store state for the form input fields
  //   feedback
  //     boolean
  //     Stores state for feedback checkbox

  getInitialState: function () {
    return {
      globalError: false,
      feedback: false
    };
  },

  // Consumed by validationMixin
  // and used to generate form fields
  fields: [
    {
      name: 'username',
      label: 'Username',
      required: true,
      validations: 'username'
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      validations: 'email'
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      validations: ['passwordLength', 'lowerCase', 'upperCase', 'numbers']
    }
  ],

  // Called when the form is submitted
  // Triggers an api call via api.signUp
  // If an error is received, sets state.globalError
  // If success:
  //    1. resets form
  //    2. caches user session in Android
  //    3. redirects to /main
  onSubmit: function (e) {
    e.preventDefault();

    var errors = this.getValidationErrors();
    if (Object.keys(errors).length > 0) {
      return;
    }

    var options = {
      username: this.state.username,
      password: this.state.password,
      email: this.state.email,
      feedback: this.state.feedback
    };

    this.props.setParentState({loading: true});

    api.signUp({json: options}, (err, data) => {
      this.props.setParentState({loading: false});
      if (err) {
        this.setState({globalError: err.message || 'Something went wrong.' });
        return;
      }

      this.replaceState(this.getInitialState());

      if (window.Android) {
        window.Android.setUserSession(JSON.stringify(data));
        window.Android.setView('/main');
      }
    });
  },

  // Useful for toggling state via a checkbox
  // e.g. toggleState('foo') will set this.state.foo = !this.state.foo
  toggleState: function (id) {
    return () => {
      var state = {};
      state[id] = !this.state[id];
      this.setState(state);
    };
  },

  // Changes parent mode to show sign in form
  changeMode: function (e) {
    e.preventDefault();
    this.props.setParentState({mode: 'sign-in'});
  },

  render: function () {

    // getValidationErrors is from validationMixin
    var errors = this.getValidationErrors();
    var isValid = Object.keys(errors).length === 0;

    return (<form hidden={!this.props.show} className="editor-options" onSubmit={this.onSubmit}>

      {this.fields.map(field => {
        return <FormInput {...field}
          errors={errors[field.name]}
          valueLink={this.linkState(field.name)}/>;
      })}

      <div className="form-group">
        <label className="checkbox">
          <input type="checkbox" checked={this.state.feedback} onChange={this.toggleState('feedback')} />
          <span className="checkbox-ui" />
          <span>Email me updates about Webmaker</span>
        </label>
      </div>
      <div className="form-group">
        <button className="btn btn-block" onClick={this.onSubmit} disabled={!isValid}>
          Join Webmaker
        </button>
        <div className="error" hidden={!this.state.globalError}>
          {this.state.globalError}
        </div>
        <p className="by-joining">By joining, I agree to Mozilla Webmaker&rsquo;s <a href="#">Terms</a> and <a href="#">Privacy Policy</a></p>
      </div>
      <div className="form-group text-center text-larger already-joined">
        Already joined? <a href="#" onClick={this.changeMode}>Sign in</a>
      </div>
    </form>);
  }
});

module.exports = SignUp;
