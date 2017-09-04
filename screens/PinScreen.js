import React from 'react';
import { connectStyle } from '@shoutem/theme';
import { Image,  Screen, TouchableOpacity } from '@shoutem/ui';
import { TouchableHighlight } from 'react-native';

import { UserStore } from '../stores';

import {observer} from 'mobx-react';
import {action, runInAction,observable} from 'mobx';

import { firebase } from '../utilities/firebase_api'

import { Actions } from 'react-native-router-flux';

import {View,Text} from 'react-native-animatable';

@observer
class PinScreen extends React.Component {

  constructor (props) {
    super(props);
  }

  @observable message = 'Enter PIN';
  @observable display_pin = "- - - -";
  pin = '';

  submit_pin = () => {
    let pin = this.pin*1
    if(pin != UserStore.user_data.pin){
      this.display_pin = '- - - -';
      this.pin = '';
      this.message = 'Incorrect PIN';
      return
    }

    this.props.is_active ? Actions.pop() : Actions.payment();
  }


  onTap(value) {

    if (value === 'clear') {
      this.pin = '';
      return this.display_pin = '- - - -';

    }

    let tempPin = this.pin.replace(/\D+/g, '');

    if (value === 'backspace') {
      tempPin = tempPin.slice(0, tempPin.length - 1);
    } else {
      tempPin += value;
    }

    this.pin = tempPin;

    if(tempPin.length === 0){
      this.display_pin = '- - - -';

    }else if(tempPin.length === 1) {
      this.display_pin = '* - - -';

    }else if(tempPin.length === 2){
      this.display_pin = '* * - -';

    }else if(tempPin.length === 3){
      this.display_pin = '* * * -';

    }else if(tempPin.length === 4){
      this.display_pin = '* * * *';
      this.submit_pin();
    }

  }

  render() {
    const styles = this.props.style;

    content = (
      <View style={{flex:10,flexDirection:'column',justifyContent:'space-between',alignItems:'stretch'}}>
        <View style={styles.information}>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={styles.total}>{this.message}</Text>
          </View>
          <Text style={styles.organization}>{this.display_pin}</Text>
        </View>

        <View style={styles.numPad}>

          <View style={styles.buttonRow}>

            <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,1)} >
              <Text style={styles.numberText}>1</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,2)} >
              <Text style={styles.numberText}>2</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,3)} >
              <Text style={styles.numberText}>3</Text>
            </TouchableOpacity>

          </View>

          <View style={styles.buttonRow}>

            <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,4)} >
              <Text style={styles.numberText}>4</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,5)} >
              <Text style={styles.numberText}>5</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,6)} >
              <Text style={styles.numberText}>6</Text>
            </TouchableOpacity>

          </View>

          <View style={styles.buttonRow}>

            <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,7)} >
              <Text style={styles.numberText}>7</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,8)} >
              <Text style={styles.numberText}>8</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,9)} >
              <Text style={styles.numberText}>9</Text>
            </TouchableOpacity>

          </View>

          <View style={styles.buttonRow}>

            <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,'clear')}>
              <Text style={{color:'#49A94D',fontSize:18,top:-2,fontFamily:'quicksand'}}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,0)} >
              <Text style={styles.numberText}>0</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.numberButton} onPress={this.onTap.bind(this,'backspace')}>
              <Image
                style={{width:28,height:28,tintColor:'#49A94D',left:-1}}
                source={require('../assets/icons/backspace_white.png')} />
            </TouchableOpacity>

          </View>

        </View>
      </View>
      );

    return (
      <Screen style={styles.container} >

        {content}

      </Screen>
    );
  }

}

const styles = {
  container: {
    flex: 1,
    padding:'10%',
    flexDirection:'column',
    justifyContent:'space-between',
    alignItems:'stretch',
    backgroundColor:"#77827d",
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

  modalEmphasis:{
    fontFamily:'quicksand-bold',
    fontSize:16,
    margin:10,
    textAlign:'center'
  },

  modalButtons:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'flex-end'
  },

  icons:{
    flex:1,
    width:'100%',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
  },

  information:{
    flex:2,
    width:'100%',
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
  },
  total:{
    fontSize:50,
    textAlign:'center',
    paddingBottom:10,
    color:'#eef8f3',
    fontFamily:'quicksand'
  },
  organization:{
    fontSize:26,
    color:'#eef8f3',
    fontFamily:'quicksand'
  },
  numPad:{
    flex:7,
    width:'100%',
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
  },
  buttonRow:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center'
  },
  numberButton:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    width:60,
    height:60,
    borderRadius:60,
    backgroundColor:'#fff',
    margin:5
  },
  numberText:{
    color:'#49A94D',
    fontSize:30,
    top:-3,
    fontFamily:'quicksand'
  },

  confirmation:{
    flex:1,
    width:'100%',
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center'
  },

  thankYouText:{
    flex:2,
    fontSize:30,
    color:'#eef8f3'
  }

};

export default connectStyle('com.yomo.PinScreen', styles)(PinScreen);
