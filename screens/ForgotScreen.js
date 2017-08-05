import React from 'react';
import { ScrollView, TextInput, Alert } from 'react-native';
import { connectStyle } from '@shoutem/theme';
import { Title,Image, View, Text, Screen, TouchableOpacity, NavigationBar, Icon } from '@shoutem/ui';

import {observer} from 'mobx-react';
import {action, runInAction,observable} from 'mobx';

import { firebase } from '../utilities/firebase_api'

@observer
class ForgotScreen extends React.Component {

	@observable email = '';
  @observable passwordIsVisible = false;
	@observable executed = false;


  focusNextField (nextField) {
    this.refs[nextField].focus()
  }

	emailUser = () => {
		this.executed = true;
		firebase.sendPasswordReset(this.email);
		// Alert.alert('Email sent', 'The email with the link to reset your password has been set.');
		// Actions.pop();
	}

  render() {
    const styles = this.props.style;

		const navBack = (
			<TouchableOpacity>
				<Image
					style={{width: 30, height: 30,tintColor:'#fff'}}
					source={require('../assets/icons/arrow_left_white.png')} />
			</TouchableOpacity>
		);

		let passwordVisibilityIcon = (
      <Image
        style={styles.eye}
        source={require('../assets/icons/eye.png')} />
		);

    if (this.passwordIsVisible) {
      passwordVisibilityIcon = (
        <Image
          style={styles.eye}
          source={require('../assets/icons/eye-off.png')} />
      );
    }

    return (
      <Screen style={styles.container}>

        <View style={styles.personalInfo}>

				<View style={styles.sectionHeaderContainer}>
					<Text style={styles.sectionHeader}>{this.executed ? 'It has been sent!  Check your email to reset your password.' : 'Enter your email so that we may send you a recovery link.'}</Text>
				</View>

          <View style={styles.inputRows}>
						{this.executed ? <View/> : <TextInput
							ref={'EmailInput'}
							placeholder={'Email'}
							onBlur={this.checkIfUserExists}
							autoCorrect={false}
							style={styles.input}
							returnKeyType={'next'}
							autoCapitalize={'none'}
							placeholderTextColor={'#49A94D'}
							keyboardType={'email-address'}
							onChangeText={e => this.email = e}
							blurOnSubmit={true}  />}
          </View>

        </View>

        {this.executed ? <View/>: <View style={styles.buttonsView}>
          <TouchableOpacity disabled={false} style={styles.finishButton} onPress={this.emailUser}>
            <Text style={styles.finishText}>Submit</Text>
          </TouchableOpacity>
        </View> }

				<View style={{flex:0.6}} />

      </Screen>
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
    paddingRight:'10%',
    paddingLeft:'10%',
    paddingBottom:'10%'
  },

  navContainer:{
    backgroundColor:'transparent',
    paddingTop:20,
    paddingLeft:10,
    paddingRight:10,
  },

  navTitle:{
    fontFamily:'quicksand',
    color:'#fff',
    fontSize:25
  },


  sectionHeaderContainer:{
    flex:1,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    borderStyle:'solid',
    borderColor:'#ddf1e8',
    width:'100%',
  },
  sectionHeader:{
    width:'100%',
    fontFamily:'quicksand',
    fontSize:22,
    color:'#ddf1e8',
    textAlign:'center'
  },

  personalInfo:{
    width:'100%',
    maxWidth:500,
    flex:1,
    flexDirection:'column',
    justifyContent:'flex-start',
    alignItems:'center'
  },
  inputRows:{
		flex:0.2,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  label:{
    fontFamily:'quicksand',
    color:'#ddf1e8',
    fontSize:16,
    paddingRight:15,
    top:-7,
    flex:1
  },
  input:{
    height:45,
    padding:10,
    fontFamily:'quicksand',
    backgroundColor:'#fff',
    marginBottom:10,
    flex:2,
    color:'#fff'
  },
  eye:{
    marginTop:-5,
    width:30,
    height:30
  },

  accounts:{
    width:'100%',
    maxWidth:500,
    flex:0.3,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    borderColor:'#ecf0f1',
    borderStyle:'solid',
  },

  buttonsView:{
    flex:0.2,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    padding:10,
    width:'100%',
    maxWidth:500,
  },
  finishButton:{
    marginTop:10,
    borderWidth:1,
    width:150,
    borderColor:'#ddf1e8',
    borderStyle:'solid',
    alignItems:'center',
    backgroundColor:'transparent'
  },
  finishText:{
    fontFamily:'quicksand',
    color:'#ddf1e8',
    fontSize:20,
    paddingTop:5,
    paddingBottom:5
  },
	thankYouText:{
		flex:2,
		fontSize:30,
		color:'#eef8f3'
	},
};

export default connectStyle('com.yomo.ForgotScreen', styles)(ForgotScreen);
