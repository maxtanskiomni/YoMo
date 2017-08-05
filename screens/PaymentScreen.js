import React from 'react';
import { Image,  Screen, TouchableOpacity } from '@shoutem/ui';
import { TouchableHighlight, Alert, AppState, StyleSheet } from 'react-native';
import Modal from 'react-native-simple-modal';
import { connectStyle } from '@shoutem/theme';
import { AccountsStore,UserStore, OrganizationStore, GeofencesStore, PreferencesStore } from '../stores';

import {observer} from 'mobx-react';
import {action, runInAction,observable} from 'mobx';

import { firebase } from '../utilities/firebase_api'

import { Actions } from 'react-native-router-flux';

import {View,Text} from 'react-native-animatable';

@observer
class PaymentScreen extends React.Component {

  constructor (props) {
    super(props);
  }

  @observable total = '0.00';
  @observable modalOpen = false;
  @observable paymentConfirmed = false;
  @observable paymentResponse;

  @observable isSubscription = true;

  @observable processingFee = true;

  submit_payment () {
    this.modalOpen = false;
    this.paymentConfirmed = true;
    const organization = OrganizationStore.organization;
    let processingMultiple = 1;

    if(this.processingFee){
      processingMultiple = 1.018;
    }

    let amount = parseFloat(this.total);
    amount = amount*processingMultiple*100;
    amount = Math.round(amount)/100;

    const source = AccountsStore.accounts[UserStore.user_data.default_account].token;
    const org_stripe_id = organization.stripe_user_id;
    const description = "Your gift to "+organization.org_name;

    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth()+1; //January is 0!
    let yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd;
    }

    if(mm<10) {
        mm='0'+mm;
    }

    let hh = today.getHours();
    let min = today.getMinutes();

    if(min<10) {
        min='0'+min;
    }

    let time = hh + ":" + min;
    today = mm+'/'+dd+'/'+yyyy;

    let trans_data = {
      amount: amount,
      date: today,
      time: time,
      payer: UserStore.user.email,
      payer_name: `${UserStore.user_data.firstName} ${UserStore.user_data.lastName}`,
      recip_name: organization.org_name,
      recipient: organization.poc_email,

    }

    const trans_key = firebase.database.ref().child('transactions').push().key;

    var params = {
      amount: amount,
      customer: source,
      stripe_user_id: org_stripe_id,
      description: description,
      key: trans_key,
    }

