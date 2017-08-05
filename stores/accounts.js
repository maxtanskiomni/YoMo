import {http, baseURL} from './index'
import { extendObservable, observable, action } from 'mobx'
import { firebase } from '../utilities/firebase_api'

class AccountsStore {

  @observable loadingAccounts = false;
  @observable deafaultAccount = 0;
  @observable firebase_keys = [];

  //{accountNumber:1, bank:'Bank of America'},{accountNumber:2, bank:'Wells Fargo'}
  @observable accounts = [];

  @action get(){
    AccountsStore.accounts = [];
    this.loadingAccounts = true;
    firebase.getUserAccounts();
    //debugger
  }

}

var store = new AccountsStore()

export default store
