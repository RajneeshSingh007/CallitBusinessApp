/** @format */

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

AppRegistry.registerComponent(appName, () => Main);
