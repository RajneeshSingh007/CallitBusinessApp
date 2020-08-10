import {NativeModules, Platform} from 'react-native';

const {UIManager} = NativeModules;

if (Platform.OS ==='ios'){
  if (UIManager) {
    for (let k in UIManager) {
      if (
        UIManager.hasOwnProperty(k) &&
        UIManager[k] &&
        UIManager[k].directEventTypes
      ) {
        UIManager[k].directEventTypes.onGestureHandlerEvent = {
          registrationName: 'onGestureHandlerEvent',
        };
        UIManager[k].directEventTypes.onGestureHandlerStateChange = {
          registrationName: 'onGestureHandlerStateChange',
        };
      }
    }
  }
}
