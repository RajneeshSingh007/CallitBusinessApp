import 'react-native-gesture-handler';
import * as React from 'react';
import {Platform} from 'react-native';
import {StatusBar, StyleSheet, View} from 'react-native';
import {AppContainer} from './src/util/AppRouter';
import NavigationActions from './src/util/NavigationActions';
import {inject, observer} from 'mobx-react';
import * as Helper from './src/util/Helper';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {Player} from '@react-native-community/audio-toolkit';
import PushNotificationAndroid from 'react-native-push-android';
import {
  request,
  PERMISSIONS,
  RESULTS,
  requestNotifications,
} from 'react-native-permissions';
import {Notifications} from 'react-native-notifications';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

//@inject('navigationStore')
//@observer
class App extends React.Component {
  constructor(props) {
    super(props);
    changeNavigationBarColor('white', true);
  }

  /**
   * req permissions
   * @returns {Promise<void>}
   */
  componentDidMount() {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.requestPermissions().then(() => {});
      requestNotifications(['alert', 'badge', 'sound']).then(() => {
        //alert('granted');
      });
      Notifications.registerRemoteNotifications();

      Notifications.events().registerNotificationReceivedForeground(
        (notification, completion) => {
          if (notification !== undefined) {
            const title = notification.title;
            if (
              title !== undefined &&
              title !== null &&
              title === 'הזמנה חדשה'
            ) {
              //console.log('details', details);
              this.player = new Player('ding.mp3', {
                autoDestroy: true,
                continuesToPlayInBackground: true,
              });
              this.player.play();
            }
          }
          completion({
            alert: false,
            sound: true,
            badge: false,
          });
        },
      );
    } else {
      this._notificationEvent = PushNotificationAndroid.addEventListener(
        'notification',
        details => {
          const {fcm} = details;
          const title = fcm.title;
          if (title === 'הזמנה חדשה') {
            //console.log('details', details);
            this.player = new Player('ding.mp3', {
              autoDestroy: true,
              continuesToPlayInBackground: true,
            });
            this.player.play();
          }
        },
      );
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      if (this._notificationEvent !== undefined) {
        this._notificationEvent.remove();
      }
    }
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
        }}>
        <AppContainer
          ref={ref => NavigationActions.setTopLevelNavigator(ref)}
          onNavigationStateChange={this.handleNavigationChange}
        />
      </View>
    );
  }

  handleNavigationChange = (prevState, newState) => {
    const currentScreen = getActiveRouteName(newState);
    const prevScreen = getActiveRouteName(prevState);
    if (prevScreen !== currentScreen) {
      this.props.navigationStore.onChangeNavigation(prevScreen, currentScreen);
    }
  };
}

const getActiveRouteName = navigationState => {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  // dive into nested navigators
  if (route.routes) {
    return getActiveRouteName(route);
  }
  return route.routeName;
};

export default inject('navigationStore')(observer(App));
