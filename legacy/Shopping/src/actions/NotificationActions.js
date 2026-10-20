import firebase from 'firebase';
import {
    NOTIFICATION_FETCH_SUCCESS
} from '../actions/types';

export const fetchNotifications = (userId) => {
    
    return(dispatch) => {
        let notificationList = [];
        firebase.database().ref('/notification/')
        .on('value', snapshot => {
            snapshot.forEach(child => {
                if(child.val().UserId === userId) {

                    notificationList.push({
                        Title: child.val().Title,
                        productId: child.val().productId,
                        Username: child.val().Username,
                        createdAt: child.val().createdAt ,
                        ScreenName: child.val().ScreenName,
                        NotificationId: child.key
                    });
                }
            });
    
            dispatch({ type: NOTIFICATION_FETCH_SUCCESS, payload: notificationList});
        });
    }
    
};