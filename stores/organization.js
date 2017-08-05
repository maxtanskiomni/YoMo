import {http, baseURL} from './index'
import { extendObservable, observable, action } from 'mobx'
import { firebase } from '../utilities/firebase_api'
import backgroundGeofence from '../utilities/background_geofence'

class OrganizationStore {

  @observable firebase_key
  @observable organization = {}
  @observable loadedOrganization = false;

  @action 
  get(geofenceID){
    firebase.getOrganization(geofenceID);
  }

  @action
  set(organization){
    this.loadedOrganization = true
    this.organization = organization
  }

}

var store = new OrganizationStore()

export default store
