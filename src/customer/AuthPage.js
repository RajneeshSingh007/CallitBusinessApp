import * as React from "react";
import * as Pref from "./../util/Pref";
import { StatusBar,Alert } from "react-native";
import { Screen } from "@shoutem/ui";
import * as Helper from "./../util/Helper";


import moment from 'moment';

import momenttz from 'moment-timezone';
/**
 * AuthPage
 */
export default class AuthPage extends React.Component 
{
    constructor() 
    {
        super();
    }

	/**
	 *
	 */
    componentDidMount() {
        //console.log("MOUNTED AUTHPAGE");
        Pref.getVal(Pref.bLoggedStatus, value => {
            //console.log('value', value);
            var isTrueSet = (value === 'true');
            if (isTrueSet) {
                Pref.getVal(Pref.dateToLogout, (dateToLogout) => {
                    const dateTL = Helper.removeQuotes(dateToLogout);
                    let todayDate = momenttz.tz('Asia/Jerusalem').format(momenttz.HTML5_FMT.DATE);
                    var logout =  moment(dateTL).isBefore(todayDate) || moment(todayDate).isSame(dateTL)
                    //var logout =moment(todayDate).isBefore(dateTL) || moment(todayDate).isSame(dateTL) 
                    if( logout)
                    {
                        Alert.alert(
                            'התנתקות',
                            'נא להתחבר מחדש',
                            [
                              {
                                text: 'אישור', onPress: () => {
                                   Pref.getVal(Pref.bBearerToken, (value) => {
                                    const vax = Helper.removeQuotes(value);
                                     Helper.networkHelperToken(Pref.LogOutUrl, Pref.methodPut, vax, (result) => {
                                      ////console.log("log", result);
                                      Pref.setVal(Pref.bLoggedStatus, false);
                                      Pref.setVal(Pref.bBearerToken, null);
                                      Pref.setVal(Pref.bId, null);
                                      Pref.setVal(Pref.bData, null);
                                      //NavigationActions.navigate('Login');
                                      Helper.itemClick(this.props,'Login');
                                    }, (error) => {
                                      ////console.log('error', error);
                                    });
                                  });
                                }
                              }
                            ]
                        );
                    }
                    else
                    {
                        Helper.itemClick(this.props, "HomeList");
                    }
                });
            } else {
                Helper.itemClick(this.props, "Login");
            }
        });
    }

    render() {
        return <Screen style={{ backgroundColor: "white" }}></Screen>;
    }
}
