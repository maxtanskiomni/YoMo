import React from 'react';
import { connectStyle } from '@shoutem/theme';
import { Image, View, Text, Screen, TouchableOpacity } from '@shoutem/ui';
import Modal from 'react-native-simple-modal';

import {observer} from 'mobx-react';
import {action, runInAction,observable} from 'mobx';

import { TextInput } from 'react-native';
import { Actions } from 'react-native-router-flux';

import { firebase } from '../utilities/firebase_api'

@observer
class LoginScreen extends React.Component {

  @observable email = ''
  @observable password = ''
  @observable modalOpen = false;

  focusNextField (nextField) {
    this.refs[nextField].focus()
  }

  login = () => {
    firebase.signIn(this)
  }

  render() {
    const styles = this.props.style;
    const {onNavigate} = this.props;

    return (
      <Screen style={styles.container}>

        <Image
            style={{opacity:0.2,position:'absolute'}}
            source={require('../assets/images/login-background.jpg')} />

        <View style={styles.titleView}>
          <Text style={styles.title}>YoMo</Text>
        </View>

        <View style={styles.fieldsView}>
          <TextInput
            onBlur={this.checkIfUserExists}
            underlineColorAndroid={'transparent'}
            autoCorrect={false}
            style={styles.input}
            placeholder={'Email'}
            returnKeyType={'next'}
            autoCapitalize={'none'}
            placeholderTextColor={'#49A94D'}
            keyboardType={'email-address'}
            onChangeText={e => this.email = e}
            blurOnSubmit={false}
            onSubmitEditing={() => this.focusNextField('PasswordInput')} />

          <TextInput
            ref={'PasswordInput'}
            underlineColorAndroid={'transparent'}
            autoCorrect={false}
            style={styles.input}
            secureTextEntry={true}
            returnKeyType={'go'}
            onSubmitEditing={this.email === '' || this.password === '' ? this.login : () => {}}
            autoCapitalize={'none'}
            placeholder={'Password'}
            placeholderTextColor={'#49A94D'}
            onChangeText={e => this.password = e} />
        </View>

        <View style={styles.buttonsView}>

          <View needsOffscreenAlphaCompositing={true} style={{opacity:this.email === '' || this.password === '' ? 0.4 : 1}}>
            <TouchableOpacity  disabled={this.email === '' || this.password === ''} style={styles.loginButton} onPress={this.login} >
              <Text style={styles.loginText}>LOGIN</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotButton} onPress={Actions.forgot}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.createButton} onPress={Actions.register}>
            <Text style={styles.createText}>Sign Up</Text>
          </TouchableOpacity>

        </View>

        <Modal
          modalStyle={styles.modal}
          open={this.modalOpen}>

          <View style={styles.modalContent}>
            <Text>The login credentials with this email and password failed.</Text>
            <Text>Please try again.</Text>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={{flex:1,padding:10,borderRadius:2}} onPress={() => {this.modalOpen = false,this.total = '0.00'}}>
              <Text style={{textAlign:'center'}}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{flex:1,backgroundColor:'#49A94D',padding:10,borderRadius:2}}
              onPress={() => {this.modalOpen = false}}>
              <Text style={{textAlign:'center',color:'#eef8f3'}}>Ok</Text>
            </TouchableOpacity>
          </View>

        </Modal>

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
    padding:'10%',
  },

  titleView:{
    flex:0.7,
    width:'100%',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center'
  },
  title:{
    fontFamily:'raleway',
    color:'#fff',
    fontSize:75,
    textAlign:'center',
    width:'100%',
    backgroundColor:'transparent'
  },

  fieldsView:{
    width:'100%',
    maxWidth:350,
    flex:1,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center'
  },
  input:{
    height:45,
    padding:10,
    fontFamily:'quicksand',
    backgroundColor:'#eef8f3',
    marginBottom:2,
    color:'#49A94D',
    width:'100%',
    fontSize:18
  },

  buttonsView:{
    flex:1,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    padding:10
  },
  loginButton:{
    borderWidth:2,
    borderColor:'#ecf0f1',
    borderStyle:'solid',
    alignItems:'center',
    width:'100%',
    backgroundColor:'transparent'
  },
  loginText:{
    fontFamily:'quicksand-bold',
    paddingLeft:40,
    paddingRight:40,
    paddingTop:10,
    paddingBottom:10,
    color:'#ecf0f1',
    fontSize:20,
  },
  forgotButton:{
    alignItems:'center',
    marginTop:10,
    backgroundColor:'transparent'
  },
  forgotText:{
    fontFamily:'quicksand',
    padding:20,
    color:'#ecf0f1',
    fontSize:20,
  },
  createButton:{
    alignItems:'center',
    backgroundColor:'transparent'
  },
  createText:{
    fontFamily:'quicksand',
    padding:20,
    color:'#ecf0f1',
    fontSize:20,
  },
  modal:{
    padding:0,
  },
  modalContent:{
    padding:20,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
  },
  modalButtons:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'flex-end'
  },
};

export default connectStyle('com.yomo.LoginScreen', styles)(LoginScreen);
