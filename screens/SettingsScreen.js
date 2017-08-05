import React from 'react';
import { ScrollView } from 'react-native';
import { connectStyle } from '@shoutem/theme';
import { Title,Image, View, Text, Screen, TouchableOpacity, NavigationBar, Icon } from '@shoutem/ui';

import { MaterialIcons } from '@expo/vector-icons';

import {observer} from 'mobx-react';
import {action, runInAction,observable} from 'mobx';

import { AccountsStore,UserStore,SubscriptionsStore,GeofencesStore } from '../stores';

import TextInput from '../components/TextInput';

import { Actions } from 'react-native-router-flux';

import { firebase } from '../utilities/firebase_api'

const Dimensions = require('Dimensions');
const window = Dimensions.get('window');

@observer
class SettingsScreen extends React.Component {

  logout = () => {
    firebase.signOut()
    Actions.login({type: 'reset'})
  }

  render() {
    const styles = this.props.style;
    const { acs, navBack, user } = this.props;
    const accounts = AccountsStore.accounts;
    const subscriptions = SubscriptionsStore.subscriptions;

		let accountComponents = accounts.map((a,idx) => {
        var default_icon = (<Image source={require('../assets/icons/check-outline.png')} style={{height:30,width:30,tintColor:'#49A94D'}} />);
        var letter_icon = (<Text style={{fontSize:22,color:'#49A94D'}}>{a.bank[0]}</Text>);
        var icon  = idx === UserStore.user_data.default_account ? default_icon : letter_icon;
			return(
				<TouchableOpacity key={idx} style={styles.accountButton} onPress={()=>Actions.data({mode:'bank', idx:idx, fbKey: AccountsStore.firebase_keys[idx], reference:'accounts',})}>
					<View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid',}}>
						{icon}
					</View>
					<Text style={styles.accountText}>{a.bank}</Text>
					<View />
				</TouchableOpacity>
			);
		});

		if (accounts.length <= 3) {
			accountComponents.push(
				<TouchableOpacity key={accounts.length} style={styles.accountButton} onPress={Actions.account}>
					<View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid',}}>
						<Image source={require('../assets/icons/plus.png')} style={{height:30,width:30,tintColor:'#49A94D'}}  />
					</View>
					<Text style={styles.accountText}>Add Account</Text>
					<View />
				</TouchableOpacity>
			)
		}

    let subscriptionComponents = null;
    if(subscriptions.length != 0 ){
      subscriptionComponents = subscriptions.map((s,idx) => {
  			return(
  				<TouchableOpacity key={idx} style={styles.accountButton} onPress={()=>Actions.data({mode:'subscription', idx:idx, fbKey: SubscriptionsStore.firebase_keys[idx], reference:'subscriptions',})}>
  					<View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid',}}>
  						<Text style={{fontSize:22,color:'#49A94D'}}>To</Text>
  					</View>
  					<Text style={styles.accountText}>{s.recip_name}</Text>
  					<View />
  				</TouchableOpacity>
  			);
  		});
    }

    return (
      <Screen style={styles.container}>

				<View style={{height:60}}/>

        <ScrollView
          ref={(scrollView) => { _scrollView = scrollView; }}
          automaticallyAdjustContentInsets={false}
          scrollEventThrottle={200}
          style={styles.scrollView}>

					<View style={styles.accountsSection}>
						<Text style={styles.sectionTitle}>Accounts</Text>
						{accountComponents}
					</View>

          <View style={styles.accountsSection}>
            <Text style={styles.sectionTitle}>Geofences</Text>
            <TouchableOpacity style={styles.accountButton} onPress={()=>GeofencesStore.toggleMobileFence()}>
              <Text style={styles.accountText}>Mobile Payment Fence {GeofencesStore.isMobileOn ? 'On' : 'Off'}</Text>
              <View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
                <MaterialIcons style={{alignItems:'center', justifyContent:'center'}} name={GeofencesStore.isMobileOn ? 'location-on' : 'location-off'} size={28} color="#49A94D"/>
              </View>
              <View />
            </TouchableOpacity>
          </View>

          {subscriptions.length === 0 ? <View/> :
            <View style={styles.accountsSection}>
              <Text style={styles.sectionTitle}>Recurring Gifts</Text>
              {subscriptionComponents}
            </View>
          }

					<View style={{...styles.accountsSection}}>
						<Text style={styles.sectionTitle}>Settings</Text>

						<TouchableOpacity style={styles.accountButton} onPress={()=>Actions.preferences({mode:'notifs', title: 'Notifications'})}>
							<View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
								<Image source={require('../assets/icons/alert-circle-outline.png')} style={{height:30,width:30,tintColor:'#49A94D'}} />
							</View>
							<Text style={styles.accountText}>Notifications</Text>
							<View />
						</TouchableOpacity>

						<TouchableOpacity style={styles.accountButton} onPress={()=>Actions.data({mode:'user', idx:0, title: 'User Info'})}>
							<View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
								<Image source={require('../assets/icons/account-box-outline.png')} style={{height:30,width:30,tintColor:'#49A94D'}} />
							</View>
							<Text style={styles.accountText}>User Info</Text>
							<View />
						</TouchableOpacity>

						<TouchableOpacity style={styles.accountButton} onPress={()=>Actions.preferences({mode:'privacy',  title: 'Privacy'})}>
							<View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
								<Image source={require('../assets/icons/lock-outline.png')} style={{height:30,width:30,tintColor:'#49A94D'}} />
							</View>
							<Text style={styles.accountText}>Privacy</Text>
							<View />
						</TouchableOpacity>

					</View>

					<View style={{...styles.accountsSection}}>
{
						// <TouchableOpacity style={{...styles.accountButton}}>
						// 	<Text style={{...styles.accountText,...{textAlign:'center',width:'100%',paddingLeft:0}}}>Support</Text>
						// </TouchableOpacity>
}
						<TouchableOpacity style={{...styles.accountButton,...{backgroundColor:'#eef8f3'}}} onPress={this.logout}>
							<Text style={{...styles.accountText,...{textAlign:'center',width:'100%',color:'#49A94D',paddingLeft:0}}}>Sign Out</Text>
						</TouchableOpacity>

					</View>
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
    justifyContent:'flex-start',
    alignItems:'center',
		backgroundColor:'#49734B',
		marginBottom:8
	},

  accountText:{
		color:'#eef8f3',
		paddingLeft:15,
    flex: 1,
  },
  amount:{
    fontSize:50,
    textAlign:'center',
    paddingBottom:10,
    color:'#eef8f3',
    fontFamily:'quicksand'
  },



};

export default connectStyle('com.yomo.SettingsScreen', styles)(SettingsScreen);
