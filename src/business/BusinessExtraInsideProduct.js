import React from "react";
import { FlatList, SafeAreaView, StatusBar, StyleSheet, TouchableWithoutFeedback,Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Button, Checkbox, Chip, Colors, Dialog, Portal, Snackbar,Avatar,Modal,List} from "react-native-paper";
import { Divider,Title, Image, Heading, NavigationBar, Row, Screen, Subtitle, TextInput, TouchableOpacity, View } from "@shoutem/ui";
import { Loader } from "./../customer/Loader";
import * as Helper from "./../util/Helper";
import NavigationAction from "./../util/NavigationActions";
import * as Animatable from "react-native-animatable";
import * as Pref from "./../util/Pref";
import MaterialTabs from "react-native-material-tabs";
import * as Lodash from "lodash";
import DummyLoader from "../util/DummyLoader";
import {sizeHeight, sizeWidth, sizeFont} from './../util/Size';
import { ScrollView } from "react-native-gesture-handler";

export default class BusinessExtraInsideProduct extends React.Component {
  constructor(props) {
    super(props);
    this.renderRow = this.renderRow.bind(this);
    this.renderRowProductCat = this.renderRowProductCat.bind(this);
    this.selectedCatExtraItem = this.selectedCatExtraItem.bind(this);
    this.groupClicked = this.groupClicked.bind(this);
    this.expandlisterner = this.expandlisterner.bind(this);
    this.renderTabDataRow = this.renderTabDataRow.bind(this);
    this.itemclicklisterner = this.itemclicklisterner.bind(this);
    this.state = {
      smp:false,
      progressView: false,
      searchVisibility: false,
      searchCVisibility: false,
      clone: [],
      extrasList: [],
      dialogShow: false,
      connectedGrouping:[],
      extraName: "",
      extraPrice: "",
      extraid: 0,
      fkidcategory: 0,
      fkidbusiness: 0,
      tabNames: ["Category", "Product"],
      selectedTab: 1,
      selectedItem: [],
      allData: [],
      cloneAllData:[],
      onScreen:true,
      connectChoice: false,
      allCloneData: [],
      globalIndex: 0,
      message: "",
      groupChecked:false,
      selectExtracat:false,
      selectedCategoryName:'',
      selectedCategoryItems:[],
      checkAllExtraItems:false,
      selectedExtraItemsOneByOne:[],
    };
  }

  componentDidMount() {
    this.fetchAllExtras();
  }
  
  /**
   * Fetch all extras
   */
  fetchAllExtras() {    
    this.setState({ progressView: true });
    Pref.getVal(Pref.bBearerToken, value => {
      const removeQuotes = Helper.removeQuotes(value);
      Pref.getVal(Pref.bId, biid => {
        Helper.networkHelperToken(
          Pref.ServiceUrl + this.props.idservice,
          Pref.methodGet,
          removeQuotes,
          resultxx => {
            //////console.log("connectedDataas", resultxx.extras);
            Helper.networkHelperToken(
              Pref.FetchExtrasUrl + biid,
              Pref.methodGet,
              removeQuotes,
              result => {
                const connectedDataas = resultxx.extras;
                ////////console.log("connectedDataas", connectedDataas);
                const modifiedResult = Lodash.map(result, function (item, index) {
                  return Lodash.extend({}, item, { selected: false });
                });
                let groupedExtra = Lodash.groupBy(modifiedResult, function (exData) {
                  if (exData.category !== '') {
                    return exData.category_name;
                  }
                });
                let connectedGrouping = Lodash.groupBy(connectedDataas, function (exData) {
                  if (exData.category !== '') {
                    return exData.category_name;
                  }
                });
                ////////console.log('connectedGrouping', connectedGrouping);
                const serviceCat = Object.keys(groupedExtra).map(value =>{
                  let isConnected = false;
                  let innerData = groupedExtra[value];
                  if (connectedDataas !== null && connectedDataas !== undefined && connectedDataas.length > 0){
                    Object.keys(connectedGrouping).map(keyd =>{
                      if (keyd == value) {
                        isConnected = true;
                        const oooop = connectedGrouping[keyd];
                        innerData.map(obj =>{
                          let ooopppp = obj;
                          oooop.map(objj =>{
                            if (ooopppp.extra.name == objj.name) {
                              ooopppp.extra.selected = true;
                            } 
                          });
                          return ooopppp;
                        });
                      }
                    });
                  }
                 // //////console.log('finaldatass', innerData);
                  return { name: value, data: innerData, connectedornot: isConnected }
                });
                ////////console.log("services", JSON.stringify(serviceCat));
                this.setState({
                  progressView: false,
                  extrasList: serviceCat,
                  clone: result,
                  connectedGrouping: connectedGrouping
                });
              },
              error => {
                this.setState({ progressView: false });
              }
            );

          });
      });
    });
  }

