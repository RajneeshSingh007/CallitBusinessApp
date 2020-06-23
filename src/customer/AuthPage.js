import * as React from "react";
import * as Pref from "./../util/Pref";
import { StatusBar } from "react-native";
import { Screen } from "@shoutem/ui";
import * as Helper from "./../util/Helper";

/**
 * AuthPage
 */
export default class AuthPage extends React.Component {
    constructor() {
        super();
    }

	/**
	 *
	 */
    componentDidMount() {
        Pref.getVal(Pref.bLoggedStatus, value => {
            //console.log('value', value);
            var isTrueSet = (value === 'true');
            if (isTrueSet) {
                Helper.itemClick(this.props, "HomeList");
            } else {
                Helper.itemClick(this.props, "Login");
            }
        });
    }

    render() {
        return <Screen style={{ backgroundColor: "white" }}></Screen>;
    }
}
