import React from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Divider,
  Heading,
  NavigationBar,
  Row,
  Screen,
  Subtitle,
  TouchableOpacity,
  View,
  Image,
} from '@shoutem/ui';
import {
  Button,
  Checkbox,
  Colors,
  Dialog,
  FAB,
  Portal,
  Snackbar,
  TextInput,
} from 'react-native-paper';
import * as Helper from './../util/Helper';
import * as Pref from './../util/Pref';
import {Loader} from './../customer/Loader';
import NavigationAction from './../util/NavigationActions';
import {sizeWidth, sizeHeight} from '../util/Size';
import {SafeAreaView} from 'react-navigation';

export default class BusinesseditProduct extends React.Component {
  constructor(props) {
    super(props);
    this.renderRow = this.renderRow.bind(this);
    this.state = {
      progressView: false,
      categoryList: [],
      selectedOptions: '',
      hideView: false,
      extraName: '',
      message: '',
      multi: false,
      extraNameOpt: '',
      extraPrice: '',
      tempData: [],
      dialogShow: false,
      tempName: '',
      extraNameOptd: '',
      extraPriced: '',
      showCat: false,
      extraMode: false,
      extraCatId: 0,
      extraSingle: 0,
      bId: null,
    };
  }

  componentDidMount() {
    this.fetchAllExtraCat();
  }

  fetchAllExtraCat() {
    // const {state} = this.props.navigation;
    //const itemData = state.params.extraMode;
    Pref.getVal(Pref.bId, value => {
      this.setState({bId: value});
    });
    this.setState({progressView: true, extraMode: false});
    Pref.getVal(Pref.bBearerToken, value => {
      const removeQuotes = Helper.removeQuotes(value);
      Helper.networkHelperToken(
        Pref.ExtraCatUrl,
        Pref.methodGet,
        removeQuotes,
        result => {
          //////console.log(result);
          this.setState({categoryList: result, progressView: false});
        },
        error => {
          this.setState({progressView: false});
        },
      );
    });
  }

  /**
   *
   * Add extra
   */
  addExtra() {
    this.setState({progressView: true});
    Pref.getVal(Pref.bBearerToken, value => {
      const removeQuotes = Helper.removeQuotes(value);
      Helper.networkHelperTokenPost(
        Pref.AddExtraUrl,
        JSON.stringify(this.state.tempData),
        Pref.methodPost,
        removeQuotes,
        result => {
          //////console.log(result);
          this.setState({
            categoryList: [],
            tempData: [],
            message: result,
            progressView: false,
            extraNameOpt: '',
            extraPrice: '',
            extraNameOptd: '',
            extraPriced: '',
            multi: false,
            extraCatId: 0,
            tempName: '',
          });
        },
        error => {
          this.setState({progressView: false});
        },
      );
    });
  }

  /**
   * add extra items
   */
  addExtraOptions() {
    if (this.state.extraNameOpt !== '' && this.state.extraPrice !== '') {
      const cloned = this.state.tempData;
      cloned.push({
        fkidcategory: this.state.extraCatId,
        name: this.state.extraNameOpt,
        price: this.state.extraPrice,
        fkidbusiness: this.state.bId,
      });
      this.setState({
        tempData: cloned,
        hideView: false,
        extraNameOpt: '',
        extraPrice: '',
      });
    } else {
      this.props.callback('empty data');
    }
  }

  _showDialog = () => this.setState({dialogShow: true});

  _hideDialog = () => this.setState({dialogShow: false});

  editItems(name, price) {
    this.setState({
      hideView: false,
      extraNameOptd: name,
      extraPriced: price,
      tempName: name,
      dialogShow: true,
    });
  }

  editSave() {
    const cloned = this.state.tempData;
    const op = this.state.tempName;
    const newName = this.state.extraNameOptd;
    const newPrice = this.state.extraPriced;
    const doom = cloned.some(function(obj) {
      if (obj.name === op) {
        obj.name = newName;
        obj.price = newPrice;
        return true;
      }
    });
    this.setState({
      tempData: cloned,
      hideView: false,
      extraNameOptd: '',
      extraPriced: '',
      dialogShow: false,
      tempName: '',
    });
  }

  /**
   *
   * @param {*} rowData
   * @param {*} index
   */
  renderRow(rowData, index) {
    return (
      <TouchableOpacity
        onPress={() => this.editItems(rowData.name, rowData.price)}>
        <Row>
          <View styleName="horizontal wrap sm-gutter">
            <Subtitle numberOfLines={1}>{rowData.name}</Subtitle>
            <Subtitle
              numberOfLines={2}
              styleName="bold"
              style={{
                marginStart: 10,
              }}>
              {rowData.price}$
            </Subtitle>
          </View>
          <TouchableWithoutFeedback
            onPress={() => {
              const cloned = this.state.tempData;
              cloned.splice(index);
              this.setState({tempData: cloned});
            }}>
            <Image
              source={require('../res/images/delete.png')}
              style={{
                width: 14,
                height: 17,
                marginStart: sizeWidth(4),
                alignSelf: 'center',
              }}
            />
          </TouchableWithoutFeedback>
        </Row>
      </TouchableOpacity>
    );
  }

