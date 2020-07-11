import * as React from "react";
import * as ReactNative from "react-native";
import {StatusBar, StyleSheet, View} from 'react-native';
import {AppContainer} from "./src/util/AppRouter";
import NavigationActions from "./src/util/NavigationActions";
import {inject, observer} from "mobx-react";
import * as Helper from "./src/util/Helper";
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import { Player } from '@react-native-community/audio-toolkit';
import PushNotificationAndroid from "react-native-push-android";

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
        this._notificationEvent = PushNotificationAndroid.addEventListener(
            "notification",
            details => {
                const {fcm} = details;
                const title = fcm.title;
                if (title === 'הזמנה חדשה'){
                    //console.log('details', details);
                    this.player = new Player('ding.mp3', {
                        autoDestroy: true,
                        continuesToPlayInBackground: true
                    });
                    this.player.play();
                }
            }
        );
    }

    componentWillUnmount(){
        if (this._notificationEvent !== undefined) {
            this._notificationEvent.remove();
        }
    }

    render() {

        return (
            <View style={{
                flex: 1
            }}>
                <AppContainer
                    ref={ref => NavigationActions.setTopLevelNavigator(ref)}
                    onNavigationStateChange={this.handleNavigationChange}/>
            </View>
        );
    }

    handleNavigationChange = (prevState, newState) => {
        const currentScreen = getActiveRouteName(newState)
        const prevScreen = getActiveRouteName(prevState)
        if (prevScreen !== currentScreen) {
            this
                .props
                .navigationStore
                .onChangeNavigation(prevScreen, currentScreen)
        }
    }
}

const getActiveRouteName = (navigationState) => {
    if (!navigationState) {
        return null;
    }
    const route = navigationState.routes[navigationState.index];
    // dive into nested navigators
    if (route.routes) {
        return getActiveRouteName(route);
    }
    return route.routeName;
}

export default inject("navigationStore")(observer(App));
