import Expo from 'expo';
import { Actions } from 'react-native-router-flux';
import * as fb from 'firebase';
import {action} from 'mobx';

const firebaseConfig = {
  apiKey: "AIzaSyA3jc5FRVwmzT49U9Ea8BYbjqPccEfgi2E",
  authDomain: "yomo-76a36.firebaseapp.com",
  databaseURL: "https://yomo-76a36.firebaseio.com",
  projectId: "yomo-76a36",
  storageBucket: "yomo-76a36.appspot.com",
  messagingSenderId: "829243632040"
};

const firebaseApp = fb.initializeApp(firebaseConfig);

import {
  AccountsStore,
  UserStore,
  TransactionsStore,
  PreferencesStore,
  GeofencesStore,
  OrganizationStore,
  SubscriptionsStore
} from '../stores';

class FirebaseAPI{

  constructor(){
    this.firebaseApp = firebaseApp;
    this.database = firebaseApp.database();
    this.usersRef = this.database.ref('users');
    this.accountsRef = this.database.ref('accounts');
    this.transactionsRef = this.database.ref('transactions');
    this.preferencesRef = this.database.ref('preferences');
    this.geofencesRef = this.database.ref('geofences');
    this.organizationsRef = this.database.ref('organizations');
    this.subscriptionsRef = this.database.ref('subscriptions');
  }

//Firebase Auth methods and observers
  register(email, password){
    firebaseApp.auth().createUserWithEmailAndPassword(email, password)
     .catch(function (err) {
       console.log(err)
     });
   }

   sendPasswordReset(email){
     firebaseApp.auth().sendPasswordResetEmail(email)
      .catch(function (err) {
        console.log(err)
      });
    }

  signIn(page){
    firebaseApp.auth().signInWithEmailAndPassword(page.email, page.password)
      .catch(function(err) {
        console.log(err)
        page.modalOpen = true
      });
   }

  signOut(){
    firebaseApp.auth().signOut()
     .catch(function (err) {
       console.log(err)
     });
  }

  addAuthObserver(method){
    firebaseApp.auth().onAuthStateChanged(function(user) {
      if (user) {
        let isInitialLogin = UserStore.user === null;
        UserStore.logged_in= true;
        UserStore.user = user; // user is undefined if no user signed in
        UserStore.get();
        AccountsStore.get();
        TransactionsStore.get();
        PreferencesStore.get();
        SubscriptionsStore.get();
        GeofencesStore.get();

        if(isInitialLogin){
          Actions.payment();
          return
        }
        UserStore.checker = true;

        //Actions.pin({type: 'reset'});
      }else{
        UserStore.user = null;
        UserStore.logged_in= false;
        UserStore.checker = true;
      }
    });
  }

//Facebook login
  // async function logInwithFB(method) {
  //   const { type, token } = await Exponent.Facebook.logInWithReadPermissionsAsync(
  //     '456672234679672', {
  //       permissions: ['public_profile'],
  //     });
  //   if (type === 'success') {
  //     // Get the user's name using Facebook's Graph API
  //     const response = await fetch(
  //       'https://graph.facebook.com/me?access_token=${token}');
  //       global.user = (await response.json())};
  //   }
  //
  //   method
  // }

//Firebase Database methods
  getUsers(parent){
    this.usersRef.orderByKey()
    .on('value', (users) => {
      parent.setState({users: users});
    });
  }

  getCurrentUser(){
    this.usersRef.orderByChild('email')
    .equalTo(UserStore.user.email)
    .on('value', (snapshot) => {
      user = snapshot.val();
      if(!user){
        return
      }
      snapshot.forEach(function(data) {
        UserStore.firebase_key = data.key;
      });

      var user_array = Object.values(user)
      UserStore.user_data = user_array[0];

      let isMobileOn = UserStore.user_data.mobile_fence.isMobileOn;
      GeofencesStore.isMobileOn = isMobileOn;
      GeofencesStore.mobile_key = isMobileOn ? UserStore.user_data.mobile_fence.mobile_key : null;
      //console.log(UserStore.user_data)
      UserStore.loadingUsers = false;
    });
  }

