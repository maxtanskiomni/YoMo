import React from 'react';
import { ScrollView } from 'react-native';
import { connectStyle } from '@shoutem/theme';
import { Title,Image, View, Text, Screen, TouchableOpacity, NavigationBar, Icon } from '@shoutem/ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {observer} from 'mobx-react';
import {action, runInAction,observable} from 'mobx';

import { AccountsStore,UserStore,PreferencesStore,TransactionsStore,SubscriptionsStore } from '../stores';

import TextInput from '../components/TextInput';

import { Actions } from 'react-native-router-flux';

import { firebase } from '../utilities/firebase_api'

const Dimensions = require('Dimensions');
const window = Dimensions.get('window');

@observer
class DataScreen extends React.Component {

  @observable firstName = UserStore.user_data.firstName;
  @observable lastName = UserStore.user_data.lastName;
  @observable email = UserStore.user_data.email;
  @observable pin = UserStore.user_data.pin.toString();

  makeDefault = () => {
    UserStore.user.deafaultAccount= this.props.idx;
    firebase.updateFB('users', UserStore.firebase_key, {default_account: this.props.idx});
    Actions.pop();
  }

  deleteEntity = () => {
    let deleteKey = this.props.fbKey;
    let reference = this.props.reference;
    firebase.deleteRecord(reference, deleteKey);
    Actions.pop();
  }

  adjustDefault = () => {
    let deletedIndex = this.props.idx;
    let defaultIndex = UserStore.user_data.default_account;
    let fbKey = UserStore.firebase_key;

    if(deletedIndex<=defaultIndex && defaultIndex != 0){
        defaultIndex -= 1;
        update_data = {
          default_account: defaultIndex,
        }
        firebase.updateFB('users', fbKey, update_data);
    }

    this.deleteEntity();
  }

  updateUser(data){
    let key = UserStore.firebase_key;
    console.log(data);
    firebase.database.ref('users/' + key).update(data);
  }

