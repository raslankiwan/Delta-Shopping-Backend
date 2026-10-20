import React, { Component } from 'react'
import { AsyncStorage, I18nManager } from 'react-native'
import {Button, ListItem } from 'react-native-elements';
import COLOR from '../constants/Colors';
import I18n from '../language/i18n';
import {View} from 'react-native';



class ChangeLanguageScreen extends Component {
	constructor() {
		super();
		this.state = {
			'language':I18n.locale
		}

		this.handleLanguageSelect = this.handleLanguageSelect.bind(this);
		this.showLanguageAsSelected = this.showLanguageAsSelected.bind(this);
		this.changeLanguage = this.changeLanguage.bind(this);
	}


	handleLanguageSelect(lang){

		this.setState({language:lang});
	}

	showLanguageAsSelected(lang) {
		if (this.state.language == lang) {
			return {name:'check', color:COLOR.Yellow}
		}

		return {};
	}

	async changeLanguage(lang) {
		console.log('changeLanguage clicked',lang)
		// this.setState({language:this.state.language});

		// // this.props.languageChanged(this.state.language);

		 const langSaveResult = await AsyncStorage.setItem('language', lang);
		 // I18n.locale = lang;
		if (lang=='ar') {
			I18nManager.forceRTL(true);
			I18nManager.allowRTL(true);
		}else{
			I18nManager.forceRTL(false);
			I18nManager.allowRTL(false);
		}

		// //restart the app when the user change the language
		Expo.Updates.reload();
	}
	render(){
		return (
			<View style={styles.mainContainer}>
				<ListItem
					title={I18n.t('Language.English')}
					onPress={() => this.handleLanguageSelect('en')}
					rightIcon = { this.showLanguageAsSelected('en') }
					leftIcon = { {name :'language' }} 
					containerStyle={styles.ListItemStyle}
					titleStyle={{textAlign:'left'}}
				/>
				<ListItem
					title={I18n.t('Language.Arabic')}
					onPress={() => this.handleLanguageSelect('ar')}
					rightIcon = { this.showLanguageAsSelected('ar') }
					leftIcon = { {name :'language' }}
					containerStyle={styles.ListItemStyle} 
					titleStyle={{textAlign:'left'}}
				/>
			<View style={styles.btnContainer}>
				<Button
				    raised
					title={I18n.t('Language.Save')}
					onPress = {()=>{this.changeLanguage(this.state.language)}}
					buttonStyle={styles.btnStyle}
					containerStyle={{marginTop:15, }}
					icon={{name: "check",size: 15,color: "white"}}
					iconRight
				/>
			</View>
			
			</View >
			)
	}
};
const styles={
	mainContainer:{
		height:'100%', 
		backgroundColor:'#fff', 

	}, 
	ListStyle:{
		borderColor:'#fff', 
		borderWidth:5, 
	}, 
	ListItemStyle:{
		borderColor:COLOR.lightGray, 
		borderBottomWidth:1, 
	}, 
	btnContainer:{
		justifyContent:'center', 
		alignItems:'center'
	}, 
	btnStyle:{ 
		justifyContent:'center', 
		backgroundColor:COLOR.primary, 
		borderRadius:5, 
		paddingLeft:10,
		paddingRight:10,
	  },
	
}
export default ChangeLanguageScreen;