  getUserAccounts(){
    this.accountsRef.orderByChild('owner')
    .equalTo(UserStore.user.email)
    .on('value', (snapshot) => {
      accounts = snapshot.val();
      if(!accounts){
        AccountsStore.accounts = [];
        return
      }
      var accounts_array = Object.values(accounts);
      AccountsStore.accounts = accounts_array;
      AccountsStore.firebase_keys = Object.keys(accounts);
      AccountsStore.loadingAccounts = false;
    });
  }

  getSubscriptions () {
    this.subscriptionsRef.orderByChild('owner')
    .equalTo(UserStore.user.email)
    .on('value', (snapshot) => {
      subscriptions = snapshot.val();
      if(!subscriptions){
        SubscriptionsStore.subscriptions = [];
        return
      }
      var subscriptions_array = Object.values(subscriptions);
      SubscriptionsStore.subscriptions = subscriptions_array;
      SubscriptionsStore.firebase_keys = Object.keys(subscriptions);
      SubscriptionsStore.loadingSubscriptions = false;
    });
  }

  @action
  getGeofences () {
    this.geofencesRef.on('value', (snapshot) => {

      let fences = snapshot.val();
      if (!fences){
        return
      }
      console.log(fences);
      // removing empty array elements
      let temp = [];
      for(let i in fences){
        if (fences.hasOwnProperty(i)) {
          i && temp.push(fences[i]);
        }
      }


      fences = temp;
      GeofencesStore.registerGeofences(fences)

    });
  }

  getUserPreferences(){
    this.preferencesRef.orderByChild('user')
    .equalTo(UserStore.user.email)
    .on('value', (snapshot) => {
      preferences = snapshot.val();
      if(!preferences){
        return
      }
      snapshot.forEach(function(data) {
        PreferencesStore.firebase_key = data.key;
      });

      var preferences_array = Object.values(preferences)
      PreferencesStore.preferences = preferences_array[0];
      PreferencesStore.loadingPreferences = false;
    });
  }

  getOrganization(geofence){
    //console.log('This is the geofence ID: ', geofenceID)
    if(geofence.identifier === "unassigned" && geofence.extras.email != UserStore.user_data.email){
      let personal_organization = {
        org_name: geofence.extras.first_name+" "+goefence.extras.last_name,
        poc_email: 'max.tanski@yomo.cash',
        stripe_user_id: geofence.identifier,
        goefenceID: geofence.identifier,
      }
    }else{
      this.organizationsRef.orderByChild("geofenceID").equalTo(geofence.identifier)
        .once('value', (snapshot) => {

          organization = snapshot.val();

          if(!organization){
            OrganizationStore.set({org_name:null, geofenceID:-1})
          }

          snapshot.forEach((data) => {
            OrganizationStore.firebase_key = data.key;
        });

        if(organization != null){
          OrganizationStore.set(Object.values(organization)[0]);
        }

      });
    }
  }

  getUserTransactions(){
    this.transactionsRef.orderByChild('payer')
    .equalTo(UserStore.user.email)
    .on('value', (snapshot) => {
      transactions = snapshot.val();
      if(!transactions){
        return
      }
      var transactions_array = Object.values(transactions)
      TransactionsStore.transactions = transactions_array;
      TransactionsStore.loadingTransactions = false;
    });
    // this.transactionsRef.orderByChild('recipient')
    // .equalTo(UserStore.user.email)
    // .on('value', (snapshot) => {
    //   transactions = snapshot.val();
    //   if(!transactions){
    //     return
    //   }
    //   var transactions_array = Object.values(transactions)
    //   TransactionsStore.transactions.push(transactions_array);
    //   TransactionsStore.loadingTransactions = false;
    // });
  }

  insertFB(table, data){
    if(['users', 'accounts', 'transactions', 'preferences', 'subscriptions'].indexOf(table)<0){
      console.log('incorrect table reference')
      return
    }
    var newKey = this.database.ref().child(table).push().key;
    this.database.ref(table + '/' + newKey).set(data);
    return newKey;
  }

  updateFB(table, key, updateObject){
    if(['users', 'accounts', 'transactions', 'preferences'].indexOf(table)<0){
      console.log('incorrect table reference')
      return
    }
    this.database.ref(table + '/' + key).update(updateObject);
  }

  deleteRecord(table, key) {
    if(['users', 'accounts', 'transactions', 'subscriptions'].indexOf(table)<0){
      console.log('incorrect table reference')
      return
    }
    this.database.ref(table + '/' + key).remove();
  }
}

export let firebase = new FirebaseAPI()
