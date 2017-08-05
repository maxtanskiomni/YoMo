import {http, baseURL} from './index'
import { extendObservable, observable, action } from 'mobx'
import { firebase } from '../utilities/firebase_api'

class SubscriptionsStore {

  @observable loadingSubscriptions = false;

  @observable firebase_keys = null;

  @observable subscriptions = [];

  @action get(){
    this.subscriptions = [];
    this.loadingSubscriptions = true;
    firebase.getSubscriptions();
  }

}

var store = new SubscriptionsStore()

export default store
