import React from 'react';
import { ScrollView } from 'react-native';
import { connectStyle } from '@shoutem/theme';
import { Title,Image, View, Text, Screen, TouchableOpacity, NavigationBar, Icon } from '@shoutem/ui';

import {observer} from 'mobx-react';
import {action, runInAction,observable} from 'mobx';

import { AccountsStore,UserStore,TransactionsStore } from '../stores';

import TextInput from '../components/TextInput';

import { Actions } from 'react-native-router-flux';

import { firebase } from '../utilities/firebase_api'

const Dimensions = require('Dimensions');
const window = Dimensions.get('window');

@observer
class HistoryScreen extends React.Component {

  render() {
    const styles = this.props.style;
    let transactions = TransactionsStore.transactions;

		let transactionsComponents = transactions.map((a,idx) => {
      let amount = parseFloat(a.amount).toFixed(2);;

			return(
				<TouchableOpacity key={idx} style={styles.accountButton} onPress={()=>Actions.data({mode:'transaction', idx:idx})}>
					<View style={{backgroundColor:'#eef8f3',height:54,width:54,flexDirection:'column',justifyContent:'center',alignItems:'center',borderRightWidth:3,borderColor:'#49A94D',borderStyle:'solid',}}>
					  <Text style={{fontSize:22,color:'#49A94D'}}>To</Text>
					</View>
          <View style={{flexDirection: 'column', flex:1, justifyContent:'flex-start'}}>
				    <Text style={styles.accountText}>{a.recip_name}</Text>
            <Text style={styles.secondaryText}>{a.date}</Text>
          </View>
          <View style={{flexDirection: 'column', flex:1, justifyContent:'center', paddingRight: 10,}}>
            <Text style={styles.moneyText}>{'$'+amount}</Text>
          </View>
					<View />
				</TouchableOpacity>
			);
		});

    return (
      <Screen style={styles.container}>

				<View style={{height:60}}/>

        <ScrollView
          ref={(scrollView) => { _scrollView = scrollView; }}
          automaticallyAdjustContentInsets={false}
          scrollEventThrottle={200}
          style={styles.scrollView}>

					<View style={styles.accountsSection}>
						<Text style={styles.sectionTitle}>Transaction History</Text>
						{transactionsComponents.reverse()}
					</View>
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
    paddingBottom:'5%'
  },

  scrollView: {
    flex:1,
		width:window.width
  },

	sectionTitle:{
    color:'#cceadd',
    fontSize:18,
		textAlign:'left',
		width:'100%',
		padding:10
	},

	accountsSection:{
		width:'100%',
		flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
		borderBottomWidth:0,
		borderColor:'#abddc7',
		borderStyle:'solid',
		padding:10
	},

	accountButton:{
		width:'90%',
		height:54,
		flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
		backgroundColor:'#49734B',
		marginBottom:8
	},

  accountText:{
		color:'#eef8f3',
		paddingLeft:15,
  },

  secondaryText:{
    color:'#eef8f3',
    paddingLeft:15,
    fontSize:12,
  },

  moneyText:{
    color:'#eef8f3',
    paddingLeft:15,
    fontSize:16,
    textAlign: 'right',
  },


};

export default connectStyle('com.yomo.HistoryScreen', styles)(HistoryScreen);
