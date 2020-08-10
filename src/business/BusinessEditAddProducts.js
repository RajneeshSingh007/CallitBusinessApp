import React from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  BackHandler,
  FlatList,
  Alert,
  TouchableHighlight,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Heading,
  Image,
  NavigationBar,
  Screen,
  Subtitle,
  TouchableOpacity,
  View,
  Title,
} from '@shoutem/ui';
import {
  Colors,
  Snackbar,
  TextInput,
  Button,
  Card,
  List,
  Modal,
  Portal,
} from 'react-native-paper';
import * as Helper from './../util/Helper';
import * as Pref from './../util/Pref';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Moment from 'moment';
import ImagePicker from 'react-native-image-crop-picker';
import {Loader} from './../customer/Loader';
import NavigationAction from './../util/NavigationActions';
import {sizeHeight, sizeWidth, sizeFont} from './../util/Size';
import BusinessExtraInsideProduct from './../business/BusinessExtraInsideProduct';
import * as Lodash from 'lodash';
import BusinessMenuChoices from './BusinessMenuChoices';
import {AlertDialog} from './../util/AlertDialog';
import {SafeAreaView} from 'react-navigation';

//added
// import ModalCategoryEdit from './../components/modalCategoryEdit';

const serviceTypes = ['מוצר רגיל', 'פיצה'];