    var stripe_data = [];
    for (var property in params) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(params[property]);
      stripe_data.push(encodedKey + "=" + encodedValue);
    }
    stripe_data = stripe_data.join("&");

    console.log(stripe_data)

    fetch('https://yomo-76a36.appspot.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: stripe_data
    }).then((response) => {
      console.log('this is the response', response);
      if (!response.ok) {
          throw Error(response._bodyText);
      }
      return response;
    })
    .then((data) => {
      console.log('this is the data', data);
      this.paymentResponse = 'Your gift has been recieved. Thank you!';

      firebase.database.ref('transactions/' + trans_key).update(trans_data);

      if(this.isSubscription){
        params.owner = UserStore.user.email;
        params.recip_name = organization.org_name;
        params.recipient = organization.poc_email;
        firebase.insertFB('subscriptions', params);
      }

    })
    .catch((e) => {
      console.log('this is the error:',e);
      debugger
      this.paymentResponse = 'There has been an error with gift.  Please check your connection and try again :)';
    });

    setTimeout(() => {this.paymentConfirmed=false;}, 5000);
    this.total = '0.00';
  }


  onTap(value) {
    if (value === 'clear') {
      return this.total = '0.00'
    }

    let tempTotal = this.total.replace(/\D+/g, '');

    if (value === 'backspace') {
      tempTotal = tempTotal.slice(0, tempTotal.length - 1)
    } else {
      tempTotal += value;
    }

    if (tempTotal.length > 3 && tempTotal[0] === '0') {
      // Remove unecessary 0's from the start of values
      tempTotal = tempTotal.slice(1);
    } else if (tempTotal.length < 2) {
      // Add two 0's at the beginning if value <= 9 cents
      tempTotal = '00' + tempTotal;
    } else if (tempTotal.length < 3) {
      // Add one 0 at the beginning if value <= 99 cents
      tempTotal = '0' + tempTotal;
    }

    // set maximum value to 5000 dollars inline with Dwolla limits
    if (parseInt(tempTotal) > 500000) {
      return
    }

    this.total = tempTotal.slice(0, tempTotal.length - 2) + "." + tempTotal.slice(tempTotal.length - 2);

  }

  render() {
    const organization = OrganizationStore.organization;
    var on = (<Image source={require('../assets/icons/check-outline.png')} style={{height:30,width:30,tintColor:'#49A94D'}} />);
    var off = (<Image source={require('../assets/icons/outline.png')} style={{height:30,width:30,tintColor:'#49A94D'}} />);

    let content = null;

    if (AccountsStore.accounts.length === 0) {
      content = (
        <View style={{flex:10,flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
          <View style={{flex:1, marginTop: 10}}>
            <Text style={styles.thankYouText} animation={"fadeIn"}>You do not have an account setup yet. &#13; Click the little guy living on the top left of this screen, then press 'Add account' to get started.</Text>
          </View>
        </View>
      );
    }

    else if (this.paymentConfirmed) {
      content = (
        <View style={{flex:10,flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
          <View style={{flex:1}}/>
          <Text style={styles.thankYouText} animation={"fadeIn"}>{this.paymentResponse}</Text>
          <View style={{flex:1}}/>
        </View>
      );
    } else {
      content = (
        <View style={{flex:10,flexDirection:'column',justifyContent:'space-between',alignItems:'stretch'}}>
          <View style={styles.information}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <Text style={styles.total}>${this.total}</Text>
            </View>
            <TouchableOpacity onPress={()=> {Actions.search()}}>
              <View style={{flexDirection:'row', justifyContent:'flex-start', alignItems:'center',}}>
                <Image
                  style={{width: 35, height: 35,padding:10}}
                  source={require('../assets/icons/search_white.png')} />
                <Text style={styles.organization}>{organization.org_name == null ? `Find a place..` : `to ${organization.org_name}` }</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.numPad}>

            <View style={styles.buttonRow}>

              <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,1)} >
                <Text style={styles.numberText}>1</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,2)} >
                <Text style={styles.numberText}>2</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,3)} >
                <Text style={styles.numberText}>3</Text>
              </TouchableOpacity>

            </View>

            <View style={styles.buttonRow}>

              <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,4)} >
                <Text style={styles.numberText}>4</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,5)} >
                <Text style={styles.numberText}>5</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,6)} >
                <Text style={styles.numberText}>6</Text>
              </TouchableOpacity>

            </View>

            <View style={styles.buttonRow}>

              <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,7)} >
                <Text style={styles.numberText}>7</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,8)} >
                <Text style={styles.numberText}>8</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,9)} >
                <Text style={styles.numberText}>9</Text>
              </TouchableOpacity>

            </View>

            <View style={styles.buttonRow}>

              <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,'clear')}>
                <Text style={{color:'#49A94D',fontSize:18,top:-2,fontFamily:'quicksand'}}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,0)} >
                <Text style={styles.numberText}>0</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,'backspace')}>
                <Image
                  style={{width:28,height:28,tintColor:'#49A94D',left:-1}}
                  source={require('../assets/icons/backspace_white.png')} />
              </TouchableOpacity>

            </View>

          </View>

          <View needsOffscreenAlphaCompositing={true} style={Object.assign(styles.confirmation,{opacity:parseFloat(this.total) < 1.00 || organization.org_name == null ? 0.4 : 1})}>

            <TouchableOpacity disabled={parseFloat(this.total) < 1.00 || organization.org_name == null } onPress={() => this.modalOpen = !this.modalOpen} style={{backgroundColor:'#49A94D', flexDirection:'row', justifyContent:'center', alignItems:'center',width:200, borderColor:'#fff', borderWidth:2,}}>
                <Text style={{fontSize:20,padding:10,fontFamily:'quicksand',color:'#fff'}}>Confirm</Text>
            </TouchableOpacity>

          </View>
        </View>
      );
    }

    return (
      <Screen style={styles.container} >

        <View style={styles.icons}>
          <TouchableOpacity onPress={()=> {Actions.settings({title:`${UserStore.user_data.firstName} ${UserStore.user_data.lastName}`})}}>
            <Image
              style={{width: 45, height: 45,padding:10}}
              source={require('../assets/icons/person_white.png')} />
          </TouchableOpacity>

          <TouchableOpacity onPress={()=> {Actions.history();}}>
            <Image
              style={{width: 45, height: 45,padding:10}}
              source={require('../assets/icons/history_white.png')} />
          </TouchableOpacity>

        </View>

        {content}

        <Modal
          modalStyle={styles.modal}
          open={this.modalOpen}>

          <View style={styles.modalContent}>
            <Text>You have chosen to give</Text>
            <Text style={styles.modalEmphasis}>${this.total}</Text>
            <Text>to</Text>
            <Text style={styles.modalEmphasis}>{organization.org_name}</Text>

            <TouchableOpacity style={styles.accountButton} onPress={() => {this.isSubscription = !this.isSubscription}}>
    					<Text style={styles.accountText}>Make weekly subscription?</Text>
              <View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
                {this.isSubscription ? on : off}
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.accountButton} onPress={() => {this.processingFee = !this.processingFee}}>
              <Text style={styles.accountText}>Cover the 1.8% processing charge?</Text>
              <View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
                {this.processingFee ? on : off}
              </View>
            </TouchableOpacity>

          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={{flex:1,padding:10,borderRadius:2}} onPress={() => {this.modalOpen = false,this.total = '0.00'}}>
              <Text style={{textAlign:'center'}}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{flex:1,backgroundColor:'#49A94D',padding:10,borderRadius:2}}
              onPress={this.submit_payment.bind(this)}>
              <Text style={{textAlign:'center',color:'#eef8f3'}}>Confirm</Text>
            </TouchableOpacity>
          </View>

        </Modal>

      </Screen>
    );
  }

}

