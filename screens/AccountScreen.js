import React from 'react';
import {observer,} from 'mobx-react';
import {action, runInAction,observable} from 'mobx';
import { UserStore } from '../stores';
import { View, WebView, ActivityIndicator, Text, Alert } from 'react-native';
import { Actions } from 'react-native-router-flux';
import Modal from 'react-native-simple-modal';

@observer
export default class AccountScreen extends React.Component {

  @observable modalOpen = false;

  constructor (props) {
    super(props);

    this.onMessage = this.onMessage.bind(this);
  }

  onMessage(e) {
    let plaidResponseOnjectified = JSON.parse(e.nativeEvent.data);

    if (plaidResponseOnjectified.action === "plaid_link-undefined::exit") {
      Actions.pop()
    }

    else if (plaidResponseOnjectified.action === "plaid_link-undefined::connected") {
      // to get the public_token with sandbox, username="user_good" and password="pass_good"
      // the public token is contained in `plaidResponseOnjectified.metadata.public_token;`
      // this is the credential you required for the DB right?

      let stripe_user_id = UserStore.user_data.hasOwnProperty('stripe_user_id') ? UserStore.user_data.stripe_user_id : false;
      const params = {
        public_token: plaidResponseOnjectified.metadata.public_token,
        bank: plaidResponseOnjectified.metadata.institution.name,
        account_id: plaidResponseOnjectified.metadata.account_id,
        account_name: plaidResponseOnjectified.metadata.account.name,
        institution_id: plaidResponseOnjectified.metadata.institution.institution_id,
        owner: UserStore.user.email,
        stripe_user_id: stripe_user_id,
      }

      let plaid_data = [];
      for (const property in params) {
        const encodedKey = encodeURIComponent(property);
        const encodedValue = encodeURIComponent(params[property]);
        plaid_data.push(`${encodedKey}=${encodedValue}`);
      }
      plaid_data = plaid_data.join("&");

      //console.log(params);

      this.modalOpen = true;

      //google cloud server url
      fetch('https://yomo-76a36.appspot.com/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: plaid_data
      })
      .then((response) => {
        console.log(response);
        if (!response.ok) {
            throw Error(response._bodyText);
        }
        return response;
      })
      .then((data) => {
        Alert.alert('Success!', 'Your account has been added!  You can now give or make payments.');
      })
      .catch((e) => {
        console.log(e);
        Alert.alert('Account error', 'There was a problem registering your account with the server. Please wait five minutes and try again.');
      }).then((e)=>{
        this.modalOpen = false;
        Actions.pop();
      });

    }
  }

  onError(e){
    console.log(e)
    Alert.alert('Adding accounts unavailable', e);
    Actions.pop();
  }

  render() {
    // env=production for production
    return (
      <View style={styles.container}>
      <WebView
        source={{uri: `https://cdn.plaid.com/link/v2/stable/link.html?key=884655ebf3568c223b55bb015f1d70&env=production&product=auth&selectAccount=true&clientName=Max%20Tanskinator&isWebView=true&webhook=http://google.com`}}
        onMessage={(e) => this.onMessage(e)}
        onError={(e) => this.onError(e)} />

        <Modal
          modalStyle={styles.modal}
          open={this.modalOpen}>

          <View style={styles.modalContent}>
            <Text>Your account is almost all set.  We are just waiting for the guys in fancy business suits to say you account is all secure. It should only take a second.</Text>
            <ActivityIndicator color='#49A94D' size='large' style={[{paddingTop:15}, {transform: [{scale: 1.5}]}]}/>

          </View>

        </Modal>
      </View>
    )

  }

}

const styles = {
  container: {
    flex: 1,
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

};
