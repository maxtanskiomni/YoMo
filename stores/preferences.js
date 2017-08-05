import {http, baseURL} from './index'
import { extendObservable, observable, action } from 'mobx'
import { firebase } from '../utilities/firebase_api'

class PreferencesStore {

  @observable loadingPreferences = false;

  @observable firebase_key = null;

  @observable preferences = [{location_autodetect:true, facebook_checkin:true, push_notifs:true, location_notifs:true}];

  @action get(){
    this.loadingPreferences = true;
    firebase.getUserPreferences();
  }

}

var store = new PreferencesStore()

export default store
