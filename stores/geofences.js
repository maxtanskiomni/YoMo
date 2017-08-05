import {http, baseURL} from './index'
import { firebase } from '../utilities/firebase_api'
import backgroundGeofence from '../utilities/background_geofence'
import { extendObservable, observable, action, runInAction } from 'mobx'
import OrganisationStore from './organization'
import UserStore from './user'

class GeofencesStore {

  @observable fences = [];
  @observable activeFence = {};
  @observable loadingGeofences = false;
  @observable current_coords = [];
  @observable isMobileOn = false;
  @observable mobile_fence = null;
  @observable mobile_key = null;

  @action
  get () {
    this.loadingGeofences = true;
    firebase.getGeofences()
  }

  @action
  registerGeofences (locations) {
    this.fences = locations
    this.loadingGeofences = false
    OrganisationStore.organization = {org_name: null};
    backgroundGeofence.removeGeoFences()
    backgroundGeofence.addGeoFences(locations)
  }

  @action
  setActiveFence (fence) {
    this.activeFence = fence
    OrganisationStore.get(fence.identifier)
  }

  @action
  toggleMobileFence () {
    this.isMobileOn = !this.isMobileOn;
    if(this.isMobileOn && this.mobile_fence != null){
      //isOn
      //add fence to firebase and the api will add to the list
      this.mobile_key = firebase.geofencesRef.push(this.mobile_fence).key;
      firebase.usersRef.child(UserStore.firebase_key+'/mobile_fence/').update({isMobileOn: true, mobile_key: this.mobile_key});
    }else if(this.mobile_key != null){
      //notOn
      //remove from firebase
      firebase.geofencesRef.child(this.mobile_key).remove();
      firebase.usersRef.child(UserStore.firebase_key+'/mobile_fence/').set({isMobileOn: false});
      this.mobile_key = null;
      this.mobile_fence = null;
    }
  }

}

var store = new GeofencesStore()

export default store
