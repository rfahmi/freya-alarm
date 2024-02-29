import React, {useCallback, useEffect} from 'react';
import {Alert, BackHandler, Button, Platform} from 'react-native';
import {
  MobileAds,
  TestIds,
  useInterstitialAd,
} from 'react-native-google-mobile-ads';
import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';
import PushNotification from 'react-native-push-notification';
import Alarms from './src/screens/Alarms';

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

MobileAds()
  .initialize()
  .then(adapterStatuses => {
    console.log('Initialization complete!', adapterStatuses);
  });

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-4714881782641767/5440983579';

const App = () => {
  const {isLoaded, isClosed, load, show} = useInterstitialAd(adUnitId, {
    requestNonPersonalizedAdsOnly: false,
  });
  const showInterstitialAd = useCallback(() => {
    if (isLoaded) {
      return show();
    } else {
      console.error('Ad not loaded');
    }
  }, [isLoaded, show]);

  useEffect(() => {
    console.log('load ad', {isLoaded});
    if (!isLoaded) {
      load();
    }
  }, [load, isLoaded]);

  useEffect(() => {
    // Closed ad
    if (isClosed) {
      console.log('closed');
      BackHandler.exitApp();
    }
  }, [isClosed]);

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

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        showInterstitialAd();
        // Alert.alert(
        //   'Discard Changes?',
        //   'Are you sure you want to go back? Your changes will be discarded.',
        //   [
        //     {
        //       text: 'Cancel',
        //       onPress: () => null,
        //       style: 'cancel',
        //     },
        //     {
        //       text: 'Discard',
        //       onPress: () => BackHandler.exitApp(), // Or perform your navigation action here
        //     },
        //   ],
        //   {cancelable: false},
        // );
        return true; // Prevent default back action
      },
    );

    return () => backHandler.remove();
  }, [load, showInterstitialAd]);

  return (
    <>
      <Alarms />
      {/* <Button title="Show App Open Ad" onPress={() => showInterstitialAd()} /> */}
    </>
  );
};

export default App;
