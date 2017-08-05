import { Alert } from 'react-native'
import { GeofencesStore, OrganizationStore, PreferencesStore, UserStore } from '../stores'
import BackgroundGeolocation from 'react-native-background-geolocation'
import firebase from './firebase_api'
import Expo from 'expo';
import geolib from 'geolib';

const configuration = {

  // *** REMOVE THIS***
  stopOnTerminate: false,
  // *** YES - REMOVE THE STOONTERMNATE!!! ***

	// Geolocation Common Options
	desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_LOW,
	distanceFilter: 2000,
	disableElasticity: false,
	geofenceProximityRadius: 2000,

	// iOS options
	stationaryRadius: 2000,

	// Android options
	locationUpdateInterval:2000,

	// Activity Recognition
	stopTimeout: 5,

	// Application config
	debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
	//stopOnTerminate: false,   // <-- Allow the background-service to continue geofencing when user closes the app.
	startOnBoot: true
}

let notifications = []

class BackgroundGeofenceAPI {

  addGeoFences (geofences) {
    BackgroundGeolocation.addGeofences(geofences,
      (success) => {
        console.log('GeofencesAdded')
        this.initialize()
      }, function(failure){
        console.log(failure)
      }
    );
  }

  removeGeoFence (geofence) {
    BackgroundGeolocation.removeGeofence(geofence, function() {
      console.log("Successfully removed geofence");
    }, function(error) {
      console.warn("Failed to remove geofences", error);
    });
  }

  removeGeoFences () {
    BackgroundGeolocation.removeGeofences(function() {
      console.log("Successfully removed geofence");
    }, function(error) {
      console.warn("Failed to remove geofences", error);
    });
  }

	initialize () {
		//Write Up listeners
  	// Fires whenever bgGeo receives a location update.
    BackgroundGeolocation.on('location', this.onLocation);

    // Fires whenever bgGeo receives an error
    BackgroundGeolocation.on('error', this.onError);

    // Fires when movement states changes (stationary->moving; moving->stationary)
    BackgroundGeolocation.on('motionchange', this.onMotionChange);

    // Fires when a change in motion activity is detected
    BackgroundGeolocation.on('activitychange', this.onActivityChange);

    // Fires when the user toggles location-services
    BackgroundGeolocation.on('providerchange', this.onProviderChange);

		// Fires when the list of monitored geofences within #geofenceProximityRadius changed
    BackgroundGeolocation.on('geofenceschange', this.onGeofencesChange);

		// Fired when a geofence crossing event occurs
    BackgroundGeolocation.on('geofence', this.onGeofenceCross);

	  // Configure plugin
    BackgroundGeolocation.configure( configuration , this.onConfigure )

	}

  onConfigure(state) {
    if (!state.enabled) {
      BackgroundGeolocation.start(function() {
        console.log("- Start success");
      });

    }

    BackgroundGeolocation.startGeofences(function(state) {
      console.log('- Geofence-only monitoring started', state.trackingMode);
    });

    //BackgroundGeolocation.stop()
  }

  onError(error) {
    console.log(`${error.type} Error: ${error.code}`);
  }

  onGetCurrentPosition(location, taskId) {
    // This location is already persisted to plugin’s SQLite db.
    // If you’ve configured #autoSync: true, the HTTP POST has already started.
    console.log("- Current position received: ", location);
    BackgroundGeolocation.finish(taskId);
  }

  onGetCurrentPositionError (errorCode){
    switch (errorCode) {
      case 0:
        Alert.alert('Failed to retrieve location', 'Hmmm.. There seems to be a problem loading payment recipients.  We will keep trying.');
        break;
      case 1:
        Alert.alert('Settings Turned off','You must enable location services in Settings in order to load recipients.');
        break;
      case 2:
        Alert.alert('Network error', 'There seems to be a network error.  Please ensure your connection and we will try to load a recipient again.');
        break;
      case 408:
        Alert.alert('Location timeout', 'Unable to load payment recipients at this time. We will keep trying.');
        break;
      }

    }

	onGeofencesChange(event) {
    var on = event.on;   // <-- new geofences activiated.
    var off = event.off; // <-- geofences that were de-activated.

    // Create map circles
    for (var n = 0, len = on.length; n < len; n++) {
    	var geofence = on[n];
      console.log('on', geofence)
      //debugger
      //GeofencesStore.setActiveFence(geofence)
    }

    // Remove map circles
    for (var n = 0, len = off.length; n < len; n++) {
    	var identifier = off[n];
      console.log('off', identifier);
    }

	}

