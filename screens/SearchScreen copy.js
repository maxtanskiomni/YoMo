import React from 'react';
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Keyboard
} from 'react-native';

const Dimensions = require('Dimensions');
const window = Dimensions.get('window');

import {UserStore, OrganizationStore} from '../stores';
import { firebase } from '../utilities/firebase_api';

import { Actions } from 'react-native-router-flux';

import {observer} from 'mobx-react';
import {observable} from 'mobx';

import { MonoText } from '../components/StyledText';

@observer
class SearchScreen extends React.Component {

  @observable searchText = '';

  @observable searchResults = [];

  searchResultsHolder = [];

  isObjEquivalent(a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
  }

  searchFor(word){
    this.searchText = word;
    if(!word){
      this.searchResults=[];
      this.searchResultsHolder=[];
      return
    }

    var address = firebase.organizationsRef.orderByChild('address')
    .startAt(this.searchText).endAt(this.searchText+"\uf8ff")
    .once('value', (snapshot) => {
      let results = snapshot.val();
      if(!results){
        return
      }
      let results_array = Object.values(results);
      this.addToResults(results_array);
    });

    var org_name = firebase.organizationsRef.orderByChild('org_name')
    .startAt(this.searchText).endAt(this.searchText+"\uf8ff")
    .once('value', (snapshot) => {
      let results = snapshot.val();
      if(!results){
        return
      }
      let results_array = Object.values(results);
      this.addToResults(results_array);
    });
  }

  addToResults(new_results){

    if(this.searchResultsHolder.length == 0){
        new_results.forEach((new_result, idx)=>{
          this.searchResultsHolder.push(new_result);
        });
    }

    this.searchResultsHolder.forEach((result, idx)=>{
      new_results.forEach((new_result, idx)=>{
        var isIn = this.isObjEquivalent(new_result, result)
        if(isIn){
          return
        }

        this.searchResultsHolder.push(new_result);
      });
    });
    this.searchResults = this.searchResultsHolder;

  }

  clear_text = () =>{
    this.searchText='';
    this.searchResults = [];
  }

  setOrg = () => {
    Actions.pop();
    firebase.getOrganization(result.geofenceID);
  }

  render() {

    let search_components = [];

    search_components = this.searchResults.map((result,idx) => {
      return (<TouchableOpacity key={idx} style={styles.rowButton} onPress={this.setOrg}>
        <View style={{backgroundColor:'#fff',height:76,width:76,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#83a1d5',borderStyle:'solid',}}>
          <Text style={{fontSize:22,color:'#49A94D'}}>{result.org_name[0]}</Text>
        </View>
        <View style={{flexDirection:'column'}}>
          <Text style={styles.buttonText}>{result.org_name}</Text>
          <Text style={[styles.buttonText,{fontFamily:'quicksand'}]}>{result.address}</Text>
        </View>
        <View />
      </TouchableOpacity>);
    });

    return (
      <View style={styles.container}>
        <View style={styles.inputBar}>
          {!this.searchText ? (<Image source={require('../assets/icons/search_black.png')} style={{height:30,width:30, tintColor:'#83a1d5', marginLeft:15}} />) : (<View/>)}
          <TextInput
            underlineColorAndroid={'transparent'}
            autoCorrect={false}
            style={styles.input}
            value={this.searchText}
            autoCapitalize={'none'}
            onChangeText={(e) => this.searchFor(e)}
            onBlur={(e) => Keyboard.dismiss()}
            placeholder='Search for people...'
            placeholderTextColor={'#83a1d5'}/>
          <TouchableOpacity onPress={this.clear_text}>
            {this.searchText ? (<Image source={require('../assets/icons/clear_black.png')} style={{height:30,width:30, tintColor:'#83a1d5', marginRight:15}} />) : (<View style={{height:54,width:54}}/>)}
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={(scrollView) => { _scrollView = scrollView; }}
          automaticallyAdjustContentInsets={false}
          scrollEventThrottle={200}
          keyboardDismissMode='on-drag'
          keyboardShouldPersistTaps='always'
          style={styles.scrollView}>

          <View style={styles.section}>
            {search_components}
          </View>

        </ScrollView>

      </View>
    );
  }
}

const styles = {
  container: {
    backgroundColor:"#49A94D",
    flex: 1,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    paddingBottom:'5%'
  },

  scrollView: {
    flex:1,
		width:window.width
  },

	sectionTitle:{
    color:'#4A4A4A',
    fontSize:16,
		textAlign:'left',
		width:'100%',
		padding:5,
    fontFamily:'quicksand',
	},

	section:{
		width:'100%',
		flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
		borderBottomWidth:0,
		borderColor:'#abddc7',
		borderStyle:'solid',
		padding:10,
	},

	rowButton:{
		width:'100%',
		height:76,
		flexDirection:'row',
    justifyContent:'flex-start',
    alignItems:'center',
		backgroundColor:'#fff',
		marginBottom:5
	},

  inputBar:{
    width:'100%',
    height:54,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    backgroundColor:'#fff',
    marginBottom:5
  },

  button:{
    height:54,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#fff',
    marginBottom:8,
    width: '100%',
  },

  buttonText:{
		color:'#000',
		paddingLeft:15,
    fontSize:15,
    fontFamily:'quicksand-bold',
  },

  buttonThemeText:{
    color:'#365488',
    paddingLeft:15,
    fontSize:15,
    fontFamily:'quicksand-bold',
  },

  input:{
    height:54,
    paddingLeft:15,
    fontFamily:'quicksand',
    backgroundColor:'#fff',
    marginBottom:2,
    color:'#000000',
    flex:1,
    fontSize:15
  },
};

export default connectStyle('com.yomo.PaymentScreen', styles)(SearchScreen);
