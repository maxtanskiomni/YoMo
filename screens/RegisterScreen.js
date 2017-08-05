import React from 'react';
import { View, Text, ScrollView, TextInput, Alert, Picker, Keyboard} from 'react-native';
import { connectStyle } from '@shoutem/theme';
import { Title,Image, Screen, TouchableOpacity, NavigationBar, Icon } from '@shoutem/ui';

import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import {observer} from 'mobx-react';
import {action, runInAction,observable} from 'mobx';

const Dimensions = require('Dimensions');
const window = Dimensions.get('window');

import { firebase } from '../utilities/firebase_api'
import { Actions } from 'react-native-router-flux';

import * as Animatable from 'react-native-animatable';

@observer
class RegisterScreen extends React.Component {

	@observable firstName = '';
	@observable lastName = '';
	@observable email = '';
	@observable password = '';
	@observable pin = '';
  @observable userRegistered = false;
	@observable isCompany = true;
	@observable business_name = '';
	@observable business_tax_id = '';
	@observable day = '';
	@observable month = '';
	@observable year = '';
	@observable displayCompanyForm = false;
	@observable ssn = '';
	@observable line1 = '';
	@observable city = '';
	@observable region = '';
	@observable zip = '';
	@observable showPicker = false;
	@observable isSolo = false;

  @observable passwordIsVisible = false;

  focusNextField (nextField) {
    this.refs[nextField].focus()
  }

	toggleBusinessForm = () => {
		this.displayCompanyForm = !this.displayCompanyForm;
		this.refs.view.fadeIn(1000);
		this.showPicker = false;
	}

