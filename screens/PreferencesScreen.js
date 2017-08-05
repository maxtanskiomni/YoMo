import React from 'react';
import { ScrollView } from 'react-native';
import { connectStyle } from '@shoutem/theme';
import { Title,Image, View, Text, Screen, TouchableOpacity, NavigationBar, Icon } from '@shoutem/ui';

import {observer} from 'mobx-react';
import {action, runInAction,observable} from 'mobx';

import { AccountsStore,UserStore,PreferencesStore } from '../stores';

import TextInput from '../components/TextInput';

import { Actions } from 'react-native-router-flux';

import { firebase } from '../utilities/firebase_api'

const Dimensions = require('Dimensions');
const window = Dimensions.get('window');

@observer
class PreferencesScreen extends React.Component {

  updatePreference(data){
    firebase.updateFB('preferences', PreferencesStore.firebase_key, data);
  }

  render() {
    const styles = this.props.style;
    const preferences = PreferencesStore.preferences;

    var on = (<Image source={require('../assets/icons/check-outline.png')} style={{height:30,width:30,tintColor:'#49A94D'}} />);
    var off = (<Image source={require('../assets/icons/outline.png')} style={{height:30,width:30,tintColor:'#49A94D'}} />);

		let notificationComponents = (
			<View style={styles.accountsSection}>
      <Text style={styles.sectionTitle}>Notification Settings</Text>
				<TouchableOpacity style={styles.accountButton} onPress={()=>this.updatePreference({location_notifs: !preferences.location_notifs})}>
					<Text style={styles.accountText}>Location based notifications</Text>
          <View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
            {preferences.location_notifs ? on : off}
          </View>
					<View />
				</TouchableOpacity>

        <TouchableOpacity style={styles.accountButton} onPress={()=>this.updatePreference({push_notifs: !preferences.push_notifs})}>
          <Text style={styles.accountText}>Push notifications</Text>
          <View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
            {preferences.push_notifs ? on : off}
          </View>
          <View />
        </TouchableOpacity>
      </View>
		);

    let privacyComponents = (
      <View style={styles.accountsSection}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        <TouchableOpacity style={styles.accountButton} onPress={()=>this.updatePreference({location_autodetect: !preferences.location_autodetect})}>
          <Text style={styles.accountText}>Autodetect location</Text>
          <View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
            {preferences.location_autodetect ? on : off}
          </View>
          <View />
        </TouchableOpacity>

        <TouchableOpacity style={styles.accountButton} onPress={()=>this.updatePreference({facebook_checkin: !preferences.facebook_checkin})}>
          <Text style={styles.accountText}>Facebook checkin</Text>
          <View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
            {preferences.facebook_checkin ? on : off}
          </View>
          <View />
        </TouchableOpacity>
      </View>
    );

    return (
      <Screen style={styles.container}>

				<View style={{height:60}}/>

        <ScrollView
          ref={(scrollView) => { _scrollView = scrollView; }}
          automaticallyAdjustContentInsets={false}
          scrollEventThrottle={200}
          style={styles.scrollView}>

          {this.props.mode === 'notifs' && notificationComponents}
          {this.props.mode === 'privacy' && privacyComponents}

				</ScrollView>

      </Screen>
    );
  }

}

const styles = {
  container: {
    backgroundColor:"#49A94D",
    flex: 1,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    paddingBottom:'5%'
  },

  scrollView: {
    flex:1,
		width:window.width
  },

	sectionTitle:{
    color:'#cceadd',
    fontSize:18,
		textAlign:'left',
		width:'100%',
		padding:10
	},

	accountsSection:{
		width:'100%',
		flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
		borderBottomWidth:0,
		borderColor:'#abddc7',
		borderStyle:'solid',
		padding:10
	},

	accountButton:{
		width:'90%',
		height:54,
		flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
		backgroundColor:'#49734B',
		marginBottom:8
	},

  accountText:{
		color:'#eef8f3',
		paddingLeft:15,
    flex: 1,
  },



};

export default connectStyle('com.yomo.PreferencesScreen', styles)(PreferencesScreen);
