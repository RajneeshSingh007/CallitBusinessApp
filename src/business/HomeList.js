import React from "react";
import {Platform, FlatList, StatusBar, Text, AppState,StyleSheet } from "react-native";
import { Divider, Heading, NavigationBar, Title, Row, Screen, Subtitle, TouchableOpacity, View, Image } from "@shoutem/ui";
import BusinessMenuChoices from "./BusinessMenuChoices";
import NavigationAction from "./../util/NavigationActions";
import DummyLoader from "../util/DummyLoader";
import * as Helper from './../util/Helper';
import * as Pref from "./../util/Pref";
import { Card, List, Colors } from 'react-native-paper';
import { sizeHeight, sizeWidth, sizeFont } from './../util/Size';
import Moment from 'moment';
// import Lodash from 'lodash'

var now = new Date().getDay();

export default class HomeList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.renderRow = this.renderRow.bind(this);
        this._handleAppStateChange = this._handleAppStateChange.bind(this);
        this.checkTime = this.checkTime.bind(this);
        this.parsetime = this.parsetime.bind(this);
        this.state = {
            bData: null,
            id: 0,
            progressView: true,
            searchVisibility: false,
            clone: [],
            restaurants: [],
            bData: [],
            name: '',
            showMenu: false,
            appstate: AppState.currentState,
            description:'',
            imageUrlss:'',
            token: '',
            businessData:[],
        };
    }

    componentDidMount() {
        try {
            Helper.requestPermissions();
        } catch (e) {
           // //console.log(e);
        }
        //this.fetchAllCat();
        //AppState.addEventListener('change', this._handleAppStateChange);
        this.willFocusListener = this.props.navigation.addListener('willFocus', () => {
            this.setState({ progressView: true });
        });
        this.focusListener = this.props.navigation.addListener('didFocus', () => {
            this.fetchAllCat();
        });
    }

    componentWillUnmount() {
       // AppState.removeEventListener('change', this._handleAppStateChange);
        if (this.focusListener !== undefined) { this.focusListener.remove(); }
        if (this.willFocusListener !== undefined) { this.willFocusListener.remove(); }
    }

    _handleAppStateChange = async nextAppState => {
        const { appState } = this.state;
        //////console.log('nextAppState -->', nextAppState);
        //////console.log('appState -->', appState);
        if (appState === 'active') {
            // do this
        } else if (appState === 'background') {
            // do that
            this.setState({ progressView: true });
            this.fetchAllCat();
        } else if (appState === 'inactive') {
            // do that other thing
        }

        this.setState({ appState: nextAppState });
    };



    /**
     * Fetch all category
     */
    fetchAllCat() {
        Pref.getVal(Pref.bBearerToken, value => {
            const removeQuotes = Helper.removeQuotes(value);
            //////console.log(removeQuotes);
            Helper.networkHelperToken(
                Pref.BranchListURL+0,
                Pref.methodGet,
                removeQuotes,
                result => {
                    //console.log('business', result.business);
                    //console.log('branchList', result);
                    const bb = [];
                    bb.push(result.business);
                    const vv = result.business;
                    const bbx = vv.imageUrl.replace(/%5C/g, "//\\");
                    this.setState({ imageUrlss: bbx, description: vv.description, token: removeQuotes, clone: result.branch, restaurants: result.branch, progressView: false, businessData: bb });
                },
                error => {
                    this.setState({ progressView: false });
                }
            );
        });
    }

    // parsetime(time) {
    //     if (time == null && time == undefined) {
    //         return "";
    //     }
    //     const sp = time.split(" - ");
    //     var start = Moment.duration(sp[0], "HH:mm");
    //     var end = Moment.duration(sp[1], "HH:mm");
    //     var diff = end.subtract(start);
    //     return diff.hours() + ":" + diff.minutes();
    // }

    checkTime(time) {
        if (time == null && time == undefined) {
            return "";
        }
        const sp = time.split(" - ");
        var now = Moment();
        var time = now.hour(); //+ ':' + now.minutes() + ':' + now.seconds();
        //////console.log("currentTime", time);
        if (Number(time) < Number(sp[1])) {
            return true;
        } else {
            return false;
        }
    }

    itemClickx(itemx){
        //////console.log('itemx', itemx);
        const idxx = itemx.idbranch;
        //////console.log('idx', idxx);
        Pref.getVal(Pref.bBearerToken, value => {
            const removeQuotes = Helper.removeQuotes(value);
            //////console.log(removeQuotes);
            Helper.networkHelperToken(
                Pref.BusinessOwnerUrl + idxx,
                Pref.methodGet,
                removeQuotes,
                result => {
                    const bb = [];
                    //////console.log('branchSelected', result);
                    Pref.setVal(Pref.branchSelected, result);
                    NavigationAction.navigate('Home');
                },
                error => {
                }
            );
        });
    }

    parsetime = (time) => {
        if (time === undefined || time === null) {
            return '';
        }
        if (time.includes('#')) {
            const g = time.split("\n");
            let data = "";
            for (let index = 0; index < g.length; index++) {
                if (now === index) {
                    data = g[index];//+ '-' + g[index + 1] + " :" + g[index+2];
                    break;
                }
            }
            return data.replace(/#/g, ':').trim();
        } else {
            return '';
        }
    }

    renderRow(item, index) {
        return (
            <View style={{ flexDirection: 'column', marginHorizontal: sizeWidth(4), marginVertical: sizeHeight(2) }}>
                <Card  style={{
                    borderColor: '#dedede',
                    ...Platform.select({
                        android: {
                            elevation: 2,
                        },
                        default: {
                            shadowColor: 'rgba(0,0,0, .2)',
                            shadowOffset: { height: 0, width: 0 },
                            shadowOpacity: 1,
                            shadowRadius: 1,
                        },
                    }),
                }}
                    onPress={() => this.itemClickx(item)}
                >
                    <View style={{ flexDirection: 'row', }}>
                        <Image
                            styleName="large"
                            source={{ uri: `${Pref.BASEURL}${this.state.imageUrlss}` }}
                            style={{
                                width: sizeWidth(28),
                                height: sizeHeight(20),
                                borderTopRightRadius: 8,
                                borderTopStartRadius: 8,
                                borderBottomRightRadius: 8,
                                borderBottomStartRadius: 8,
                            }}
                        />

                        <View style={{flex:1, flexDirection: 'column', width: '100%', justifyContent: 'space-between' }}>
                            <View style={{flex:0.7, alignContent: 'flex-start', alignItems: 'flex-start', marginStart: 8, marginTop: 4, }}>
                                <Title styleName='bold' style={{
                                    color: '#292929',
                                    fontFamily: 'Rubik',
                                    fontSize: 16,
                                    fontWeight: '700',
                                }}>{Helper.subslongText(item.name, 24)}</Title>
                                {this.state.description !== undefined ?
                                    <Subtitle style={{
                                    color: '#292929',
                                    fontFamily: 'Rubik',
                                    fontSize: 14,
                                    }}>{Helper.subslongText(this.state.description, 24)}</Subtitle> : null}
                                {item.businessHours !== undefined && item.businessHours !== null && item.businessHours !== "" ? <View style={{ flexDirection: 'row', marginEnd: 8 }}>
                                    {/* <Subtitle style={{
                                        color: this.checkTime(item.businessHours) ? '#1BB940' : '#B85050',
                                        fontFamily: 'Rubik',
                                        fontSize: 14,
                                    }}>{this.parsetime(item.businessHours)}</Subtitle>
                                    <View style={{
                                        width: 8, height: 8, backgroundColor: '#292929', borderRadius: 8, margin: 4, alignSelf: 'center',
                                    }} /> */}
                                    <Subtitle style={{
                                        color: '#292929',
                                        fontFamily: 'Rubik',
                                        fontSize: 14,
                                    }}>{this.parsetime(item.businessHours)}  </Subtitle>
                                </View> : null}
                            </View>
                            <View style={{flex:0.3, flexDirection: 'column', width: '100%', alignContent: 'center', marginStart: 8, marginTop: 4,}}>
                                <View style={{
                                    height: 1,
                                    backgroundColor: '#dedede',
                                    width: '90%',
                                    marginHorizontal: sizeWidth(1),
                                    marginVertical: sizeHeight(1),
                                }} />
                                <View style={{ flexDirection: 'row', }}>
                                    {item.rating !== -1 ? <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center', justifyContent: 'space-between' }}><Image
                                        styleName="small v-center h-center"
                                        source={require('./../res/images/smiley.png')}
                                        style={{ width: 24, height: 24, alignSelf: 'center', justifyContent: 'center' }} />
                                        <Subtitle style={{
                                            padding: 2, color: '#292929',
                                            fontFamily: 'Rubik',
                                            fontSize: 14,
                                        }}>{item.rating}</Subtitle></View> : null}
                                    {item.message !== null && item.message !== undefined && item.message !== '' ? <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <View style={{
                                            width: 8, height: 8, backgroundColor: '#292929', borderRadius: 8, margin: 4, alignSelf: 'center',
                                        }} />
                                        <Subtitle style={{
                                            color: '#292929',
                                            fontFamily: 'Rubik',
                                            fontSize: 14,
                                            alignSelf: 'center',
                                        }}>{Helper.subslongText(item.message, 24)}</Subtitle>
                                    </View> : null}
                                    {item.distance !== undefined && !isNaN(Number(item.distance)) ? <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <View style={{
                                            width: 8, height: 8, backgroundColor: '#292929', borderRadius: 8, margin: 4, alignSelf: 'center',
                                        }} />
                                        <Subtitle style={{
                                            color: '#292929',
                                            fontFamily: 'Rubik',
                                            fontSize: 14,
                                            alignSelf: 'center',
                                        }}>{`${Number(item.distance).toFixed(1)} ק"מ`}</Subtitle>
                                    </View> : null}
                                </View>
                            </View>
                        </View>
                    </View>
                </Card>
            </View>
        );
    }


    render() {
        return (
            <Screen style={{
                backgroundColor: "white"
            }}>
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                <NavigationBar
                    styleName="inline no-border"
                    style={
                        {
                            rightComponent: {
                                flex: 0.4,
                            },
                            leftComponent: {
                                flex: 0.4,
                            },
                            centerComponent: {
                                flex: 0.2,
                            },
                            componentsContainer: {
                                flex: 1,
                            }
                        }
                    }
                    rightComponent={
                        <View style={{ flexDirection: 'row', marginEnd: sizeWidth(5) }}>
                            {/* <TouchableOpacity onPress={() => this.setState({ isCatgegoryClicked: 2, filterView: true, })}>
                                <Image source={require('./../res/images/search.png')}
                                    style={{ width: 24, height: 24, marginEnd: 16, }}
                                />
                            </TouchableOpacity> */}
                            <BusinessMenuChoices showBranch={false} />
                        </View>
                    }
                    leftComponent={<View style={{ marginStart: 12 }}>
                        <Heading style={{
                            fontSize: 20,
                            color: '#292929',
                            fontFamily: 'Rubik',
                            fontWeight: '700',
                            alignSelf: 'center'
                        }}>דף הבית</Heading>
                    </View>}
                />
                <View
                    styleName='vertical'
                    style={{
                        flex: 1,
                        backgroundColor: "white",
                    }}>
                    <DummyLoader
                        visibilty={this.state.progressView}
                        center={
                            this.state.restaurants !== undefined &&  this.state.restaurants.length > 0
                                ? <FlatList
                                    extraData={this.state}
                                    showsVerticalScrollIndicator={true}
                                    showsHorizontalScrollIndicator={false}
                                    data={this.state.restaurants}
                                    keyExtractor={(item, index) => item.name}
                                    renderItem={({ item: item, index }) => this.renderRow(item, index)} />
                                : <Subtitle style={{ alignSelf: "center" }}>No branches found...</Subtitle>}

                    />
                </View>
            </Screen>
        );
    }
}

const styles = StyleSheet.create({
    triangleCorner: {
        position: 'absolute',
        right: 0,
        height: sizeHeight(10),
        borderStyle: 'solid',
        borderRightWidth: sizeWidth(16),
        borderBottomWidth: sizeHeight(10),
        borderRightColor: '#3DACCF',
        borderBottomColor: 'transparent',
        borderTopEndRadius: 8,
    },
    inputStyle: {
        height: sizeHeight(8),
        borderRadius: 2,
        borderColor: '#dedede',
        borderStyle: 'solid',
        borderWidth: 1,
        backgroundColor: '#ffffff',
        marginHorizontal: sizeWidth(6),
    },
    buttonStyle: {
        color: "white",
        bottom: 0,
        paddingVertical: 6,
        width: '100%',
        backgroundColor: '#3daccf',
        textAlign: "center"
    }
})