  renderCatRow(rowData, index) {
    return (
      <TouchableOpacity
        onPress={() =>
          this.setState({
            extraName: rowData.name,
            showCat: false,
            extraCatId: rowData.idcategory,
            extraSingle: rowData.single,
          })
        }>
        <Row>
          <Subtitle numberOfLines={1}>{rowData.name}</Subtitle>
        </Row>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <SafeAreaView style={styles.maincontainer} forceInset={{top: 'never'}}>
        <Screen style={styles.maincontainer}>
          <View styleName="vertical sm-gutter">
            <Subtitle
              style={{
                color: '#292929',
                fontSize: 16,
                marginTop: sizeHeight(1),
                marginHorizontal: sizeWidth(2),
              }}>
              שם קטגורית התוספת
            </Subtitle>

            <TouchableWithoutFeedback
              onPress={() => this.setState({showCat: true})}>
              <View
                style={{
                  alignItem: 'flex-start',
                  justifyContent: 'center',
                  borderColor: '#dedede',
                  borderStyle: 'solid',
                  borderWidth: 1,
                  color: '#000000',
                  height: 60,
                  marginHorizontal: sizeWidth(1),
                }}>
                <Subtitle
                  style={{
                    color: '#292929',
                    fontSize: 14,
                    alignSelf: 'flex-start',
                    marginHorizontal: sizeWidth(2),
                  }}>
                  {this.state.extraName !== ''
                    ? ':  ' + this.state.extraName
                    : 'Select Extra Cat'}
                </Subtitle>
              </View>
            </TouchableWithoutFeedback>

            {/* <Row>
            <TouchableOpacity onPress={() => this.setState({ showCat: true })}>
              <View styleName="v-end h-end sm-gutter">
                <Subtitle>
                  Extra Name{" "}
                  
                </Subtitle>
              </View>
            </TouchableOpacity>
          </Row> */}

            <View styleName="horizontal v-start h-start sm-gutter">
              <Checkbox.Android
                uncheckedColor={'#dedede'}
                status={this.state.extraSingle === 1 ? 'checked' : 'unchecked'}
                color={'#3DACCF'}
              />
              <Subtitle
                styleName="bold"
                style={{
                  alignSelf: 'center',
                  color: '#292929',
                }}>
                אפשר לבחור מספר תוספות
              </Subtitle>
            </View>
            <TouchableWithoutFeedback
              onPress={() =>
                this.setState({
                  hideView: !this.state.hideView,
                })
              }>
              <View
                style={{
                  alignItem: 'flex-start',
                  justifyContent: 'center',
                  borderColor: '#dedede',
                  borderStyle: 'solid',
                  borderWidth: 1,
                  color: '#000000',
                  height: 60,
                  marginHorizontal: sizeWidth(1),
                }}>
                <Subtitle
                  style={{
                    color: '#292929',
                    fontSize: 14,
                    alignSelf: 'flex-start',
                    marginHorizontal: sizeWidth(2),
                  }}>
                  
                  Add Extra Option
                </Subtitle>
              </View>
            </TouchableWithoutFeedback>
            {this.state.hideView === true ? (
              <View style={{marginTop: sizeHeight(1)}}>
                <View styleName="horizontal sm-gutter">
                  <TextInput
                    style={[
                      styles.inputStyle,
                      {marginEnd: sizeWidth(1.5), flex: 1},
                    ]}
                    mode={'flat'}
                    label={'Extra Name Option'}
                    password={false}
                    returnKeyType="next"
                    numberOfLines={1}
                    value={this.state.extraNameOpt}
                    onChangeText={text => this.setState({extraNameOpt: text})}
                    underlineColor={'transparent'}
                    underlineColorAndroid={'transparent'}
                  />

                  <TextInput
                    style={[styles.inputStyle, {flex: 1}]}
                    mode={'flat'}
                    label={'Price'}
                    password={false}
                    returnKeyType="done"
                    numberOfLines={1}
                    keyboardType={'number-pad'}
                    value={this.state.extraPrice}
                    onChangeText={text => this.setState({extraPrice: text})}
                    underlineColor={'transparent'}
                    underlineColorAndroid={'transparent'}
                  />
                </View>

                <TouchableWithoutFeedback
                  onPress={() => this.addExtraOptions()}>
                  <View
                    style={{
                      alignItem: 'flex-start',
                      justifyContent: 'center',
                      borderColor: '#dedede',
                      borderStyle: 'solid',
                      borderWidth: 1,
                      color: '#000000',
                      height: 60,
                      marginHorizontal: sizeWidth(1),
                      marginTop: sizeHeight(1),
                    }}>
                    <Subtitle
                      style={{
                        color: '#292929',
                        fontSize: 14,
                        alignSelf: 'flex-start',
                        marginHorizontal: sizeWidth(2),
                      }}>
                      
                      Add
                    </Subtitle>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            ) : null}
          </View>
          {this.state.showCat === true ? (
            <Portal>
              <Dialog
                visible={() => {
                  this.setState({showCat: true});
                }}
                onDismiss={() => {
                  this.setState({showCat: false});
                }}>
                <Dialog.Title>Select extra Category</Dialog.Title>
                <Divider styleName="line" />
                <Dialog.Content>
                  {this.state.categoryList.length > 0 ? (
                    <FlatList
                      extraData={this.state}
                      data={this.state.categoryList}
                      ItemSeparatorComponent={() => {
                        return <Divider styleName="line" />;
                      }}
                      keyExtractor={(item, index) => item.name}
                      renderItem={({item: item, index}) =>
                        this.renderCatRow(item, index)
                      }
                    />
                  ) : null}
                </Dialog.Content>
              </Dialog>
            </Portal>
          ) : null}
          {this.state.dialogShow === true ? (
            <Portal>
              <Dialog visible={this._showDialog} onDismiss={this._hideDialog}>
                <Dialog.Title>Edit Extra Options</Dialog.Title>
                <Divider styleName="line" />
                <Dialog.Content>
                  <View styleName="vertical sm-gutter">
                    <TextInput
                      style={{
                        backgroundColor: 'white',
                        marginBottom: 6,
                        marginTop: 6,
                        borderWidth: 1,
                        borderBottomEndRadius: 4,
                        borderBottomLeftRadius: 4,
                        borderBottomRightRadius: 4,
                        borderBottomStartRadius: 4,
                        borderTopEndRadius: 4,
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                        borderTopStartRadius: 4,
                        borderColor: '#eeeeee',
                      }}
                      mode={'flat'}
                      label={'Extra Name Option'}
                      password={false}
                      returnKeyType="next"
                      numberOfLines={1}
                      value={this.state.extraNameOptd}
                      onChangeText={text =>
                        this.setState({extraNameOptd: text})
                      }
                      underlineColor={'transparent'}
                      underlineColorAndroid={'transparent'}
                    />

                    <TextInput
                      style={{
                        backgroundColor: 'white',
                        marginBottom: 6,
                        marginTop: 6,
                        borderWidth: 1,
                        borderBottomEndRadius: 4,
                        borderBottomLeftRadius: 4,
                        borderBottomRightRadius: 4,
                        borderBottomStartRadius: 4,
                        borderTopEndRadius: 4,
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                        borderTopStartRadius: 4,
                        borderColor: '#eeeeee',
                      }}
                      mode={'flat'}
                      label={'Price'}
                      password={false}
                      returnKeyType="done"
                      numberOfLines={1}
                      keyboardType={'numeric'}
                      value={this.state.extraPriced}
                      onChangeText={text => this.setState({extraPriced: text})}
                      underlineColor={'transparent'}
                      underlineColorAndroid={'transparent'}
                    />

                    <Button
                      mode={'contained'}
                      style={styles.buttonStyle}
                      onPress={() => this.editSave()}>
                      <Subtitle
                        styleName="v-center h-center"
                        style={{
                          color: 'white',
                        }}>
                        Done
                      </Subtitle>
                    </Button>
                  </View>
                </Dialog.Content>
              </Dialog>
            </Portal>
          ) : null}
          {this.state.tempData.length > 0 ? (
            <FlatList
              extraData={this.state}
              data={this.state.tempData}
              ItemSeparatorComponent={() => {
                return (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: '#dedede',
                      marginVertical: sizeHeight(0.5),
                    }}
                  />
                );
              }}
              keyExtractor={(item, index) => item.name}
              renderItem={({item: item, index}) => this.renderRow(item, index)}
            />
          ) : null}
          {/* <FAB
          style={styles.fab}
          small={false}
          label={this.state.extraMode === false ? "Add Extra" : "Edit Extra"}
          color={Colors.white}
          onPress={() => this.addExtra()}
        /> */}
          {/* <Button 
            styleName=" muted border"
            mode={"flat"}
            uppercase={true}
            dark={true}
            loading={this.state.progressView}
            style={[styles.loginButtonStyle,{bottom: 0,}]}
            onPress={() => this.addExtra()}
          >
            <Subtitle
              style={{ color: "white" }}>{this.state.extraMode === false ? "Add Extra" : "Edit Extra"}</Subtitle>
          </Button> */}
        </Screen>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  inputStyle: {
    borderRadius: 2,
    borderColor: '#dedede',
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: '#ffffff',
    color: '#292929',
    fontFamily: 'Rubik',
    fontSize: 24,
    fontWeight: '700',
  },
  buttonStyle: {
    flexGrow: 1,
    marginTop: 8,
    padding: 6,
    backgroundColor: Colors.red500,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    marginBottom: 6,
    backgroundColor: Colors.red500,
  },
  loginButtonStyle: {
    color: 'white',
    bottom: 0,
    paddingVertical: 6,
    width: '100%',
    backgroundColor: '#3daccf',
    textAlign: 'center',
    margin: 0,
  },
});
