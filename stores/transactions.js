import {http, baseURL} from './index'
import { extendObservable, observable, action } from 'mobx'
import { firebase } from '../utilities/firebase_api'

class TransactionsStore {

  @observable loadingTransactions = false;

  @observable transactions = [];

  @action get(){
    this.loadingTransactions = true;
    firebase.getUserTransactions();
  }

}

var store = new TransactionsStore()

export default store