	createUser = () => {
		firebase.register(this.email, this.password)
		let data = {
			firstName: this.firstName,
			lastName: this.lastName,
			email: this.email,
			dob: {
				day: this.day,
				month: this.month,
				year: this.year,
			},
			pin: this.pin,
			default_account: 0,
		}

		let user_key = firebase.insertFB('users', data)

		let preferences = {
			facebook_checkin: true,
			location_autodetect: true,
			location_notifs: true,
			push_notifs: true,
			user: this.email,
		}

		firebase.insertFB('preferences', preferences);

		let params = {
      first_name: this.firstName,
      last_name: this.lastName,
      business_type: 'individual',
      email: this.email,
			user_key: user_key,
			dob: {
				day: this.day,
				month: this.month,
				year: this.year,
			},
    }

		if(this.isCompany){
			if(!this.isSolo){
				params.business_tax_id = this.business_tax_id;
				params.business_type = 'company';
				params.business_name = this.business_name;
			}
			params.personal_id_number = this.ssn;
			params.address = {
				city: this.city,
				line1: this.line1,
				state: this.region,
				postal_code: this.zip,
			};
		}

    var new_user_data = [];
    for (var property in params) {
      let encodedKey = encodeURIComponent(property);
      let encodedValue = encodeURIComponent(params[property]);
      stripe_data.push(encodedKey + "=" + encodedValue);
    }
    new_user_data = stripe_data.join("&");

		fetch('https://yomo-76a36.appspot.com/accounts/add_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new_user_data
    }).then((response) => {
      console.log('this is the response', response);
      if (!response.ok) {
          throw Error(response._bodyText);
      }
      return response;
    })
    .then((data) => {
			this.userRegistered = true;
    })
    .catch((e) => {
      console.log('this is the error:',e);
      Alert.alert('Hmmmm', 'There was an error registering your account.  Please review your inputs and try again!')
    });
	}

  render() {
    const styles = this.props.style;
    const finishDisabled = (
      this.password === ''
      || this.pin.length !== 4
      || !this.email.includes('@')
      || this.firstName.length === 0
      || this.lastName.length === 0
			|| this.month.lenth < 2
			|| this.day.length < 2
			|| this.year.length < 4);

		const finishDisabled2 = (
			this.line1 === ''
			|| this.ssn === ''
			|| ((this.business_name === '' || this.business_tax_id === '') && !this.isSolo)
			|| this.city === ''
			|| this.region === ''
			|| this.year.zip < 5);

    let content = null

		var on = (<Image source={require('../assets/icons/check-outline.png')} style={{height:30,width:30,tintColor:'#49A94D'}} />);
    var off = (<Image source={require('../assets/icons/outline.png')} style={{height:30,width:30,tintColor:'#49A94D'}} />);

    if (this.userRegistered) {
      content = (
        <Animatable.View animation={"fadeIn"}  ref="view" style={Object.assign(...styles.personalInfo,{flex:1})}>

          <Text animation={"fadeIn"} style={{color:'#eef8f3', fontSize:20,flex:0.6, textAlign:'center'}}>
            Hi {this.firstName}!
          </Text>

          <Text animation={"fadeIn"} style={{color:'#eef8f3', fontSize:20,flex:0.6, textAlign:'center'}}>
            You're now registered with us.
          </Text>

          <View animation={"fadeIn"} style={Object.assign(...styles.buttonsView,{flex:1, alignItems:'center'})}>
            <TouchableOpacity style={styles.finishButton} onPress={() => Actions.login()}>
              <Text style={styles.finishText}>Login</Text>
            </TouchableOpacity>
          </View>

        </Animatable.View>
      )
    }else if(this.displayCompanyForm){
			content = (
				<Animatable.View animation={"fadeIn"} ref="view" style={styles.accountsSection}>
					<View style={styles.accountsSection}>
						<TouchableOpacity style={styles.accountButton} onPress={()=>this.isSolo = !this.isSolo}>
							<Text style={styles.accountText}>Sole proprietor?</Text>
							<View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
								{this.isSolo ? on : off}
							</View>
							<View />
						</TouchableOpacity>
					</View>

					<Text style={styles.sectionTitle}>Company Info</Text>
					{this.isSolo ? <View/> :
					<View style={styles.inputRows}>
						<MaterialCommunityIcons style={{alignItems:'center', paddingRight:10}} name='bank' size={28} color="white"/>
						<TextInput
							ref={'BusinessNameInput'}
							placeholder={'Business Name'}
							autoCorrect={false}
							style={styles.input}
							returnKeyType={'next'}
							autoCapitalize={'words'}
							placeholderTextColor={'#49A94D'}
							value={this.business_name}
							onChangeText={e => this.business_name = e}
							onFocus={() =>{this.showPicker = false}}
							blurOnSubmit={false}
							onSubmitEditing={() => this.focusNextField('EINInput')} />


						<TextInput
							ref={'EINInput'}
							placeholder={'Federal EIN'}
							autoCorrect={false}
							keyboardType={'numeric'}
							style={styles.input}
							returnKeyType={'next'}
							autoCapitalize={'words'}
							placeholderTextColor={'#49A94D'}
							value={this.business_tax_id}
							onChangeText={e => this.business_tax_id = e}
							onFocus={() =>{this.showPicker = false}}
							blurOnSubmit={false}
							onSubmitEditing={() => this.focusNextField('SSN')} />
					</View>
				}

					<View style={styles.inputRows}>
						<MaterialIcons style={{alignItems:'center', paddingRight:10}} name='blur-on' size={28} color="white"/>
						<TextInput
							ref={'SSN'}
							placeholder={'SSN'}
							autoCorrect={false}
							style={styles.input}
							returnKeyType={'next'}
							autoCapitalize={'words'}
							placeholderTextColor={'#49A94D'}
							value={this.ssn}
							keyboardType={'numeric'}
							onChangeText={(e) => {if(e.indexOf('.')>-1){return}else if (e.length>=9){this.focusNextField('Line1')} this.ssn = e;}}
							onFocus={() =>{this.showPicker = false}}
							blurOnSubmit={false}
							onSubmitEditing={() => this.focusNextField('Line1')} />
					</View>

					<View style={styles.inputRows}>
						<View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center',width:'100%',}}>
							<MaterialIcons style={{alignItems:'center', paddingRight:10}} name='location-on' size={28} color="white"/>
							<View style={{flex:1,}}>
								<View style={styles.inputRows}>
									<TextInput
										ref={'Line1'}
										placeholder={'Address'}
										autoCorrect={false}
										style={styles.input}
										returnKeyType={'next'}
										autoCapitalize={'words'}
										placeholderTextColor={'#49A94D'}
										value={this.line1}
										onChangeText={e => this.line1 = e}
										onFocus={() =>{this.showPicker = false}}
										blurOnSubmit={false}
										onSubmitEditing={() => this.focusNextField('City')} />
								</View>

								<View style={styles.inputRows}>
									<TextInput
										ref={'City'}
										placeholder={'City'}
										autoCorrect={false}
										style={styles.input}
										returnKeyType={'next'}
										autoCapitalize={'words'}
										placeholderTextColor={'#49A94D'}
										value={this.city}
										onChangeText={e => this.city = e}
										onFocus={() =>{this.showPicker = false}}
										blurOnSubmit={false}
										onSubmitEditing={() => this.focusNextField('State')} />

									<TextInput
										ref={'State'}
										placeholder={'State'}
										autoCorrect={false}
										style={styles.input}
										returnKeyType={'next'}
										autoCapitalize={'words'}
										value={this.region}
										onFocus={() =>{Keyboard.dismiss(); this.showPicker = true}}
										placeholderTextColor={'#49A94D'}
										blurOnSubmit={false}
										onSubmitEditing={() => this.focusNextField('Zip')} />

									<TextInput
										ref={'Zip'}
										placeholder={'Zip'}
										autoCorrect={false}
										style={styles.input}
										returnKeyType={'next'}
										autoCapitalize={'words'}
										placeholderTextColor={'#49A94D'}
										onFocus={() =>{this.showPicker = false}}
										value={this.zip}
										keyboardType={'numeric'}
										onChangeText={(e) => {if(e.indexOf('.')>-1 || e.length>5){return} this.zip = e;}}
										blurOnSubmit={false}/>
								</View>
							</View>
						</View>
					</View>

					<View style={{flexDirection:'row'}}>
						<View style={styles.buttonsView}>
							<TouchableOpacity style={styles.finishButton} onPress={this.toggleBusinessForm}>
								<Text style={styles.finishText}>Back</Text>
							</TouchableOpacity>
						</View>
						<View style={Object.assign({opacity:finishDisabled2 ? 0.6 : 1}, {...styles.buttonsView})}>
							<TouchableOpacity disabled={ finishDisabled2 } style={styles.finishButton} onPress={()=>{this.showPicker = false; this.createUser}}>
								<Text style={styles.finishText}>Finish</Text>
							</TouchableOpacity>
						</View>
					</View>

					{this.showPicker ?
					<Picker
						selectedValue={this.region}
						style={styles.pickerinput}
						onValueChange={(itemValue, itemIndex) => this.region = itemValue}>
						<Picker.Item label="Alabama" value="Alabama" />
						<Picker.Item label="Alaska" value="Alaska" />
						<Picker.Item label="Arizona" value="Arizona" />
						<Picker.Item label="Arkansas" value="Arkansas" />
						<Picker.Item label="California" value="California" />
						<Picker.Item label="Colorado" value="Colorado" />
						<Picker.Item label="Connecticut" value="Connecticut" />
						<Picker.Item label="Delaware" value="Delaware" />
						<Picker.Item label="Florida" value="Florida" />
						<Picker.Item label="Georgia" value="Georgia" />
						<Picker.Item label="Hawaii" value="Hawaii" />
						<Picker.Item label="Idaho" value="Idaho" />
						<Picker.Item label="Illinois" value="Illinois" />
						<Picker.Item label="Indiana" value="Indiana" />
						<Picker.Item label="Iowa" value="Iowa" />
						<Picker.Item label="Kansas" value="Kansas" />
						<Picker.Item label="Kentucky" value="Kentucky" />
						<Picker.Item label="Louisiana" value="Louisiana" />
						<Picker.Item label="Maine" value="Maine" />
						<Picker.Item label="Maryland" value="Maryland" />
						<Picker.Item label="Massachusetts" value="Massachusetts" />
						<Picker.Item label="Michigan" value="Michigan" />
						<Picker.Item label="Minnesota" value="Minnesota" />
						<Picker.Item label="Mississippi" value="Mississippi" />
						<Picker.Item label="Missouri" value="Missouri" />
						<Picker.Item label="Montana" value="Montana" />
						<Picker.Item label="Nebraska" value="Nebraska" />
						<Picker.Item label="Nevada" value="Nevada" />
						<Picker.Item label="New Hampshire" value="New Hampshire" />
						<Picker.Item label="New Jersey" value="New Jersey" />
						<Picker.Item label="New Mexico" value="New Mexico" />
						<Picker.Item label="New York" value="New York" />
						<Picker.Item label="North Carolina" value="North Carolina" />
						<Picker.Item label="North Dakota" value="North Dakota" />
						<Picker.Item label="Ohio" value="Ohio" />
						<Picker.Item label="Oklahoma" value="Oklahoma" />
						<Picker.Item label="Oregon" value="Oregon" />
						<Picker.Item label="Pennsylvania" value="Pennsylvania" />
						<Picker.Item label="Rhode Island" value="Rhode Island" />
						<Picker.Item label="South Carolina" value="South Carolina" />
						<Picker.Item label="South Dakota" value="South Dakota" />
						<Picker.Item label="Tennessee" value="Tennessee" />
						<Picker.Item label="Texas" value="Texas" />
						<Picker.Item label="Utah" value="Utah" />
						<Picker.Item label="Vermont" value="Vermont" />
						<Picker.Item label="Virginia" value="Virginia" />
						<Picker.Item label="Washington" value="Washington" />
						<Picker.Item label="West Virginia" value="jaWest Virginiava" />
						<Picker.Item label="Wisconsin" value="Wisconsin" />
						<Picker.Item label="Wyoming" value="Wyoming" />
					</Picker> : <View/>
				}

				</Animatable.View>
			)
		}else {
      content = (
        <Animatable.View animation={"fadeIn"} ref="view" style={styles.personalInfo}>

						<View style={styles.accountsSection}>
							<Text style={styles.sectionTitle}>Personal Info</Text>
            	<View style={styles.inputRows}>
								<MaterialCommunityIcons style={{alignItems:'center', paddingRight:10}} name='account-card-details' size={28} color="white"/>
	              <TextInput
									ref={'FirstNameInput'}
	                underlineColorAndroid={'transparent'}
	                placeholder={'First Name'}
	                autoCorrect={false}
	                style={styles.input}
	                returnKeyType={'next'}
	                autoCapitalize={'words'}
									value={this.firstName}
	                onChangeText={e => this.firstName = e}
	                placeholderTextColor={'#49A94D'}
	                blurOnSubmit={false}
	                onSubmitEditing={() => this.focusNextField('LastNameInput')}
	                />

	              <TextInput
	                ref={'LastNameInput'}
	                placeholder={'Last Name'}
	                autoCorrect={false}
	                style={styles.input}
	                returnKeyType={'next'}
	                autoCapitalize={'words'}
									value={this.lastName}
	                placeholderTextColor={'#49A94D'}
	                onChangeText={e => this.lastName = e}
	                blurOnSubmit={false}
	                onSubmitEditing={() => this.focusNextField('Month')} />
	            </View>

							<View style={styles.inputRows}>
								<MaterialCommunityIcons style={{alignItems:'center', paddingRight:10}} name='gift' size={28} color="white"/>
								<TextInput
									ref={'Month'}
									underlineColorAndroid={'transparent'}
									placeholder={'mm'}
									keyboardType={'numeric'}
									autoCorrect={false}
									style={styles.dobinput}
									returnKeyType={'next'}
									autoCapitalize={'words'}
									value={this.month}
									onChangeText={(e) => {if(e.indexOf('.')>-1 || e>12){return}else if (e.length>=2){this.focusNextField('Day')} this.month = e;}}
									placeholderTextColor={'#49A94D'}
									blurOnSubmit={false}
									onSubmitEditing={() => this.focusNextField('Day')}
									/>

								<TextInput
									ref={'Day'}
									placeholder={'dd'}
									autoCorrect={false}
									keyboardType={'numeric'}
									style={styles.dobinput}
									returnKeyType={'next'}
									autoCapitalize={'words'}
									placeholderTextColor={'#49A94D'}
									value={this.day}
									onChangeText={(e) => {if(e.indexOf('.')>-1 || e>31){return}else if (e.length>=2){this.focusNextField('Year')} this.day = e;}}
									blurOnSubmit={false}
									onSubmitEditing={() => this.focusNextField('Year')} />

								<TextInput
									ref={'Year'}
									placeholder={'yyyy'}
									autoCorrect={false}
									keyboardType={'numeric'}
									style={styles.input}
									returnKeyType={'next'}
									autoCapitalize={'words'}
									placeholderTextColor={'#49A94D'}
									value={this.year}
									onChangeText={(e) => {if(e.indexOf('.')>-1){return}else if (e.length>=4){this.focusNextField('EmailInput')} this.year = e;}}
									blurOnSubmit={false}
									onSubmitEditing={() => this.focusNextField('EmailInput')} />
							</View>
						</View>

	            <View style={styles.inputRows}>
								<MaterialCommunityIcons style={{alignItems:'center', paddingRight:10}} name='email' size={28} color="white"/>
	              <TextInput
	                ref={'EmailInput'}
	                placeholder={'Email'}
	                onBlur={this.checkIfUserExists}
	                autoCorrect={false}
	                style={styles.input}
	                returnKeyType={'next'}
	                autoCapitalize={'none'}
									value={this.email}
	                placeholderTextColor={'#49A94D'}
	                keyboardType={'email-address'}
	                onChangeText={e => this.email = e}
	                blurOnSubmit={false}
	                onSubmitEditing={() => this.focusNextField('PasswordInput')} />
	            </View>

	            <View style={styles.inputRows}>
								<MaterialCommunityIcons style={{alignItems:'center', paddingRight:10}} name='lock' size={28} color="white"/>
								<TextInput
									ref={'PasswordInput'}
									placeholder={'Password'}
									autoCorrect={false}
									style={styles.input}
									secureTextEntry={!this.passwordIsVisible}
									returnKeyType={'next'}
									autoCapitalize={'none'}
									value={this.password}
									placeholderTextColor={'#49A94D'}
									onChangeText={e => this.password = e}
									blurOnSubmit={false}
									onSubmitEditing={() => this.focusNextField('PinInput')}/>

	              <TextInput
	                ref={'PinInput'}
	                placeholder={'4 Digit PIN'}
									secureTextEntry={true}
	                autoCorrect={false}
	                style={styles.input}
	                returnKeyType={'next'}
	                autoCapitalize={'none'}
	                placeholderTextColor={'#49A94D'}
	                keyboardType={'numeric'}
	                value={this.pin}
	                onChangeText={(e) => {if((e.length>4 || e.indexOf('.')>-1)){return} this.pin = e;}}
	                blurOnSubmit={false}/>

	            </View>

							<View style={styles.accountsSection}>
								<TouchableOpacity style={styles.accountButton} onPress={()=>this.isCompany = !this.isCompany}>
									<Text style={styles.accountText}>Are you an organization?</Text>
									<View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid'}}>
										{this.isCompany ? on : off}
									</View>
									<View />
								</TouchableOpacity>
							</View>

          <View style={Object.assign({opacity:finishDisabled ? 0.6 : 1}, {...styles.buttonsView})}>
            <TouchableOpacity disabled={ finishDisabled } style={styles.finishButton} onPress={this.isCompany ?  this.toggleBusinessForm : this.createUser}>
              <Text style={styles.finishText}>{this.isCompany ? 'Continue' : 'Finish'}</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      )
    }

    return (
      <Screen style={styles.container}>

        <View style={{flex:0.125}} />

				<ScrollView
					ref={(scrollView) => { _scrollView = scrollView; }}
					automaticallyAdjustContentInsets={false}
					scrollEventThrottle={200}
					keyboardDismissMode='on-drag'
					keyboardShouldPersistTaps='always'
					style={styles.scrollView}>

        	{content}

				</ScrollView>

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
	scrollView: {
		flex:1,
		width:window.width*0.9
	},
	sectionTitle:{
		color:'#cceadd',
		fontSize:18,
		textAlign:'left',
		width:'100%',
		padding:10
	},
  personalInfo:{
    width:'100%',
    maxWidth:500,
    flex:1,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center'
  },
  inputRows:{
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
		marginRight: 5,
    fontFamily:'quicksand',
    backgroundColor:'#fff',
    marginBottom:10,
    flex:2,
    color:'#49A94D'
  },
	dobinput:{
		height:45,
		padding:10,
		textAlign: 'center',
		fontFamily:'quicksand',
		backgroundColor:'#fff',
		marginBottom:10,
		flex:2,
		color:'#49A94D'
	},
	pickerinput:{
		height:45,
		width:'100%',
		padding:10,
		marginBottom:10,
		flex:2,
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
	accountsSection:{
		width:'100%',
		flexDirection:'column',
		justifyContent:'center',
		alignItems:'center',
		borderBottomWidth:0,
		borderColor:'#abddc7',
		borderStyle:'solid',
		padding:0
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
    borderWidth:2,
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
    paddingTop:2,
    paddingBottom:5
  },
	accountText:{
		color:'#eef8f3',
		paddingLeft:15,
		flex: 1,
		fontSize:18,
	},
	accountButton:{
		width:'100%',
		height:54,
		flexDirection:'row',
		justifyContent:'space-between',
		alignItems:'center',
		backgroundColor:'#49734B',
		marginBottom:8
	},

};

export default connectStyle('com.yomo.RegisterScreen', styles)(RegisterScreen);
