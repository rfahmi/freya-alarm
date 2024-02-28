import React, {useEffect} from 'react';
import {Platform} from 'react-native';
import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';
import PushNotification from 'react-native-push-notification';
import Alarms from './src/screens/Alarms';
import {AppOpenAd, MobileAds, TestIds} from 'react-native-google-mobile-ads';

// Must be outside of any component LifeCycle (such as `componentDidMount`).
PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: function (token) {
    console.log('TOKEN:', token);
  },

  // (required) Called when a remote is received or opened, or local notification is opened
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);

    // process the notification
    PushNotification.cancelAllLocalNotifications();
    // (required) Called when a remote is received or opened, or local notification is opened
    // notification.finish(PushNotificationIOS.FetchResult.NoData);
  },

  // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
  onAction: function (notification) {
    console.log('ACTION:', notification.action);
    console.log('NOTIFICATION:', notification);

    // process the action
  },

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError: function (err) {
    console.error(err.message, err);
  },

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: true,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   * - if you are not using remote notification or do not have Firebase installed, use this:
   *     requestPermissions: Platform.OS === 'ios'
   */
  requestPermissions: Platform.OS === 'ios',
});

PushNotification.channelExists('general', function (exists) {
  if (!exists) {
    PushNotification.createChannel(
      {
        channelId: 'general', // (required)
        channelName: 'General', // (required)
        channelDescription: 'General notifications', // (optional) default: undefined.
        playSound: true, // (optional) default: true
        soundName: 'sahur', // (optional) See `soundName` parameter of `localNotification` function
        importance: 4, // (optional) default: 4. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
      },
      created => {
        created
          ? console.log('createChannel general successfully')
          : console.log('createChannel general failed');
      }, // (optional) callback returns whether the channel was created, false means it already existed.
    );
  } else {
    PushNotification.getChannels(function (channel_ids) {
      console.log('Channels', channel_ids); // ['channel_id_1']
    });
  }
});

// MobileAds()
//   .initialize()
//   .then(adapterStatuses => {
//     // Initialization complete!
//     console.log('Initialization complete!', adapterStatuses);
//   });
// const adUnitId = __DEV__
//   ? TestIds.APP_OPEN
//   : 'ca-app-pub-4714881782641767/5440983579';



const App = () => {
  // const appOpenAd = AppOpenAd.createForAdRequest(adUnitId, {
  //   keywords: ['fashion', 'clothing'],
  // });
  // // Preload an app open ad
  // appOpenAd.load();
  
  // // Show the app open ad when user brings the app to the foreground.
  // appOpenAd.show();

  const requestNotificationPermission = async () => {
    const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
    return result;
  };

  const checkNotificationPermission = async () => {
    const result = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
    return result;
  };
  const requestPermission = async () => {
    const checkPermission = await checkNotificationPermission();
    if (checkPermission !== RESULTS.GRANTED) {
      const r = await requestNotificationPermission();
      if (r !== RESULTS.GRANTED) {
        // permission not granted
      }
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  return <Alarms />;
};

export default App;
