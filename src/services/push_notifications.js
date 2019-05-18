import {Permissions, Notifications} from 'expo';
import {AsyncStorage} from 'react-native';

export default async () => {
 
    let previousToken = await AsyncStorage.getItem('pushtoken');
    console.log('previousToken',previousToken); 

    if (previousToken != null) {
        return;
    } else {
        console.log('previous Token is null');
        // isNotToken="0";
        // const TokenNotExist=await AsyncStorage.setItem('isToken', isNotToken);
        let {status} = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        console.log(status);
        if (status !== 'granted') {
            console.log('Hey! You might want to enable notifications for my app, they are good.');
            return;
        }
        console.log('continue');
        let token =await Notifications.getExpoPushTokenAsync();
        console.log('token',token);
        // await axios.post(PUSH_ENDPOINT, {token : {token}});
 
        const savedToken = await AsyncStorage.setItem('pushtoken',token);
        // const isToken="0";
        const tokenFlag= await AsyncStorage.setItem('isTokenSent','0');
    }
};