  render() {
    const styles = this.props.style;
    // const firebase_key = PreferencesStore.firebase_key;
    var components = null;

    if(this.props.mode === 'user'){
      const user = UserStore.user_data;
  		components = (
  			<View style={styles.accountsSection}>
        <Text style={styles.sectionTitle}>User Information</Text>
  				<TouchableOpacity style={styles.accountButton}>
            <View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
              <MaterialCommunityIcons style={{alignItems:'center', justifyContent:'center'}} name='account-card-details' size={28} color="#49A94D"/>
            </View>
            <TextInput
              underlineColorAndroid={'transparent'}
              autoCorrect={false}
              style={styles.input}
              value={this.firstName}
              onChangeText={e => this.firstName = e}
              autoCapitalize={'none'}
              onEndEditing={(e) => this.updateUser({firstName: e.nativeEvent.text})}
              placeholderTextColor={'#000000'}/>
  					<View />
  				</TouchableOpacity>

          <TouchableOpacity style={styles.accountButton}>
            <View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
              <MaterialCommunityIcons style={{alignItems:'center', justifyContent:'center'}} name='page-last' size={28} color="#49A94D"/>
            </View>
            <TextInput
              underlineColorAndroid={'transparent'}
              autoCorrect={false}
              style={styles.input}
              value={this.lastName}
              onChangeText={e => this.lastName = e}
              autoCapitalize={'none'}
              onEndEditing={(e) => this.updateUser({lastName: e.nativeEvent.text})}
              placeholderTextColor={'#000000'}/>
  					<View />
  				</TouchableOpacity>

          <TouchableOpacity style={styles.accountButton}>
            <View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
              <MaterialCommunityIcons style={{alignItems:'center', justifyContent:'center'}} name='email' size={28} color="#49A94D"/>
            </View>
            <TextInput
              underlineColorAndroid={'transparent'}
              autoCorrect={false}
              style={styles.input}
              value={this.email}
              onChangeText={e => this.email = e}
              autoCapitalize={'none'}
              onEndEditing={(e) => this.updateUser({email: e.nativeEvent.text})}
              placeholderTextColor={'#fff'}/>
            <View />
          </TouchableOpacity>

          <TouchableOpacity style={styles.accountButton}>
            <View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
              <MaterialCommunityIcons style={{alignItems:'center', justifyContent:'center'}} name='lock' size={28} color="#49A94D"/>
            </View>
            <TextInput
              underlineColorAndroid={'transparent'}
              autoCorrect={false}
              style={styles.input}
              value={this.pin}
              secureTextEntry={true}
              autoCapitalize={'none'}
              keyboardType={'numeric'}
              onChangeText={(e) => {if((e.length>4 || e.indexOf('.')>-1)){return} this.pin = e;}}
              onEndEditing={(e) => this.updateUser({pin: e.nativeEvent.text})}
              placeholderTextColor={'#fff'}/>
            <View />
          </TouchableOpacity>
        </View>
  		);
    }

    if(this.props.mode === 'bank'){
      let account = {bank: 'name', account_name: 'name'};
      if( AccountsStore.accounts.length > this.props.idx){
        account = AccountsStore.accounts[this.props.idx];
      }

      components = (
        <View>
          <View style={styles.accountsSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
    				<TouchableOpacity style={styles.accountButton}>
              <View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
                <MaterialCommunityIcons style={{alignItems:'center', justifyContent:'center'}} name='bank' size={28} color="#49A94D"/>
              </View>
    					<Text style={styles.accountText}>{account.bank}</Text>
    					<View />
    				</TouchableOpacity>

            <TouchableOpacity style={styles.accountButton}>
              <View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
                <MaterialCommunityIcons style={{alignItems:'center', justifyContent:'center'}} name='tag' size={28} color="#49A94D"/>
              </View>
    					<Text style={styles.accountText}>{account.account_name}</Text>
    					<View />
    				</TouchableOpacity>
          </View>

          <View style={{...styles.accountsSection}}>
            <TouchableOpacity style={{...styles.accountButton}} onPress={this.makeDefault}>
              <Text style={{...styles.accountText,...{textAlign:'center',width:'100%',paddingLeft:0}}}>Make default</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{...styles.accountButton,...{backgroundColor:'#eef8f3'}}} onPress={this.adjustDefault}>
              <Text style={{...styles.accountText,...{textAlign:'center',width:'100%',color:'#49A94D',paddingLeft:0}}}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if(this.props.mode === 'transaction'){
      const transaction = TransactionsStore.transactions[this.props.idx];
      components = (
        <View style={styles.accountsSection}>
        <Text style={styles.sectionTitle}>Transaction Information</Text>
  				<TouchableOpacity style={styles.accountButton}>
            <View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
              <Text style={{fontSize:18,color:'#49A94D'}}>To</Text>
            </View>
  					<Text style={styles.accountText}>{transaction.recip_name}</Text>
  					<View />
  				</TouchableOpacity>

          <TouchableOpacity style={styles.accountButton}>
            <View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
              <Text style={{fontSize:18,color:'#49A94D'}}>$</Text>
            </View>
  					<Text style={styles.accountText}>{'$'+transaction.amount}</Text>
  					<View />
  				</TouchableOpacity>

          <TouchableOpacity style={styles.accountButton}>
            <View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
              <Text style={{fontSize:18,color:'#49A94D'}}>Date</Text>
            </View>
            <Text style={styles.accountText}>{transaction.date}</Text>
            <View />
          </TouchableOpacity>
        </View>
      );
    }

    if(this.props.mode === 'subscription'){

      let subscription = {recip_name: 'name', amount: 0};
      if( SubscriptionsStore.subscriptions.length > this.props.idx){
        subscription = SubscriptionsStore.subscriptions[this.props.idx];
      }

      components = (
        <View>
          <View style={styles.accountsSection}>
          <Text style={styles.sectionTitle}>Subcription Information</Text>
            <TouchableOpacity style={styles.accountButton}>
              <View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
                <Text style={{fontSize:18,color:'#49A94D'}}>To</Text>
              </View>
              <Text style={styles.accountText}>{subscription.recip_name}</Text>
              <View />
            </TouchableOpacity>

            <TouchableOpacity style={styles.accountButton}>
              <View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
                <Text style={{fontSize:18,color:'#49A94D'}}>$</Text>
              </View>
              <Text style={styles.accountText}>{'$'+subscription.amount}</Text>
              <View />
            </TouchableOpacity>

            <TouchableOpacity style={styles.accountButton}>
              <View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
                <Image source={require('../assets/icons/date_range_white.png')} style={{height:30,width:30,tintColor:'#49A94D'}} />
              </View>
              <Text style={styles.accountText}>Weekly Interval</Text>
              <View />
            </TouchableOpacity>
          </View>


          <View style={{...styles.accountsSection}}>
            <TouchableOpacity style={{...styles.accountButton,...{backgroundColor:'#eef8f3'}}} onPress={this.deleteEntity}>
              <Text style={{...styles.accountText,...{textAlign:'center',width:'100%',color:'#49A94D',paddingLeft:0}}}>Cancel Gift</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <Screen style={styles.container}>

				<View style={{height:60}}/>

        <ScrollView
          ref={(scrollView) => { _scrollView = scrollView; }}
          automaticallyAdjustContentInsets={false}
          scrollEventThrottle={200}
          style={styles.scrollView}>

          {components}

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
		paddingLeft:15
  },

  input:{
    paddingLeft:15,
    backgroundColor:'#49734B',
    color:'#fff',
    width:'80%',
    fontSize:15
  },

};

export default connectStyle('com.yomo.DataScreen', styles)(DataScreen);
