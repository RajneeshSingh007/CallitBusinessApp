/** @format */
import 'react-native-gesture-handler';
import './src/util/patch';
import React, { Component } from "react";
import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";
import {
    Colors,
    DefaultTheme,
    Provider as PaperProvider
} from "react-native-paper";
import stores from "./src/mobx";
import { Provider } from "mobx-react";
import * as ReactNative from "react-native";
import codePush from 'react-native-code-push';
import * as Pref from './src/util/Pref';


const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#3daccf',
        accent: '#292929',
        backgroundColor: Colors.white,
        surface: Colors.white
    }
};

ReactNative.I18nManager.allowRTL(true);
ReactNative.I18nManager.forceRTL(true);


console.disableYellowBox = true;

function Main() {
    return (
        <Provider {...stores}>
            <PaperProvider theme={theme}>
                <App />
            </PaperProvider>
        </Provider>
    );
}

const checkReleaseMode = true;
let codepushurl = '';

if (checkReleaseMode === true) {
  codepushurl =
    Platform.OS === 'ios'
      ? Pref.PRODUCTION_CODE_PUSH_IOS
      : Pref.PRODUCTION_CODE_PUSH;
} else {
  codepushurl =
    Platform.OS === 'ios' ? Pref.STAGING_CODE_PUSH_IOS : Pref.STAGING_CODE_PUSH;
}

const options = {
  updateDialog: {
    title: 'קיים עדכון חדש',
    appendReleaseDescription: true,
    descriptionPrefix:
      'יש להתקין את העדכון על מנת להמשיך להנות מהאפליקציה במלואה',
    mandatoryContinueButtonLabel: 'עדכון',
    mandatoryUpdateMessage:
      'יש להתקין את העדכון על מנת להמשיך להנות מהאפליקציה במלואה',
    optionalInstallButtonLabel: 'עדכון',
  },
  installMode: codePush.InstallMode.IMMEDIATE,
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  deploymentKey: codepushurl,
};

AppRegistry.registerComponent(appName, () => codePush(options)(Main));

// AppRegistry.registerComponent(appName, () => Main);