export default class BusinessEditAddProducts extends React.Component {
  constructor(props) {
    super(props);
    this._keyboardDidShow = this._keyboardDidShow.bind(this);
    this._keyboardDidHide = this._keyboardDidHide.bind(this);
    this.backClick = this.backClick.bind(this);
    this.extraRef = null;
    this.state = {
      // bid:null,
      progressView: false,
      searchVisibility: false,
      checkDiscount: false,
      checkMulti: false,
      checkAvail: false,
      datePicker: false,
      datePicker1: false,
      inputName: '',
      inputDesc: '',
      inputPrice: '',
      inputCategory: 'בחר קטגוריה',
      inputDPrice: '',
      inputDStartDateTime: '',
      inputDEndDateTime: '',
      imagePath: '',
      imageBase64: '',
      imageName: '',
      passStartDate: '',
      inputStock: '',
      passEndDate: '',
      message: '',
      buttonhide: false,
      mode: false,
      idservice: 0,
      visibility: true,
      fkBranch: 0,
      pressedd: '#3daccf',
      presseddd: 'white',
      presseddemo: '',
      showExtraList: false,
      selectedCategoryItems: [],
      showAlert: false,
      alertContent: '',
      //service mode below
      serviceType: 'מוצר רגיל',
      showServiceTypeList: false,
      //catgories
      expandedCat: false,
      serviceCategoryid: -1,
      serviceCategories: [],
      ///
      // category:{name:"", categoryid:"",description:"",businessfkSc:""},
      modalCatName: '',
      modalCatId: -1,
      modalCatDes: '',
      editCategory: false,
      //cashservicetype
      servicecatfk: 0,
      //modal category edit
      modalVisible: false,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backClick);
    Pref.getVal(Pref.branchId, value => {
      this.setState({fkBranch: value});
    });
    this.fetchService();
    this.fetchAllCategories();
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide,
    );
  }

  backClick() {
    NavigationAction.goBack();
    return true;
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backClick);
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow() {
    this.setState({visibility: false});
  }

  _keyboardDidHide() {
    this.setState({visibility: true});
  }

  getservicetype(index) {
    if (this.state.serviceType.length < index || index < 0) return 'מוצר רגיל';
    else return serviceTypes[index];
  }

  handleExpandedCat = () => {
    this.setState({expandedCat: !this.state.expandedCat});
  };

  fetchAllCategories() {
    Pref.getVal(Pref.bBearerToken, value => {
      const removeQuotes = Helper.removeQuotes(value);
      Pref.getVal(Pref.branchId, value => {
        Helper.networkHelperToken(
          Pref.GetServiceCategories + value,
          Pref.methodGet,
          removeQuotes,
          result => {
            //console.log("result",result);
            this.setState({serviceCategories: result});
            //console.log('Service Cats', this.state.serviceCategories);
          },
          error => {
            //console.log(error);
          },
        );
      });
    });
  }

  /**
   *
   */
  fetchService() {
    const {state} = this.props.navigation;
    const itemData = state.params.itemedit;
    this.setState({mode: itemData});
    //console.log("mode",this.state.mode);
    if (itemData === true) {
      const datas = JSON.parse(JSON.stringify(state.params.data));
      const check =
        datas.discountPrice === null ? '' : datas.discountPrice.toString();
      //console.log(datas);
      this.setState({
        idservice: datas.idservice,
        inputDPrice: check,
        inputCategory: datas.category,
        inputName: datas.name,
        inputPrice: datas.price.toString(),
        inputDesc: datas.description,
        inputDEndDateTime: Moment(datas.discountEnd).format('DD-MM-YYYY hh:mm'),
        inputDStartDateTime: Moment(datas.discountStart).format(
          'DD-MM-YYYY hh:mm',
        ),
        checkAvail: datas.available === 1 ? true : false,
        checkMulti: datas.multipliable === 1 ? true : false,
        imagePath: Pref.BASEURL + datas.imageUrl,
        serviceType: this.getservicetype(datas.serviceMode),
        serviceCategoryid: datas.servicecategoryfk,
        servicecatfk: datas.servicecatfk,
      });
      //console.log("get service type", this.state.serviceType);
    }
  }

  /**
   * ImageChooser
   */
  onImageClick() {
    ImagePicker.openPicker({
      width: 400,
      height: 400,
      cropping: false,
      multiple: false,
      includeBase64: true,
    }).then(image => {
      const split = image.path.split('/');
      const lastNumber = split.length;
      let iosFileName = '';
      if (Platform.OS === 'android') {
        iosFileName = split[lastNumber - 1];
      } else {
        iosFileName = image.filename;
      }
      this.setState({
        imagePath: image.path,
        imageBase64: image.data,
        imageName: iosFileName,
      });
    });
  }

  _handleSDatePicked = date => {
    this.setState({
      inputDStartDateTime: Moment(date).format('DD-MM-YYYY hh:mm'),
      passStartDate: Moment(date).format(),
      datePicker: false,
    });
  };

  _handleEDatePicked = date => {
    this.setState({
      inputDEndDateTime: Moment(date).format('DD-MM-YYYY hh:mm'),
      passEndDate: Moment(date).format(),
      datePicker1: false,
    });
  };

  buttonPressed() {
    if (this.state.pressedd == 'white') {
      this.setState({
        pressedd: '#3daccf',
        presseddd: 'white',
      });
    } else {
      this.setState({
        pressedd: 'white',
        presseddd: '#3daccf',
      });
    }
  }

  date1() {
    this.setState({
      datePicker: !this.state.datePicker,
    });
  }
  date2() {
    this.setState({
      datePicker1: !this.state.datePicker1,
    });
  }

  showAlertCategory() {
    Alert.alert(
      'אופס...',
      'נא לבחור את סוג הקטגוריה למוצר',
      [{text: 'אישור', onPress: () => console.log('OK Pressed')}],
      {cancelable: true},
    );
  }

  /**
   * Add product
   */
  addProduct() {
    //if servicecatfk === -1 show alert dialog that category must be selected
    if (this.state.serviceCategoryid === -1) {
      this.showAlertCategory();
      return;
    }
    this.setState({progressView: true});
    // alert(this.state.imageBase64);
    const isid = this.state.mode === true ? this.state.idservice : '';
    const sendJsonData =
      this.state.mode === true
        ? JSON.stringify({
            // edit product
            service: {
              idservice: isid,
              name: this.state.inputName,
              description: this.state.inputDesc,
              price: this.state.inputPrice,
              multipliable: this.state.checkMulti === true ? 1 : 0,
              imageUrl: '',
              category: this.state.inputCategory,
              discountPrice:
                this.state.inputDPrice === '' ? null : this.state.inputDPrice,
              discountStart:
                this.state.passStartDate == ''
                  ? '2018-07-16T00:00:00'
                  : this.state.passStartDate,
              available: this.state.checkAvail === true ? 1 : 0,
              fkbranchS: this.state.fkBranch, // to do
              discountEnd:
                this.state.passEndDate == ''
                  ? '2018-07-16T00:00:00'
                  : this.state.passEndDate,
              fkbranchSNavigation: null,
              serviceExtra: [],
              servicecatfk: this.state.servicecatfk,
              servicecategoryfk: this.state.serviceCategoryid,
              Servicemode: serviceTypes.findIndex(element => {
                return this.state.serviceType == element;
              }), // line 281
              // serviceExtra: [],
              // servicecatfk: this.state.servicecatfk,
              // servicecategoryfk: this.state.serviceCategoryid,
            },
            Image: {
              filename: this.state.imageName === '' ? '' : this.state.imageName,
              content:
                this.state.imageBase64 === '' ? '' : this.state.imageBase64,
            },
          })
        : JSON.stringify({
            // add product
            service: {
              id: isid,
              name: this.state.inputName,
              description: this.state.inputDesc,
              price: this.state.inputPrice,
              multipliable: this.state.checkMulti === true ? 1 : 0,
              imageUrl: '',
              category: this.state.inputCategory,
              discountPrice:
                this.state.inputDPrice === '' ? null : this.state.inputDPrice,
              discountStart:
                this.state.passStartDate == ''
                  ? '2018-07-16T00:00:00'
                  : this.state.passStartDate,
              available: this.state.checkAvail === true ? 1 : 0,
              fkbranchS: this.state.fkBranch, // to do
              discountEnd:
                this.state.passEndDate == ''
                  ? '2018-07-16T00:00:00'
                  : this.state.passEndDate,
              fkbranchSNavigation: null,
              serviceExtra: [],
              servicecatfk: 0,
              servicecategoryfk: this.state.serviceCategoryid,
              Servicemode: serviceTypes.findIndex(element => {
                this.state.serviceType == element;
              }), //line 306
            },
            Image: {
              filename: this.state.imageName === '' ? '' : this.state.imageName,
              content:
                this.state.imageBase64 === '' ? '' : this.state.imageBase64,
            },
          });
    //alert(JSON.stringify(sendJsonData));
    //////console.log(sendJsonData);
    // this.extraRef.addExtra();
    Pref.getVal(Pref.bBearerToken, value => {
      const tt = Helper.removeQuotes(value);
      const url =
        this.state.mode === true
          ? Pref.UpdateServiceUrl + isid
          : Pref.AddServiceUrl;
      //////console.log(url);
      Helper.networkHelperTokenPost(
        url,
        sendJsonData,
        this.state.mode === true ? Pref.methodPut : Pref.methodPost,
        tt,
        result => {
          // alert(JSON.stringify(result));
          //////console.log(result);
          this.setState({
            progressView: false,
          });
          if (this.state.selectedCategoryItems.length > 0) {
            let fool = [];
            let deleteExtrass = [];
            const yy = this.state.selectedCategoryItems;
            const tyyy = Lodash.map(yy, ele => {
              const iid = ele.idextra;
              if (ele.selected === true) {
                fool.push({
                  fkservice: !this.state.mode ? result.idservice : isid,
                  fkextra: iid,
                });
              }
              if (this.state.mode) {
                if (ele.selected == false) {
                  deleteExtrass.push({
                    first_int: iid,
                    second_int: isid,
                  });
                }
              }
            });
            //////console.log('addExtrass', fool);
            //////console.log('deleteExtrass', deleteExtrass);
            Pref.getVal(Pref.branchId, v => {
              Helper.networkHelperTokenPost(
                Pref.AddServiceExtraUrl + v,
                JSON.stringify(fool),
                Pref.methodPost,
                tt,
                result => {
                  //////console.log("connected", result);
                },
                error => {},
              );
              if (this.state.mode) {
                Helper.networkHelperTokenPost(
                  Pref.DeleteServiceExtraUrl + v,
                  JSON.stringify(deleteExtrass),
                  Pref.methodPost,
                  tt,
                  result => {
                    //////console.log("deleted", result);
                  },
                  error => {},
                );
              }
            });
          }
          this.setState({
            selectedCategoryItems: [],
            showAlert: true,
            alertContent:
              this.state.mode === false
                ? 'המוצר התווסף בהצלחה'
                : 'המוצר עודכן בהצלחה',
          });
          //////console.log('addService', result);
        },
        error => {
          this.setState({progressView: false});
        },
      );
    });
  }

  handleServiceTypeOnClick = () => {
    const displayList = this.state.showServiceTypeList;
    this.setState({showServiceTypeList: !displayList});
  };
  renderServiceTypes(rowData, index) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignContent: 'flex-start',
          alignSelf: 'flex-start',
          justifyContent: 'flex-start',
          marginVertical: sizeHeight(1),
          marginHorizontal: sizeWidth(3),
          width: '100%',
        }}>
        <TouchableWithoutFeedback
          style={{
            backgroundColor: 'transparent',
          }}
          onPress={() => {
            this.setState({
              serviceType: rowData,
              showServiceTypeList: false,
            });
          }}>
          <Title
            styleName="v-start h-start "
            style={{
              color: '#292929',
              fontFamily: 'Rubik',
              fontSize: 15,
              fontWeight: 'bold',
            }}>{`${rowData}`}</Title>
        </TouchableWithoutFeedback>
      </View>
    );
  }
  renderServiceTypeList() {
    return (
      <View
        style={{
          flexGrow: 1,
          marginVertical: sizeHeight(2),
        }}>
        <FlatList
          showsVerticalScrollIndicator={true}
          showsHorizontalScrollIndicator={false}
          data={serviceTypes}
          nestedScrollEnabled={true}
          ItemSeparatorComponent={() => {
            return <View style={styles.renderRowFlatListView} />;
          }}
          keyExtractor={index => index.toString()}
          renderItem={({item, index}) => this.renderServiceTypes(item, index)}
        />
      </View>
    );
  }

  //Category

  handleCategoryPick(name, id) {
    if (id === this.state.serviceCategoryid) return;
    this.setState({inputCategory: name, serviceCategoryid: id});
  }

  apiDeleteCategoryCall(id) {
    Pref.getVal(Pref.bBearerToken, value => {
      const removeQuotes = Helper.removeQuotes(value);
      Helper.networkHelperTokenPost(
        Pref.DeleteServiceCategory + id,
        JSON.stringify({}),
        Pref.methodPost,
        removeQuotes,
        result => {
          this.setState({message: result});
          this.fetchAllCategories();
        },
        error => {
          //this.setState({ showp: false });
        },
      );
    });
  }

  deleteCategory(name, id) {
    Alert.alert(
      `האם אתה בטוח למחוק את ${name}`,
      `לא ניתן למחוק קטגורייה אם יש לה מוצרים`,
      [
        {
          text: 'לא',
          onPress: () => {
            // this.setState({ selectedItem: [], selectedCounter: 0, longPress: false });
          },
        },
        {
          text: 'כן',
          onPress: () => {
            this.apiDeleteCategoryCall(id);
          },
        },
      ],
    );
  }

  handleBtneditCategory(category) {
    this.setState({modalCatName: category.name});
    this.setState({modalCatId: category.categoryid});
    this.setState({modalCatDes: category.description});
    this.setState({editCategory: true});
    this.setModalVisible(true);
  }
  setModalVisible = visible => {
    this.setState({modalVisible: visible});
  };
  updateCategory() {
    // call api to update category
    Pref.getVal(Pref.bId, value => {
      const sendJsonData = JSON.stringify({
        // edit product
        CategoryId: this.state.modalCatId,
        name: this.state.modalCatName,
        description: this.state.modalCatDes,
        businessfksc: value,
      });
      Pref.getVal(Pref.bBearerToken, token => {
        //  console.log("category to send when adding new item" ,sendJsonData);
        //  console.log("token: ",token);
        //  console.log("ID of category to be changed", this.state.modalCatId);
        //  console.log("LINK",  Pref.UpdateServiceCategory + this.state.modalCatId);
        const removeQuotes = Helper.removeQuotes(token);
        Helper.networkHelperTokenPost(
          Pref.UpdateServiceCategory + this.state.modalCatId,
          sendJsonData,
          Pref.methodPost,
          removeQuotes,
          result => {
            //this.setState({ message: result });
            this.fetchAllCategories();
          },
          error => {
            //this.setState({ showp: false });
          },
        );
      });
    });
    //console.log("update category");
    this.setModalVisible(false);
  }

  addNewCategory() {
    //call api to send category
    //console.log("add new category");

    Pref.getVal(Pref.bId, value => {
      const sendJsonData = JSON.stringify({
        // edit product
        name: this.state.modalCatName,
        description: this.state.modalCatDes,
        businessfksc: value,
      });
      Pref.getVal(Pref.bBearerToken, token => {
        // console.log("category to send when adding new item" ,sendJsonData);
        // console.log("token: ",token);
        const removeQuotes = Helper.removeQuotes(token);
        Helper.networkHelperTokenPost(
          Pref.AddServiceCategory,
          sendJsonData,
          Pref.methodPost,
          removeQuotes,
          result => {
            this.setState({message: result});
            this.fetchAllCategories();
          },
          error => {
            //this.setState({ showp: false });
          },
        );
      });
    });
    this.setModalVisible(false);
  }

  handleBtnAddNewCategory() {
    this.setState({editCategory: false});
    this.setState({modalCatDes: ''});
    this.setState({modalCatName: ''});
    this.setModalVisible(true);
  }

  modalCategoryEdit() {
    return (
      <Portal>
        <Modal
          dismissable
          visible={this.state.modalVisible}
          onDismiss={() => this.setState({modalVisible: false})}>
          <ScrollView keyboardShouldPersistTaps={'handled'}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <TouchableOpacity
                  onPress={() =>
                    this.setModalVisible(!this.state.modalVisible)
                  }>
                  <Icon
                    name="arrow-forward"
                    size={28}
                    style={{
                      marginTop: sizeHeight(1),
                      marginHorizontal: sizeWidth(3),
                      alignSelf: 'flex-start',
                    }}
                  />
                </TouchableOpacity>
                <View
                  style={{
                    marginHorizontal: sizeWidth(3),
                    marginBottom: sizeHeight(1),
                  }}>
                  <Subtitle
                    style={{
                      color: '#292929',
                      fontSize: 16,
                      marginTop: sizeHeight(2),
                      marginHorizontal: sizeWidth(2),
                    }}>
                    שם קטגוריה
                  </Subtitle>
                  <TextInput
                    style={styles.inputStyle}
                    mode={'flat'}
                    //label={"Name"}
                    password={false}
                    returnKeyType="next"
                    numberOfLines={1}
                    value={this.state.modalCatName}
                    onChangeText={text => this.setState({modalCatName: text})}
                    underlineColor={'transparent'}
                    underlineColorAndroid={'transparent'}
                  />
                </View>
                <View
                  style={{
                    marginHorizontal: sizeWidth(3),
                    marginBottom: sizeHeight(2),
                  }}>
                  <Subtitle
                    style={{
                      color: '#292929',
                      fontSize: 16,
                      marginTop: sizeHeight(1),
                      marginHorizontal: sizeWidth(2),
                    }}>
                    תיאור קטגוריה
                  </Subtitle>
                  <TextInput
                    style={styles.inputStyle}
                    mode={'flat'}
                    //label={"Name"}
                    placeholder={'אופציונלי'}
                    password={false}
                    returnKeyType="next"
                    numberOfLines={1}
                    value={this.state.modalCatDes}
                    onChangeText={text => this.setState({modalCatDes: text})}
                    underlineColor={'transparent'}
                    underlineColorAndroid={'transparent'}
                  />
                </View>
                <TouchableWithoutFeedback
                  onPress={() =>
                    this.state.editCategory === true
                      ? this.updateCategory()
                      : this.addNewCategory()
                  }>
                  <View style={styles.btnModalInside}>
                    <Title
                      styleName="bold"
                      style={{
                        color: 'white',
                        fontFamily: 'Rubik',
                        fontSize: 20,
                        marginHorizontal: 10,
                        fontWeight: 'bold',
                      }}>
                      {this.state.editCategory === true
                        ? 'עדכן קטגורייה'
                        : 'אישור'}
                    </Title>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    );
  }

  renderCataRow(category, index) {
    //console.log(category);
    return (
      <View>
        {index === 0 ? <View style={styles.renderRowFlatListView} /> : null}
        <TouchableOpacity
          onPress={() => {
            this.handleCategoryPick(category.name, category.categoryid);
            this.handleExpandedCat();
          }}
          // onPress={() =>
          //   this.handleCategoryPick(category.name, category.categoryid)
          // }
        >
          <View
            style={{
              justifyContent: 'space-between',
              marginVertical: sizeHeight(1),
              marginHorizontal: 16,
              paddingVertical: 8,
              flexDirection: 'row',
              flex: 1,
            }}>
            <Subtitle
              style={{
                color: '#292929',
                fontFamily: 'Rubik',
                fontSize: 15,
                fontWeight: '400',
                alignContent: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                marginHorizontal: sizeWidth(1),
              }}>
              {category.name}
            </Subtitle>
            <View styleName="horizontal">
              <TouchableOpacity
                onPress={() => this.handleBtneditCategory(category)}>
                <Image
                  source={require('../res/images/edit.png')}
                  style={styles.editimageCategory}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  this.deleteCategory(category.name, category.categoryid)
                }>
                <Image
                  source={require('../res/images/delete.png')}
                  style={styles.imageCategory}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    //console.log(this.state.mode);
    return (
      <SafeAreaView style={styles.maincontainer} forceInset={{top: 'never'}}>
        <Screen style={styles.maincontainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <NavigationBar
            styleName="inline no-border"
            rightComponent={
              <View style={{flexDirection: 'row', marginEnd: sizeWidth(5)}}>
                <BusinessMenuChoices />
              </View>
            }
            leftComponent={
              <View style={{marginStart: 12}}>
                <Heading
                  style={{
                    fontSize: 21,
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontWeight: '700',
                  }}>
                  {this.state.mode === true ? 'עריכת מוצר' : 'מוצר חדש'}
                </Heading>
              </View>
            }
          />
          <View styleName="vertical" style={{flex: 1, flexDirection: 'column'}}>
            {/** ADDED MODAL TO SHOW */}
            {this.modalCategoryEdit()}
            <ScrollView style={{flex: 1}}>
              <View styleName="vertical sm-gutter">
                <View
                  style={{
                    flexDirection: 'row',
                    borderRadius: 1,
                    borderColor: '#dedede',
                    borderStyle: 'solid',
                    borderWidth: 1,
                    marginTop: sizeHeight(1.5),
                    marginHorizontal: sizeWidth(5),
                    height: sizeHeight(9),
                  }}>
                  <TouchableWithoutFeedback
                    onPress={() =>
                      this.setState({selectedMode: true, checkMulti: false})
                    }>
                    <View
                      style={{
                        flex: 0.5,
                        backgroundColor: this.state.selectedMode
                          ? '#5EBBD7'
                          : 'white',
                        alignContent: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Title
                        styleName="bold"
                        style={{
                          color: this.state.selectedMode ? 'white' : '#777777',
                          fontFamily: 'Rubik',
                          fontSize: 16,
                          fontWeight: '700',
                          alignContent: 'center',
                          justifyContent: 'center',
                          alignSelf: 'center',
                        }}>{` מוצר יחיד`}</Title>
                    </View>
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback
                    onPress={() =>
                      this.setState({selectedMode: false, checkMulti: true})
                    }>
                    <View
                      style={{
                        flex: 0.5,
                        backgroundColor: !this.state.selectedMode
                          ? '#5EBBD7'
                          : 'white',
                        alignContent: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Title
                        styleName="bold"
                        style={{
                          color: !this.state.selectedMode ? 'white' : '#777777',
                          fontFamily: 'Rubik',
                          fontSize: 16,
                          fontWeight: '700',
                        }}>{` מוצר מרובה`}</Title>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
                <Subtitle
                  style={{
                    color: '#292929',
                    fontSize: 16,
                    marginHorizontal: sizeWidth(2),
                    marginTop: sizeHeight(1),
                  }}>
                  קטגוריה
                </Subtitle>
                {/** category products */}
                <View style={styles.inputStyle}>
                  <List.Accordion
                    title={this.state.inputCategory}
                    titleStyle={{
                      fontFamily: 'Rubik',
                      fontSize: 16,
                      fontWeight: '400',
                    }}
                    expanded={this.state.expandedCat}
                    onPress={this.handleExpandedCat}>
                    <FlatList
                      showsHorizontalScrollIndicator={false}
                      showsVerticalScrollIndicator={true}
                      initialNumToRender={20}
                      data={this.state.serviceCategories}
                      nestedScrollEnabled={true}
                      ItemSeparatorComponent={() => {
                        return <View style={styles.renderRowFlatListView} />;
                      }}
                      keyExtractor={item => item.categoryid.toString()}
                      renderItem={({item, index}) =>
                        this.renderCataRow(item, index)
                      }
                    />
                  </List.Accordion>
                </View>
                {/**      ADD CATEGORY */}
                <TouchableWithoutFeedback
                  onPress={() => this.handleBtnAddNewCategory()}>
                  <View
                    style={{
                      flex: 0.1,
                      backgroundColor: '#5EBBD7',
                      alignSelf: 'baseline',
                      marginTop: sizeHeight(1.2),
                      marginHorizontal: sizeWidth(2),
                      borderRadius: 5,
                    }}>
                    <Title
                      styleName="bold"
                      style={{
                        color: 'white',
                        fontFamily: 'Rubik',
                        fontSize: 16,
                        marginHorizontal: 10,
                        fontWeight: 'bold',
                      }}>{`הוסף קטגוריה`}</Title>
                  </View>
                </TouchableWithoutFeedback>
                <Subtitle
                  style={{
                    color: '#292929',
                    fontSize: 16,
                    marginTop: sizeHeight(1),
                    marginHorizontal: sizeWidth(2),
                  }}>
                  שם המוצר
                </Subtitle>
                <TextInput
                  style={styles.inputStyle}
                  mode={'flat'}
                  //label={"Name"}
                  password={false}
                  returnKeyType="next"
                  numberOfLines={1}
                  value={this.state.inputName}
                  onChangeText={text => this.setState({inputName: text})}
                  underlineColor={'transparent'}
                  underlineColorAndroid={'transparent'}
                />

                <Subtitle
                  style={{
                    color: '#292929',
                    fontSize: 16,
                    marginTop: sizeHeight(1),
                    marginHorizontal: sizeWidth(2),
                  }}>
                  מחיר
                </Subtitle>

                <TextInput
                  style={styles.inputStyle}
                  mode={'flat'}
                  //label={"price"}
                  password={false}
                  returnKeyType="next"
                  numberOfLines={1}
                  keyboardType={'number-pad'}
                  value={this.state.inputPrice}
                  onChangeText={text => this.setState({inputPrice: text})}
                  underlineColor={'transparent'}
                  underlineColorAndroid={'transparent'}
                />

                <Subtitle
                  style={{
                    color: '#292929',
                    fontSize: 16,
                    marginTop: sizeHeight(1),
                    marginHorizontal: sizeWidth(2),
                  }}>
                  מלאי
                </Subtitle>
                <View
                  styleName="horizontal"
                  style={{
                    flexDirection: 'row-reverse',
                    marginVertical: sizeHeight(1),
                    marginHorizontal: sizeWidth(2),
                    borderColor: '#dedede',
                    borderStyle: 'solid',
                    borderWidth: 1,
                    color: '#000000',
                    flex: 8,
                  }}>
                  <TouchableWithoutFeedback
                    onPress={() => {
                      this.setState({checkAvail: false});
                    }}>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        height: sizeHeight(6.5),
                        width: sizeWidth(10),
                        backgroundColor: !this.state.checkAvail
                          ? '#3daccf'
                          : 'white',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <View
                        style={{
                          width: 1,
                          backgroundColor: '#dedede',
                        }}
                      />
                      <Subtitle
                        style={{
                          color: !this.state.checkAvail ? 'white' : '#292929',
                          fontSize: 16,
                          alignSelf: 'center',
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignContent: 'center',
                        }}>{`לא`}</Subtitle>
                    </View>
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback
                    onPress={() => {
                      this.setState({checkAvail: true});
                    }}>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        height: sizeHeight(6.5),
                        width: sizeWidth(10),
                        backgroundColor: this.state.checkAvail
                          ? '#3daccf'
                          : 'white',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Subtitle
                        style={{
                          color: this.state.checkAvail ? 'white' : '#292929',
                          fontSize: 16,
                          alignSelf: 'center',
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignContent: 'center',
                        }}>{`כן`}</Subtitle>
                    </View>
                  </TouchableWithoutFeedback>
                </View>

                <Subtitle
                  style={{
                    color: '#292929',
                    fontSize: 16,
                    marginTop: sizeHeight(1),
                    marginHorizontal: sizeWidth(2),
                  }}>
                  תוספות לבחירה
                </Subtitle>
                <TouchableWithoutFeedback
                  onPress={() =>
                    this.setState({showExtraList: !this.state.showExtraList})
                  }>
                  <View
                    style={{
                      borderColor: '#dedede',
                      borderStyle: 'solid',
                      borderWidth: 1,
                      color: '#000000',
                      height: 60,
                      marginHorizontal: sizeWidth(2),
                      marginTop: sizeHeight(0.5),
                      justifyContent: 'space-between',
                      flexDirection: 'row-reverse',
                    }}>
                    <Icon
                      name={'keyboard-arrow-down'}
                      size={24}
                      style={{
                        color: '#292929',
                        alignSelf: 'center',
                        marginHorizontal: sizeWidth(2),
                      }}
                    />
                    <Subtitle
                      style={{
                        color: '#292929',
                        fontSize: 16,
                        alignSelf: 'center',
                        marginHorizontal: sizeWidth(2),
                      }}
                    />
                  </View>
                </TouchableWithoutFeedback>
                {this.state.showExtraList ? (
                  <View style={{marginTop: sizeHeight(1)}}>
                    <BusinessExtraInsideProduct
                      idservice={
                        this.state.mode ? this.state.idservice : undefined
                      }
                      onSubmitCallback={listItemSelect => {
                        Lodash.map(listItemSelect, ele => {
                          this.state.selectedCategoryItems.push(ele.extra);
                        });
                      }}
                    />
                  </View>
                ) : null}
                <Subtitle
                  style={{
                    color: '#292929',
                    fontSize: 16,
                    marginTop: sizeHeight(1),
                    marginHorizontal: sizeWidth(2.5),
                  }}>
                  פירוט
                </Subtitle>
                <TextInput
                  style={[styles.inputStyle, {height: 100}]}
                  mode={'flat'}
                  //label={"Descripton"}
                  password={false}
                  returnKeyType="next"
                  multiline={true}
                  value={this.state.inputDesc}
                  onChangeText={text => this.setState({inputDesc: text})}
                  underlineColor={'transparent'}
                  underlineColorAndroid={'transparent'}
                />
                {/** start service mode */}

                <Subtitle
                  style={{
                    color: '#292929',
                    fontSize: 16,
                    marginTop: sizeHeight(1),
                    marginHorizontal: sizeWidth(2.5),
                  }}>
                  סוג מוצר
                </Subtitle>
                <View
                  style={{
                    borderRadius: 1,
                    borderColor: '#dedede',
                    borderStyle: 'solid',
                    borderWidth: 1,
                    marginHorizontal: sizeWidth(2.5),
                  }}>
                  <List.Accordion
                    title={this.state.serviceType}
                    titleStyle={{
                      fontFamily: 'Rubik',
                      fontSize: 16,
                      fontWeight: '400',
                    }}
                    expanded={this.state.showServiceTypeList}
                    onPress={this.handleServiceTypeOnClick}>
                    {this.renderServiceTypeList()}
                  </List.Accordion>
                </View>
                {/* <TouchableWithoutFeedback
                onPress={() => this.handleServiceTypeOnClick()}>
                <View
                  style={[
                    styles.serviceModeBtn,
                    {
                      justifyContent: 'space-between',
                      flexDirection: 'row-reverse',
                      marginHorizontal: sizeWidth(2),
                    },
                  ]}>
                  <View
                    style={{
                      flex: 0.2,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Icon
                      name={'keyboard-arrow-down'}
                      size={24}
                      color={'#777777'}
                      style={{
                        width: 24,
                        height: 24,
                        alignSelf: 'center',
                        marginHorizontal: sizeWidth(2),
                      }}
                    />
                  </View>
                  <Subtitle
                    style={{
                      color: '#292929',
                      fontSize: 16,
                      alignSelf: 'center',
                      marginHorizontal: sizeWidth(2),
                    }}>
                    {this.state.serviceType}
                  </Subtitle>
                </View>
              </TouchableWithoutFeedback> */}
                <View
                  style={{
                    height: 1,
                    backgroundColor: '#dedede',
                    marginTop: sizeHeight(2),
                  }}
                />

                <Subtitle
                  style={{
                    color: '#292929',
                    fontSize: 16,
                    marginTop: sizeHeight(1),
                    marginHorizontal: sizeWidth(2),
                  }}>
                  הוספת הנחה
                </Subtitle>

                <TextInput
                  style={styles.inputStyle}
                  mode={'flat'}
                  password={false}
                  returnKeyType="next"
                  multiline={true}
                  value={this.state.inputDPrice}
                  onChangeText={text => this.setState({inputDPrice: text})}
                  underlineColor={'transparent'}
                  underlineColorAndroid={'transparent'}
                />

                <Subtitle
                  style={{
                    color: '#292929',
                    fontSize: 16,
                    marginTop: sizeHeight(1),
                    marginHorizontal: sizeWidth(2),
                  }}>
                  תאריכים
                </Subtitle>

                <View style={{flexDirection: 'row'}}>
                  <TextInput
                    style={[styles.inputStyle, {flex: 0.5}]}
                    mode={'flat'}
                    password={false}
                    returnKeyType="next"
                    multiline={true}
                    label={'סוף המבצע'}
                    value={this.state.inputDStartDateTime}
                    onFocus={() => this.date1()}
                    underlineColor={'transparent'}
                    underlineColorAndroid={'transparent'}
                  />
                  <TextInput
                    style={[styles.inputStyle, {flex: 0.5}]}
                    mode={'flat'}
                    label={'תחילת המבצע'}
                    password={false}
                    returnKeyType="next"
                    multiline={true}
                    value={this.state.inputDEndDateTime}
                    onFocus={() => this.date2()}
                    underlineColor={'transparent'}
                    underlineColorAndroid={'transparent'}
                  />
                </View>

                <Subtitle
                  style={{
                    color: '#292929',
                    alignSelf: 'flex-start',
                    fontSize: 16,
                    marginTop: sizeHeight(1),
                    marginHorizontal: sizeWidth(2),
                  }}>
                  תמונת מוצר
                </Subtitle>

                <TouchableWithoutFeedback onPress={() => this.onImageClick()}>
                  <Card
                    style={{
                      width: 142,
                      height: 96,
                      alignSelf: 'center',
                      borderColor: '#dedede',
                      ...Platform.select({
                        android: {
                          elevation: 2,
                        },
                        default: {
                          shadowColor: 'rgba(0,0,0, .2)',
                          shadowOffset: {height: 0, width: 0},
                          shadowOpacity: 1,
                          shadowRadius: 1,
                        },
                      }),
                      marginVertical: 8,
                    }}>
                    <Image
                      styleName="medium"
                      source={
                        this.state.imagePath === ''
                          ? require('./../res/images/placed.png')
                          : {uri: `${this.state.imagePath}`}
                      }
                      style={{
                        width: 142,
                        height: 96,
                        alignSelf: 'center',
                        borderTopEndRadius: 8,
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        borderTopStartRadius: 8,
                        borderBottomRightRadius: 8,
                        borderBottomStartRadius: 8,
                        borderBottomEndRadius: 8,
                        borderBottomLeftRadius: 8,
                      }}
                    />
                  </Card>
                </TouchableWithoutFeedback>

                <DateTimePicker
                  isVisible={this.state.datePicker}
                  onConfirm={this._handleSDatePicked}
                  mode={'datetime'}
                  datePickerModeAndroid={'default'}
                  onCancel={() => {
                    this.setState({datePicker: false});
                  }}
                />

                <DateTimePicker
                  isVisible={this.state.datePicker1}
                  onConfirm={this._handleEDatePicked}
                  mode={'datetime'}
                  datePickerModeAndroid={'default'}
                  onCancel={() => {
                    this.setState({datePicker1: false});
                  }}
                />
              </View>
            </ScrollView>
          </View>

          {this.state.visibility === false ? null : (
            <Button
              styleName=" muted border"
              mode={'contained'}
              uppercase={true}
              dark={true}
              style={styles.loginButtonStyle}
              onPress={() => this.addProduct()}>
              <Subtitle style={{color: 'white'}}>
                {this.state.mode === true ? 'עדכן מוצר' : 'סיום'}
              </Subtitle>
            </Button>
          )}
          <Loader isShow={this.state.progressView} />
          {this.state.showAlert ? (
            <AlertDialog
              isShow={true}
              title={'הודעה'}
              content={this.state.alertContent}
              callbacks={() => this.setState({showAlert: false})}
            />
          ) : null}

          <Snackbar
            visible={this.state.message === '' ? false : true}
            duration={1000}
            onDismiss={() =>
              this.setState({
                message: '',
              })
            }>
            {this.state.message}
          </Snackbar>
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
    marginHorizontal: sizeWidth(2),
    fontWeight: '700',
  },
  buttonStyle: {
    color: 'white',
    bottom: 0,
    paddingVertical: 6,
    width: '100%',
    backgroundColor: '#3daccf',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    marginBottom: 8,
    backgroundColor: Colors.red500,
  },
  loginButtonStyle: {
    color: 'white',
    bottom: 0,
    paddingVertical: sizeHeight(1),
    width: '100%',
    marginTop: sizeHeight(4),
    backgroundColor: '#3daccf',
    textAlign: 'center',
    margin: 0,
  },
  serviceModeBtn: {
    height: sizeHeight(8),
    borderRadius: 2,
    borderColor: '#dedede',
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: sizeWidth(6),
  },
  renderRowFlatListView: {
    backgroundColor: '#d9d9d9',
    height: 1,
    width: '100%',
  },
  editimageCategory: {
    width: 24,
    height: 24,
    alignSelf: 'center',
    marginEnd: 16,
    alignContent: 'center',
    justifyContent: 'center',
  },
  imageCategory: {
    width: 20,
    height: 24,
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  simplerBorder: {
    borderWidth: 2,
    borderColor: 'black',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom:sizeHeight(7)
  },
  modalView: {
    // marginHorizontal:sizeWidth(),
    backgroundColor: 'white',
    //borderRadius: 20,
    // padding: 30,
    // alignItems: "center",
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    height: sizeHeight(48),
    width: sizeWidth(90),
  },

  modalText: {
    marginBottom: 15,
    // textAlign: "center"
  },
  inputStyleModal: {
    borderRadius: 2,
    borderColor: '#dedede',
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: '#ffffff',
    color: '#292929',
    fontFamily: 'Rubik',
    fontSize: 24,
    fontWeight: '700',
    height: sizeHeight(6),
  },
  btnModalInside: {
    flex: 0.5,
    backgroundColor: '#5EBBD7',
    alignSelf: 'center',
    marginTop: sizeHeight(2),
    marginHorizontal: sizeWidth(2),
    borderRadius: 5,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    // borderRadius: 2,
    borderColor: '#dedede',
    borderStyle: 'solid',
    borderWidth: 1,
  },
});