  /**
   * search products
   * @param {Search} text
   */
  filterSearch(text) {
    if (text === "") {
      this.setState({ extrasList: this.state.clone });
    } else {
      const newData = this.state.clone.filter(item => {
        const itemData = item.name.toLowerCase();
        return itemData.includes(text.toLowerCase());
      });
      this.setState({
        extrasList: newData.length > 0 ? newData : this.state.clone
      });
    }
  }

  _showDialog = () => this.setState({ dialogShow: true });

  _hideDialog = () => this.setState({ dialogShow: false });

  /**
   * update extra
   */
  updateExtras() {
    this.setState({ progressView: true });
    Pref.getVal(Pref.bBearerToken, value => {
      const removeQuotes = Helper.removeQuotes(value);
      const id = this.state.extraid;
      const postData = JSON.stringify({
        idextra: id,
        fkidcategory: this.state.fkidcategory,
        name: this.state.extraName,
        price: this.state.extraPrice,
        fkidbusiness: this.state.fkidbusiness
      });
      Helper.networkHelperTokenPost(
        Pref.UpdateExtraUrl + id,
        postData,
        Pref.methodPut,
        removeQuotes,
        result => {
         // //////console.log(result);
          const clone = this.state.extrasList;
          const arr = clone.indexOf(id);
          clone.splice(arr);
          this.setState({
            dialogShow: false,
            progressView: false,
            extrasList: clone,
            extraPrice: "",
            extraName: "",
            fkidbusiness: 0,
            fkidcategory: 0,
            idextra: 0
          });
        },
        error => {
          this.setState({ progressView: false });
        }
      );
    });
  }

  /**
   * deleteExtras
   */
  deleteExtras() {
    this.setState({ progressView: true });
    const id = this.state.extraid;
    const bid = this.state.fkidbusiness;
    const postData = [];
    postData.push({ first_int: bid, second_int: id });
    Pref.getVal(Pref.bBearerToken, value => {
      const removeQuotes = Helper.removeQuotes(value);
      Helper.networkHelperTokenPost(
        Pref.DeleteExtraUrl,
        JSON.stringify(postData),
        Pref.methodPost,
        removeQuotes,
        result => {
          const clone = this.state.extrasList;
          const arr = clone.indexOf(id);
          clone.splice(arr);
          this.setState({
            dialogShow: false,
            progressView: false,
            extrasList: clone,
            extraPrice: "",
            extraName: "",
            fkidbusiness: 0,
            fkidcategory: 0,
            idextra: 0
          });
        },
        error => {
          this.setState({ progressView: false });
        }
      );
    });
  }

  editclicked(data, title){
    let modif = [];
    const pp = Lodash.map(data, (ele) =>{
      const tuu = ele.extra;
      modif.push({
        idextra: tuu.idextra,
        fkidcategory: tuu.fkidcategory,
        name: tuu.name,
        price: tuu.price,
        fkidbusiness: tuu.fkidbusiness
      });
    });
    if(modif !== null && modif !== undefined && modif.length > 0){
      NavigationAction.navigate("BusinessEditAddExtra", {
        extraMode: true,
        datax:modif,
        name: title
      });
    }
  }

  showExtrassList(rowData){
    this.setState({ selectExtracat: true, selectedCategoryName: rowData.name, selectedCategoryItems: rowData.data,});
  }

