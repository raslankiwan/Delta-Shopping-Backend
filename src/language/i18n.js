import { I18nManager } from 'react-native';
import I18n from 'react-native-i18n';

// Import all locales
import en from './en.json';
import ar from './ar.json';

import moment from 'moment'

I18n.translations = { en, ar };
I18n.fallbacks = true; 

if (I18nManager.isRTL) {
	I18n.locale = 'ar';
	// require('moment/locale/ar');
}else{
	I18n.locale = 'en';
	require('moment/locale/en-gb');
}

export default I18n;
