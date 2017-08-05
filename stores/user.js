import {http, baseURL} from './index'
import { extendObservable, observable, action } from 'mobx'
import { firebase } from '../utilities/firebase_api'

class UserStore {

  @observable loadingUser = false;

  @observable user_data = {};

  @observable logged_in = false;

  @observable checker = false;

  @observable user = {
    email:'',
    password:'',
    firstName:'Winston',
    lastName:'Tester',
    deafaultAccount: 0,
  }

  @action get(){
    this.loadingUser = true;
    firebase.getCurrentUser();

  }

  @action post() {
    const {user} = this;
  }

  @action sendPasswordRetreival(){
    const {user} = this;
  }

  @action postNewPassword(password){
    const {user} = this;
  }

  @action postNewUser(user) {
    console.log(user)
  }

}

var store = new UserStore()

export default store