  /**
   *
   * @param {*} rowData
   * @param {*} index
   *           //connectedornot
   */
  renderRow(rowData, index) {
    return (
      <View style={{
        marginHorizontal: sizeWidth(2),
        marginVertical: sizeHeight(1)}}>
        <TouchableWithoutFeedback
          onPress={() => this.showExtrassList(rowData)}
        >
          <Row style={{
            borderRadius: 2,
            borderColor: '#dedede',
            borderStyle: 'solid',
            borderWidth: 1,}}>
            <View styleName="vertical v-start h-start" style={{flexDirection:'row',justifyContent:'space-between'}}>
              <Subtitle numberOfLines={1} style={{ marginHorizontal: sizeWidth(1), color: '#292929', fontSize: 16,fontWeight:'400'}} styleName="bold">
                {Lodash.capitalize(rowData.name)}
              </Subtitle>

              {rowData.connectedornot ?
                <Icon name={'check'} size={24} style={{ color: '#6DC124', alignSelf: 'center',marginEnd:-10}} />: null}
            </View>
          </Row>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  /**
   * search products
   * @param {Search} text
   */
  filterConnectSearch(text) {
    let select = this.state.selectedTab;
    if (text === "") {
      this.setState({ allData: this.state.allCloneData });
    } else {
      let newData = [];
      let fx = [];
      if (select === 1) {
        newData = this.state.allCloneData[select].filter(item => {
          const itemData = item.name.toLowerCase();
          return itemData.includes(text.toLowerCase());
        });
      } else {
        newData = this.state.allCloneData[select].filter(item => {
          const itemData = item.category.toLowerCase();
          return itemData.includes(text.toLowerCase());
        });
      }
      fx[select] = newData;
      ////////console.log(this.state.allCloneData[select]);
      ////////console.log(newData);
      this.setState({
        allData: fx.length > 0 ? fx : this.state.allCloneData
      });
    }
  }
  onnScreen(){
    this.setState({
      onScreen:!this.state.onScreen
    })
  }

  connectService(idservice) {
    this.setState({ smp: true, connectChoice:false});

  }

  groupClicked(catname, checkedval, checked){
    const itemList = this.state.allData;
    const datax = Lodash.map(itemList, (element) =>{
      if (catname === element.title) {
        element.selected = !checkedval;
        const opp = Lodash.map(element.data, ele =>{
           ele.checked = !ele.checked;
          return ele;
        })
        element.data = opp;
      } 
      return element;
    })
    ////////console.log('data', JSON.stringify(datax));
    this.setState({ allData: datax });
  }

  expandlisterner(catname, checkedval) {
    const itemList = this.state.allData;
    const datax = Lodash.map(itemList, (element) => {
      if(catname === element.title){
        element.checked = !checkedval;
      }
       return element;
    })
    this.setState({ allData: datax });
  }

  itemclicklisterner(name){
    let itemList = this.state.allData;
    const vl = Lodash.map(itemList, (el) =>{
      if (el.checked){
        const ty = Lodash.map(el.data, (ele) => {
          if (name === ele.idservice){
            ele.checked = !ele.checked;
          }
          return ele;
        });
        el.data = ty;
      }
      return el;
    });
    ////////console.log('vl', JSON.stringify(vl));
    this.setState({ allData: vl });
  }


  extraAllSelectItemlols(mode, title){
    let data = this.state.selectedCategoryItems;
    const vo = this.state.checkAllExtraItems;
    let fool = false;
    const result = Lodash.map(data, (ele) =>{
      if(mode == 1){
        ele.extra.selected = !vo;
        fool = !vo;
      }else{
        if(title.toLowerCase() === ele.extra.name.toLowerCase()){
          const vlk = ele.extra.selected;
          ele.extra.selected = !vlk;
          fool = !vlk;
        }else{
          //ele.extra.selected = false;
        }
      }
      return ele;
    });
    const resultxx = [];
    const ty = this.state.selectedCategoryName;
    ////console.log('ty', ty);
    const resultx = Lodash.map(this.state.extrasList, (ele) =>{
      if (ty.toLowerCase() === ele.name.toLowerCase()) {
        ele.connectedornot = fool;
      }
      return ele;
    })
    if(mode == 1){
      this.setState({ selectedCategoryItems: result, checkAllExtraItems: !vo, extrasList: resultx });
    }else{
      this.setState({ selectedCategoryItems: result, extrasList: resultx});
    }
  }
  
  /**
 *
 * @param {*} rowData
 * @param {*} index
 */
  renderTabDataRow(eachTabData, index) {
    return (
      <View>
        {index === 0 ? <View style={{
          backgroundColor: '#d9d9d9',
          height: 1,
        }} /> : null}
        <View styleName="horizontal" style={{ paddingVertical: sizeHeight(1), paddingHorizontal: sizeWidth(4)}}>
          <Checkbox
            status={eachTabData.checked ? "checked" : "unchecked"}
            color={'#3daccf'}
            onPress={() => this.itemclicklisterner(eachTabData.idservice)}
          />
          <Subtitle
            styleName="bold"
            style={{
              fontFamily: 'Rubik',
              fontSize: 16,
              fontWeight: '400',
              alignSelf: "center",
              color: '#292929',
            }}
          >
            {Lodash.capitalize(eachTabData.name)}
          </Subtitle>
        </View>
      </View>
    );
  }
  selectedCatExtraItem(rowData, index){
    return (
      <View>
        <View styleName="vertical">
          <View styleName="horizontal" style={{ justifyContent: 'space-between', paddingVertical: sizeHeight(2), paddingHorizontal: sizeWidth(4) }}>
            <View styleName="horizontal">
              <Checkbox
                status={rowData.extra.selected === true ? "checked" : "unchecked"}
                color={'#3daccf'}
                onPress={() => this.extraAllSelectItemlols(2, rowData.extra.name)}
              />
              <Subtitle
                styleName="bold"
                style={{
                  fontFamily: 'Rubik',
                  fontSize: 16,
                  fontWeight: '400',
                  alignSelf: "center",
                  color: '#292929',
                }}
              >
                {Lodash.capitalize(rowData.extra.name)}
              </Subtitle>
            </View>
          </View>
        </View>
      </View>
    );
  }

  /**
   *
   * @param {*} rowData
   * @param {*} index
   */
  renderRowProductCat(rowData, index) {
    return (
      <View>
        {index == 0 ? <View style={{
          height: 1,
          backgroundColor: '#dedede',
        }} /> : null}
        <View styleName="vertical">
          <View styleName="horizontal" style={{ justifyContent: 'space-between',paddingVertical:sizeHeight(2),paddingHorizontal:sizeWidth(4) }}>
            <View styleName="horizontal">
              <Checkbox
                status={rowData.selected ? "checked" : "unchecked"}
                color={'#3daccf'}
                onPress={() => this.groupClicked(rowData.title, rowData.selected, rowData.checked)}
              />
              <Subtitle
                styleName="bold"
                style={{
                  fontFamily: 'Rubik',
                  fontSize: 16,
                  fontWeight: '400',
                  alignSelf: "center",
                  color: '#292929',
                }}
              >
                {Lodash.capitalize(rowData.title)}
              </Subtitle>
            </View>
            <TouchableWithoutFeedback onPress={() => this.expandlisterner(rowData.title, rowData.checked)}>
              <Icon
                style={{ alignSelf: 'flex-end' }}
                name={!rowData.checked ? 'keyboard-arrow-down' : 'keyboard-arrow-up'}
                size={24} />
            </TouchableWithoutFeedback>
          </View>
          {rowData.checked ? <FlatList
            extraData={this.state}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={true}
            data={rowData.data}
            nestedScrollEnabled={true}
            ItemSeparatorComponent={() => {
              return <View style={{
                backgroundColor: '#d9d9d9',
                height: 1,
              }} />
            }}
            keyExtractor={(item, index) => item.idservice.toString()}
            renderItem={({ item: eachTabData, index }) =>
              this.renderTabDataRow(eachTabData, index)
            }
          /> : null}
        </View>
        {this.state.allData.length - 1 === index ? <View style={{
          height: 1,
          backgroundColor: '#dedede',
        }} /> : null}
      </View>
    );
  }

  setTab = selectedTab => {
    this.setState({ selectedTab });
  };

  render() {
    return (
      <Screen style={{ backgroundColor: "white" }}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff"/>
        <View
          styleName="vertical"
          style={{
            flex: 1,
            backgroundColor: "white"
          }}
        >
          <DummyLoader
            visibilty={this.state.progressView}
            center={
              <FlatList
                extraData={this.state}
                data={this.state.extrasList}
                showsVerticalScrollIndicator={true}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => {
                  index.toString();
                }}
                renderItem={({ item: item, index }) =>
                  this.renderRow(item, index)
                }
              />
            }
          />
        </View>
        {this.state.dialogShow === true ? (
          <Portal>
            <Dialog visible={this._showDialog} onDismiss={this._hideDialog}>
              <Dialog.Title>Edit Extra</Dialog.Title>
              <Divider styleName="line" />
              <Dialog.Content>
                <View styleName="vertical sm-gutter">
                  <TextInput
                    style={{
                      height: sizeHeight(8),
                      borderRadius: 2,
                      borderColor: '#dedede',
                      borderStyle: 'solid',
                      borderWidth: 1,
                      backgroundColor: '#ffffff',
                      marginHorizontal: sizeWidth(1),
                      marginTop: sizeHeight(1),
                      color: '#777777',
                      fontFamily: 'Rubik',
                      fontSize: 16,
                      fontWeight: '400',
                    }}
                    mode={"flat"}
                    label={"Name"}
                    password={false}
                    returnKeyType="next"
                    numberOfLines={1}
                    value={this.state.extraName}
                    onChangeText={text =>
                      this.setState({ extraName: text })
                    }
                    underlineColor={"transparent"}
                    underlineColorAndroid={"transparent"}
                  />

                  <TextInput
                    style={{
                      height: sizeHeight(8),
                      borderRadius: 2,
                      borderColor: '#dedede',
                      borderStyle: 'solid',
                      borderWidth: 1,
                      backgroundColor: '#ffffff',
                      marginHorizontal: sizeWidth(1),
                      marginTop: sizeHeight(1),
                      color: '#777777',
                      fontFamily: 'Rubik',
                      fontSize: 16,
                      fontWeight: '400',
                    }}
                    mode={"flat"}
                    label={"Price"}
                    password={false}
                    returnKeyType="done"
                    numberOfLines={1}
                    keyboardType={"numeric"}
                    value={this.state.extraPrice}
                    onChangeText={text =>
                      this.setState({ extraPrice: text })
                    }
                    underlineColor={"transparent"}
                    underlineColorAndroid={"transparent"}
                  />

                  <Button
                    mode={"contained"}
                    style={{
                      color: "white",
                      bottom: 0,
                      paddingVertical: sizeWidth(2),
                      marginHorizontal: sizeWidth(1),
                      marginTop: sizeHeight(2),
                      backgroundColor: '#3daccf',
                      textAlign: "center",
                    }}
                    onPress={() => this.updateExtras()}
                  >
                    <Subtitle
                      styleName="v-center h-center"
                      style={{
                        color: "white"
                      }}
                    >
                      Update
                        </Subtitle>
                  </Button>

                  <Button
                    mode={"contained"}
                    style={{
                      color: "white",
                      bottom: 0,
                      paddingVertical: sizeWidth(2),
                      marginHorizontal: sizeWidth(1),
                      marginTop: sizeHeight(2),
                      backgroundColor: Colors.red500,
                      textAlign: "center",
                    }}
                    onPress={() => this.deleteExtras()}
                  >
                    <Subtitle
                      styleName="v-center h-center"
                      style={{
                        color: "white"
                      }}
                    >
                      מחיקה
                    </Subtitle>
                  </Button>
                </View>
              </Dialog.Content>
            </Dialog>
          </Portal>
        ) : null}
        <Portal>
          <Modal
          dismissable={true}
          visible={this.state.connectChoice}
          onDismiss={()=>this.setState({connectChoice:false})}
            contentContainerStyle={{
              marginHorizontal: sizeWidth(4),}}>
              <ScrollView>
              <View styleName="vertical" style={{
                flex:1,
                backgroundColor: 'white',
              }}>
                <View
                  style={{ alignItem: 'flex-start', justifyContent: 'center', height: 60, marginHorizontal: sizeWidth(1) }}>
                  <Heading style={{
                    fontSize: 18, color: '#292929',
                    fontFamily: 'Rubik',
                    fontWeight: '700',
                    alignSelf: 'center'
                  }}> הוסף תוספת</Heading>
                </View>
                <Button
                  mode={"contained"}
                  style={styles.loginButtonStyle}
                  onPress={() => this.connectService()}
                >
                  <Subtitle
                    styleName="v-center h-center"
                    style={{
                      color: "white"
                    }}
                  >
                    חיבור תוספת
              </Subtitle>
                </Button>
              </View>
              </ScrollView>
          </Modal>
        </Portal>
        
        <Portal>
          <Modal
            dismissable={true}
            visible={this.state.selectExtracat}
            onDismiss={() => this.setState({ selectExtracat: false, selectedCategoryName: '', selectedCategoryItems: [], checkAllExtraItems:false})}
            contentContainerStyle={{
              marginHorizontal: sizeWidth(4),
            }}>
            <ScrollView>
              <View styleName="vertical" style={{
                flex: 1,
                backgroundColor: 'white',
              }}>
                <View
                  style={{ alignItem: 'center', justifyContent: 'space-between', height: 60, marginHorizontal: sizeWidth(4),flexDirection:'row',}}>
                  <Heading style={{
                    fontSize: 18,
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontWeight: '700',
                    alignSelf: 'center'
                  }}> {this.state.selectedCategoryName}</Heading>
                  <View style={{flexDirection:'row',alignItem:'center',justifyContent:'center',alignContent:'center',alignItems:'center'}}>
                    <Subtitle numberOfLines={1} style={{ marginHorizontal: sizeWidth(0.5), color: '#292929', fontSize: 16, alignSelf: 'center' }}>
                      בחר הכל
                    </Subtitle>
                    <Checkbox
                      status={this.state.checkAllExtraItems ? "checked" : "unchecked"}
                      color={'#3daccf'}
                      style={{ alignSelf: 'center', justifyContent: 'center', alignItems:'center',alignContent:'center', backgroundColor:'blue' }}
                      onPress={() => this.extraAllSelectItemlols(1,"hoho")}
                    />
                  </View>
                </View>
                <View
                  styleName="vertical"
                  style={{
                    flex: 1,
                    backgroundColor: "white"
                  }}
                >
                  <DummyLoader
                    visibilty={this.state.progressView}
                    center={
                      <FlatList
                        extraData={this.state}
                        data={this.state.selectedCategoryItems}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                        keyExtractor={(item, index) => {
                          index.toString();
                        }}
                        ItemSeparatorComponent={() => {
                          return <View style={{
                            height: 1,
                            backgroundColor: '#dedede',
                          }} />;
                        }}
                        renderItem={({ item: item, index }) =>
                          this.selectedCatExtraItem(item, index)
                        }
                      />
                    }
                  />
                </View>
                <Button
                  mode={"contained"}
                  style={styles.loginButtonStyle}
                  onPress={() => {
                    this.setState({ selectExtracat: false, checkAllExtraItems: false, });
                    this.props.onSubmitCallback(this.state.selectedCategoryItems);
                  }}
                >
                  <Subtitle
                    styleName="v-center h-center"
                    style={{
                      color: "white"
                    }}
                  >
                    סיום
              </Subtitle>
                </Button>
              </View>
            </ScrollView>
          </Modal>
        </Portal>
        <Loader isShow={this.state.smp} />
        <Snackbar
          visible={this.state.message === "" ? false : true}
          duration={1000}
          onDismiss={() => this.setState({ message: "" })}
        >
          {this.state.message}
        </Snackbar>
      </Screen>
    );
  }
}

const styles = StyleSheet.create({
   buttonStyle: {
    flexGrow: 1,
    marginTop: 8,
    padding: 6,
    width:'90%',
    alignSelf:'center',
    backgroundColor: Colors.red500,
    textAlign: "center"
  },
  applyButton: {
    textAlign: "center",
    justifyContent: "center",
    backgroundColor: "blue",
    position: "relative",
    borderRadius: 24,
    paddingStart: 2,
    paddingEnd: 2,
    paddingTop: 2,
    paddingBottom: 2,
    marginBottom: 8,
    width: Helper.deviceWidth() * 0.4,
    alignSelf: "center",
    elevation: 4
  },
  fab: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    marginBottom: 6,
    backgroundColor: Colors.red500
  },
  inputStyle: {
    height: sizeHeight(8),
    borderRadius: 2,
    borderColor: '#dedede',
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: sizeWidth(4),
    color: '#777777',
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '400',
  },
  loginButtonStyle: {
    color: "white",
    bottom: 0,
    paddingVertical: sizeWidth(2),
    marginHorizontal: sizeWidth(4),
    marginBottom: sizeHeight(2),
    marginTop: sizeHeight(2),
    backgroundColor: '#3daccf',
    textAlign: "center",
  }
});
