import React, { Component } from 'react';
import {
  WebView,
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  AlertIOS,
} from'react-native';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';
import Expense from './Expense';
import CookieManager from 'react-native-cookies';
import LoggedIn from '../components/LoggedIn';

// const LOGIN_URL = "http://localhost:3000/login/";
// const HOME_URL = "http://localhost:3000/";
const LOGIN_URL = 'https://app.chromeriver.com/login?ui=hg';
const HOME_URL = 'https://app.chromeriver.com/index';

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  }
});

class ReactNativeLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      loadedCookie: false
    };
  }

  componentWillMount () {
    CookieManager.get(HOME_URL, (err, cookie) => {
      let isAuthenticated;
      // If it differs, change `cookie.remember_me` to whatever the name for your persistent cookie is!!!
      if (cookie && cookie.hasOwnProperty('JSESSIONID')) {
        isAuthenticated = true;
      }
      else {
        isAuthenticated = false;
      }

      this.setState({
        loggedIn: isAuthenticated,
        loadedCookie: true
      });
    });
  }

  onNavigationStateChange (navState) {
    // If we get redirected back to the HOME_URL we know that we are logged in. If your backend does something different than this
    // change this line.
    if (navState.url == HOME_URL) {
      this.setState({
        loggedIn: true,
      });
    }
  }

  render () {
    // If we have completed loading the cookie choose to show Login WebView or the LoggedIn component, else just show an empty View.
    if (this.state.loadedCookie) {
      if (this.state.loggedIn) {
        return (
          <Expense/>
        );
      }
      else {
        return (
          <View style={[styles.container]}>
            <WebView
              ref={'webview'}
              automaticallyAdjustContentInsets={false}
              style={styles.webView}
              source={{uri: LOGIN_URL}}
              javaScriptEnabled={true}
              onNavigationStateChange={this.onNavigationStateChange.bind(this)}
              startInLoadingState={true}
              scalesPageToFit={true}
            />
          </View>
        );
      }
    }
    else {
      return (
        <View></View>
      );
    }
  }
}

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const store = createStoreWithMiddleware(rootReducer);

/* const t = require('tcomb-form-native');

var STORAGE_KEY = 'id_token';

var Form = t.form.Form;

var Person = t.struct({
  username: t.String,
  password: t.String
});

const options = {};

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <ReactNativeLogin />
      </Provider>
    );
  }
}

const Login = React.createClass({

  async _onValueChange(item, selectedValue) {
    try {
      await AsyncStorage.setItem(item, selectedValue);
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  },

  async _getProtectedQuote() {
    var DEMO_TOKEN = await AsyncStorage.getItem(STORAGE_KEY);
    fetch("http://localhost:3001/api/protected/random-quote", {
      method: "GET",
      headers: {
        'Authorization': 'Bearer ' + DEMO_TOKEN
      }
    })
      .then((response) => response.text())
      .then((quote) => {
        AlertIOS.alert(
          "Chuck Norris Quote:", quote)
      })
      .done();
  },

  _userSignup() {
    var value = this.refs.form.getValue();
    if (value) { // if validation fails, value will be null
      fetch("http://localhost:3001/users", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: value.username,
          password: value.password,
        })
      })
        .then((response) => response.json())
        .then((responseData) => {
          this._onValueChange(STORAGE_KEY, responseData.id_token),
            AlertIOS.alert(
              "Signup Success!",
              "Click the button to get a Chuck Norris quote!"
            )
        })
        .done();
    }
  },

  _userLogin() {
    var value = this.refs.form.getValue();
    if (value) { // if validation fails, value will be null
      fetch("http://localhost:3001/sessions/create", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: value.username,
          password: value.password,
        })
      })
        .then((response) => response.json())
        .then((responseData) => {
          AlertIOS.alert(
            "Login Success!",
            "Click the button to get a Chuck Norris quote!"
          ),
            this._onValueChange(STORAGE_KEY, responseData.id_token)
        })
        .done();
    }
  },

  async _userLogout() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      AlertIOS.alert("Logout Success!")
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  },

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <Text style={styles.title}>Signup/Login below for Chuck Norris Quotes!</Text>
        </View>
        <View style={styles.row}>
          <Form
            ref="form"
            type={Person}
            options={options}
          />
        </View>
        <View style={styles.row}>
          <TouchableHighlight style={styles.button} onPress={this._userSignup} underlayColor='#99d9f4'>
            <Text style={styles.buttonText}>Signup</Text>
          </TouchableHighlight>
          <TouchableHighlight style={styles.button} onPress={this._userLogin} underlayColor='#99d9f4'>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableHighlight>
          <TouchableHighlight style={styles.button} onPress={this._userLogout} underlayColor='#99d9f4'>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableHighlight>
        </View>
        <View style={styles.row}>
          <TouchableHighlight onPress={this._getProtectedQuote} style={styles.button}>
            <Text style={styles.buttonText}>Get a Chuck Norris Quote!</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 30,
    alignSelf: 'center',
    marginBottom: 30
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'center'
  },
  button: {
    height: 36,
    backgroundColor: '#48BBEC',
    borderColor: '#48BBEC',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
});
*/