import React, {Component} from 'react';
import { Alert, StyleSheet, Text, View, StatusBar, TouchableOpacity, Platform, AppState } from 'react-native';

import Expo,{ Constants, Location, Permissions } from 'expo';
import cacheAssetsAsync from './utilities/cacheAssetsAsync';

import { Image,Screen } from '@shoutem/ui';

import LoginScreen from './screens/LoginScreen';
import PaymentScreen from './screens/PaymentScreen';
import AccountScreen from './screens/AccountScreen';
import SettingsScreen from './screens/SettingsScreen';
import RegisterScreen from './screens/RegisterScreen';
import HistoryScreen from './screens/HistoryScreen';
import PreferencesScreen from './screens/PreferencesScreen';
import DataScreen from './screens/DataScreen';
import PinScreen from './screens/PinScreen';
import ForgotScreen from './screens/ForgotScreen';
import SearchScreen from './screens/SearchScreen';

import { AccountsStore,UserStore,TransactionsStore,PreferencesStore,GeofencesStore,OrganizationStore } from './stores';

import {Actions, Scene, Router} from 'react-native-router-flux';
import { firebase } from './utilities/firebase_api';
import backgroundGeofence from './utilities/background_geofence'

import {observer} from 'mobx-react';

import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";

import {
  setCustomView,
  setCustomTextInput,
  setCustomText,
  setCustomImage,
  setCustomTouchableOpacity
} from 'react-native-global-props';

const customTextProps  = {
  style: {
    fontFamily:'quicksand',
    fontSide:20
  }
};

const navBack = (
  <TouchableOpacity>
    <Image
      style={{width: 30, height: 30,tintColor:'#fff'}}
      source={require('./assets/icons/arrow_left_white.png')} />
  </TouchableOpacity>
);

@observer
class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      appIsReady: false,
      locked: false,
    };

    this.onNavigate = this.onNavigate.bind(this);

  }

  componentWillMount() {
    this.loadAssetsAsync();
    firebase.addAuthObserver();
    setCustomText(customTextProps);
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount () {
    debugger
    backgroundGeofence.onTerminate();
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (currentAppState) => {
    if(currentAppState === 'background' && UserStore.logged_in && !this.state.locked){
      Actions.pin({is_active: true});
      this.state.locked = true;
    }else if(currentAppState === 'active'){
      this.state.locked = false;
      Location.getCurrentPositionAsync({});
    }
  }

  async loadAssetsAsync() {
    try {
      await cacheAssetsAsync({
        images: [
          require('./assets/images/login-background.jpg'),
          require('./assets/icons/date_range_white.png'),
          require('./assets/icons/history_white.png'),
          require('./assets/icons/person_white.png'),
          require('./assets/icons/backspace_white.png'),
          require('./assets/icons/arrow_left_white.png'),
          require('./assets/icons/eye-off.png'),
          require('./assets/icons/eye.png'),
          require('./assets/icons/plus.png'),
					require('./assets/icons/lock-outline.png'),
					require('./assets/icons/account-box-outline.png'),
					require('./assets/icons/alert-circle-outline.png'),
          require('./assets/icons/check.png'),
          require('./assets/icons/outline.png'),
          require('./assets/icons/check-outline.png'),
          require('./assets/icons/search_white.png'),
        ],
        fonts: [
          { 'Rubik-Regular': require('./assets/fonts/Rubik-Regular.ttf') },
          { 'rubicon-icon-font': require('./assets/fonts/rubicon-icon-font.ttf') },
          { 'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf') },
          { 'quicksand': require('./assets/fonts/Quicksand-Regular.ttf') },
          { 'quicksand-bold': require('./assets/fonts/Quicksand-Bold.ttf') },
          { 'raleway': require('./assets/fonts/Raleway-Regular.ttf') },
          { 'yellowtail': require('./assets/fonts/Yellowtail-Regular.ttf') }
        ],
      });
      await this.getLocationAsync();
    } catch (e) {
      console.log("this is the error", e);
      console.warn(
        'There was an error caching assets (see: main.js), perhaps due to a ' +
          'network timeout, so we skipped caching. Reload the app to try again.'
      );
      console.log(e.message);
    } finally {
      this.setState({ appIsReady: true });
    }
  }

  async getLocationAsync() {
    GeofencesStore.get();
    const { Location, Permissions } = Expo;
    const { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status === 'granted' && Platform.OS === 'android') {

        LocationServicesDialogBox.checkLocationServicesIsEnabled({
            message: "<h2>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/>",
            ok: "YES",
            cancel: "NO"
        }).then(function(success) {
          console.log(success)
        }, function(error) {
          console.log(error)
        }, { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 });


    } else {
      if(Platform.OS === 'android'){
        throw new Error('Location permission not granted');
      }
    }
  }

  onNavigate(routeName,action = 'push') {
    history[action](routeName);
  }

  render() {

    if (!this.state.appIsReady || !UserStore.checker) {
      return <Expo.AppLoading />;
    }

    let scenes = Actions.create(
      <Scene
      key={'root'}
      leftButtonIconStyle={{tintColor:'#fff'}}
      titleStyle={{fontFamily:'quicksand',color:'#fff',fontSize:22}}
      navigationBarStyle={{backgroundColor:'transparent',borderBottomWidth:0}} >

        <Scene
          key={'login'}
          title={'Login'}
          hideNavBar={true}
          initial={!UserStore.logged_in}
          component={LoginScreen} />

        <Scene
          title={'Home'}
          key={'payment'}
          hideNavBar={true}
          type={'reset'}
          component={PaymentScreen} />

        <Scene
          key={'register'}
          title={'Register'}
          hideNavBar={false}
          component={RegisterScreen}  />

        <Scene
          key={'settings'}
          navBack={navBack}
          hideNavBar={false}
          component={SettingsScreen} />

        <Scene
          key={'account'}
          title={'Account'}
          hideNavBar={true}
          component={AccountScreen} />

        <Scene
          key={'history'}
          title={'History'}
          hideNavBar={false}
          component={HistoryScreen} />

        <Scene
          key={'preferences'}
          title={'Preferences'}
          hideNavBar={false}
          component={PreferencesScreen} />

        <Scene
          key={'data'}
          hideNavBar={false}
          component={DataScreen} />

        <Scene
          key={'pin'}
          hideNavBar={true}
          initial={UserStore.logged_in}
          component={PinScreen} />

        <Scene
          key={'forgot'}
          title={'Forgot Password'}
          hideNavBar={false}
          component={ForgotScreen} />

        <Scene
          key={'search'}
          title={'Search'}
          hideNavBar={false}
          component={SearchScreen} />

      </Scene>
    );

    return (
      <Screen>
        <StatusBar hidden={true} animated />

        <Router scenes={scenes}/>

      </Screen>

    );
  }

}

// const AppNav = StackNavigator({
//   Login: {screen: Login}
// });
  // ForgotPassword: {screen: ForgotPassword},
  // Signup: {screen: Signup},
  // Monetary: {screen: Monetary},
  // UserProfile: {screen: UserProfile},
  // Account1: {screen: Account1},
  // Account2: {screen: Account2},
  // Settings: {screen: Settings},
  // History: {screen: Historical},
  // HistoryItem: {screen: HistoryItem}

  Expo.registerRootComponent(App);
