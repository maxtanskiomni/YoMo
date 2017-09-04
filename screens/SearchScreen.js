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
  Keyboard,
  Alert,
} from 'react-native';

var {GooglePlacesAutocomplete} = require('react-native-google-places-autocomplete');
const Dimensions = require('Dimensions');
const window = Dimensions.get('window');

import { connectStyle } from '@shoutem/theme';

import {UserStore, OrganizationStore, GeofencesStore} from '../stores';
import { firebase } from '../utilities/firebase_api';

import { Actions } from 'react-native-router-flux';

import {observer} from 'mobx-react';
import {observable} from 'mobx';

@observer
class SearchScreen extends React.Component {
  render() {
    let current_coords = GeofencesStore.current_coords;
    let location_string = current_coords.latitude+','+current_coords.longitude;

    return (
      <GooglePlacesAutocomplete
        placeholder='Search'
        minLength={3}
        autoFocus={false}
        returnKeyType={'default'}
        fetchDetails={false}
        listViewDisplayed={true}
        listUnderlayColor = "#49734B"
        onPress={(data, details = null) => {
          console.log(data);
          //console.log(details);

          if(data.types.indexOf('establishment') === -1){
            Alert.alert("Hmmmm", "You must select an organization or business.  Cities and geocodes cannot accept gifts!");
          }else{
            let organization = {
              org_name: data.structured_formatting.main_text,
              poc_email: null,
              stripe_user_id: 'unassigned',
              address: data.structured_formatting.secondary_text,
              google_id: data.id,
            }
            OrganizationStore.set(organization);
            Actions.pop();
          }

        }}
        query={{
          key: 'AIzaSyAHBsJtvyVGElwmbX0fN48Dt1UogsLH8G4',
          location: location_string,
          radius: 50000,
          language: 'en', // language of the results
        }}
        GooglePlacesSearchQuery={{
          // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
          rankby: 'distance',
        }}
        styles={{
          container: {
            backgroundColor:"#49A94D",
            flexDirection:'column',
            justifyContent:'center',
            alignItems:'center',
            paddingBottom:'5%',
            paddingTop:'20%',
          },
          textInputContainer: {
            backgroundColor: 'rgba(0,0,0,0)',
            borderTopWidth: 0,
            borderBottomWidth:0
          },
          textInput: {
            marginLeft: 5,
            marginRight: 5,
            height: 38,
            color: '#5d5d5d',
            fontSize: 16
          },
        }}
        nearbyPlacesAPI={'GooglePlacesSearch'}
        currentLocation={false}
        />
    );
  }
}

const styles = {

};

export default connectStyle('com.yomo.PaymentScreen', styles)(SearchScreen);