	onGeofenceCross (params, taskId) {
    if (params.action === "EXIT") {
      console.log('exiting', params.identifier)
      OrganizationStore.loadedOrganization = false;
      OrganizationStore.organization = {org_name: null};
      BackgroundGeolocation.finish(taskId);
      return
    }
    // need to parseInt
    var id = parseInt(params.identifier);
    if (isNaN(id)) {
      id = params.identifier;
    }
    //console.log('this is logging')
    //console.log(params)

    OrganizationStore.get(id);

    if(params.hasOwnProperty('extras')){
      let localNotification = {
      	title: params.extras.noti_head,
        body: params.extras.noti_body,
        ios:{
        	sound: true,
        },
        android: {
        	sound: true,
          sticky:false,
        },
      }

      if(PreferencesStore.preferences.location_notifs && notifications.length === 0){

          Expo.Notifications.presentLocalNotificationAsync(localNotification).then((res) => {
            console.log(res)
            notifications.push(res)
          })
  	  }
    }

    BackgroundGeolocation.finish(taskId);

		// // Remove BackgroundGeolocation listeners
    // BackgroundGeolocation.un('geofence');
    // BackgroundGeolocation.un('geofenceschange');

  }

	onLocation (location) {
    //console.log(location)
    var coords = location.coords;
    GeofencesStore.current_coords = coords;
    var place = {
      latitude: coords.latitude,
      longitude: coords.longitude,
    }

    GeofencesStore.mobile_fence = {
      identifier: UserStore.user_data.stripe_user_id+'~mobile',
      latitude: place.latitude,
      longitude: place.longitude,
      notifyOnEntry: true,
      radius: 200,
    }

    BackgroundGeolocation.getGeofences((geofences) => {
      geofences.forEach(function(geofence) {
        let center = {
          latitude: geofence.latitude,
          longitude: geofence.longitude,
        }

          let radius = geofence.radius;

          var isPlace = geolib.isPointInCircle(place, center, radius);
          //console.log('Place test', isPlace, geofence);
          if(isPlace){
            let id = geofence.identifier;
            if(id.indexOf('~')>0){
            	id = id.substr(0, id.indexOf('~'));
            }

            OrganizationStore.get(id);
          }
        });
      });
  }

  onMotionChange (motion) {
    const {isMoving, location} = motion
    if(GeofencesStore.isMobileOn && isMoving){
      GeofencesStore.toggleMobileFence();
    }
    Expo.Location.getCurrentPositionAsync({});
    //console.log(isMoving, location)
    // debugger
  }

  onActivityChange (a,b,c) {
    // console.log(a)
    // console.log(b)
    // console.log(c)
    //debugger
  }

  onProviderChange (a,b,c) {
    // console.log(a)
    // console.log(b)
    // console.log(c)
    // debugger
  }

  onTerminate () {
    BackgroundGeolocation.un('location', this.onLocation);
    BackgroundGeolocation.un('error', this.onError);
    BackgroundGeolocation.un('motionchange', this.onMotionChange);
    BackgroundGeolocation.un('activitychange', this.onActivityChange);
    BackgroundGeolocation.un('providerchange', this.onProviderChange);
    BackgroundGeolocation.un('geofenceschange', this.onGeofencesChange);
    BackgroundGeolocation.un('geofence', this.onGeofenceCross);
    debugger
    Expo.Notifications.dismissAllNotificationsAsync()
  }

}

export default new BackgroundGeofenceAPI()


      // // Gets current position of device
      // BackgroundGeolocation.getCurrentPosition( function(location, taskId) {
      //   console.log('- [js]location: ', JSON.stringify(location));
      //   var coords = location.coords;
      //   var place = {
      //     latitude: coords.latitude,
      //     longitude: coords.longitude,
      //   }
      //
      //   BackgroundGeolocation.getGeofences((geofences) => {
      //     console.log('getting active fences')
      //     console.log(geofences)
      //     geofences.forEach(function(geofence) {
      //       let center = {
      //         latitude: geofence.latitude,
      //         longitude: geofence.longitude,
      //       }
      //
      //       let radius = geofence.radius;
      //
      //       var isPlace = geolib.isPointInCircle(place, center, radius);
      //       console.log(isPlace)
      //       if(isPlace){
      //         OrganizationStore.get(geofence.identifier);
      //       }
      //     });
      //   });
      // }, this.onGetCurrentPositionError, {timeout:10000});