const styles = {
  container: {
    flex: 1,
    padding:'10%',
    flexDirection:'column',
    justifyContent:'space-between',
    alignItems:'stretch',
    backgroundColor:"#49A94D",
  },

  modal:{
    padding:0,
  },

  modalContent:{
    padding:20,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
  },

  modalEmphasis:{
    fontFamily:'quicksand-bold',
    fontSize:16,
    margin:10,
    textAlign:'center'
  },

  modalButtons:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'flex-end'
  },

  icons:{
    flex:1,
    width:'100%',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
  },

  information:{
    flex:2,
    width:'100%',
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
  },
  total:{
    fontSize:50,
    textAlign:'center',
    paddingBottom:10,
    color:'#eef8f3',
    fontFamily:'quicksand'
  },
  organization:{
    fontSize:20,
    color:'#eef8f3',
    fontFamily:'quicksand',
    textAlign: 'center'
  },

  numPad:{
    flex:7,
    width:'100%',
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
  },
  buttonRow:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center'
  },
  numberButton:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    width:60,
    height:60,
    borderRadius:60,
    backgroundColor:'#fff',
    margin:5
  },
  numberText:{
    color:'#67c29b',
    fontSize:30,
    top:-3,
    fontFamily:'quicksand'
  },

  confirmation:{
    flex:1,
    width:'100%',
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center'
  },

  thankYouText:{
    flex:2,
    fontSize:30,
    color:'#eef8f3'
  },
  accountText:{
    flex:1
  },
  accountButton:{
    width:'90%',
    height:54,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginBottom:8
  },

};

export default connectStyle('com.yomo.PaymentScreen', styles)(PaymentScreen);
