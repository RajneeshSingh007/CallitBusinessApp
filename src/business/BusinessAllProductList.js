import React from "react";
import { Alert, FlatList, StatusBar,StyleSheet,Text,BackHandler } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  Checkbox, TextInput, Chip, Colors, Dialog, Portal,Snackbar ,Button,List , Card} from "react-native-paper";
import {
  Caption,
  Divider,
  Heading,
  NavigationBar,
  Row,
  Image,
  Screen,
  Subtitle,
  Title,
  TouchableOpacity,
  View
} from "@shoutem/ui";
import * as Helper from "./../util/Helper";
import NavigationAction from "./../util/NavigationActions";
import * as Pref from "./../util/Pref";
import * as Lodash from "lodash";
import ProgressiveImage from "./../customer/ProgressiveImage";
import DummyLoader from "../util/DummyLoader";
import { Loader} from './../customer/Loader';
import {sizeHeight, sizeWidth, sizeFont} from './../util/Size';
import BusinessMenuChoices from "./BusinessMenuChoices";

let tabData = [];

export default class BusinessAllProductList extends React.Component {
  constructor(props) {
    super(props);
    this.renderTabDataRow = this.renderTabDataRow.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.renderCatRow = this.renderCatRow.bind(this);
    this.onFilterClick = this.onFilterClick.bind(this);
    this.backClick = this.backClick.bind(this);
    this.state = {
      progressView: true,
      searchVisibility: false,
      filterView: false,
      clone: [],
      productList: [],
      catList: [],
      longPress: false,
      selectedItem: [],
      selectedCounter: 0,
      token:'',
      showp:false,
      message:'',
      isCatgegoryClicked:1,
      filterBusiness:'',
      filterCat:'',
      filterPrice:'',
      filterStockk:0,
      filterStock:false,
      close:false,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backClick);
    //this.fetchAllProducts();
    this.willfocusListener = this.props.navigation.addListener('willFocus', () => {
      this.setState({ progressView: true });
    });
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.setState({ progressView: true });
      this.fetchAllProducts();
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backClick);
    if(this.focusListener !== undefined){this.focusListener.remove();}
    if (this.willfocusListener !== undefined) { this.willfocusListener.remove(); }
  }

  backClick(){
    if (this.state.filterView) {
      this.setState({ progressView: true });
      this.fetchAllProducts();
      return true;
    } else {
      if (this.state.longPress) {
        this.setState({ progressView:true, longPress: false, selectedItem: null, selectedCounter: 0, });
        this.fetchAllProducts();
        return true;
      } else {
        return false;
      }
    }
  }

  /**
   * Fetch all products
   */
  fetchAllProducts() {
    Pref.getVal(Pref.bBearerToken, value => {
      const removeQuotes = Helper.removeQuotes(value);
      //////console.log(removeQuotes);
      Pref.getVal(Pref.branchId, value => {
       // //////console.log('id', value);
        Helper.networkHelperToken(
          Pref.FetchServicesUrl + value,
          Pref.methodGet,
          removeQuotes,
          result => {
            let groupedExtra = Lodash.groupBy(result, function (exData) {
              if(exData.category !== ''){
                return exData.category;
              }
            });
            const serviceCat = Object.keys(groupedExtra).map(key => ({
              title: key,
              data: groupedExtra[key]
            }));
            //////console.log('serviceCat', JSON.stringify(serviceCat));
            this.setState({
              close:false,
              filterView:false,
              isCatgegoryClicked:1,
              progressView: false,
              productList: serviceCat,
              clone: result,
              token: removeQuotes,
              filterPrice: '',
              filterStockk: 0,
              filterBusiness: "",
              filterCat: "",
            });
          },
          error => {
            this.setState({ progressView: false });
          }
        );

      });
    });
  }

  onFilterClick = () => {
    const ogData = this.state.clone;
    let sortedData = [];
    if (this.state.filterBusiness !== '') {
      sortedData = ogData.filter(element => {
        return element.name.toLowerCase().includes(this.state.filterBusiness.toLowerCase());
      });//Lodash.orderBy(ogData, [{ "category_name": this.state.filterCat }], ["desc"]);
      //////console.log('sorted', 8);
    }else if (this.state.filterCat !== '') {
      sortedData = ogData.filter(element => {
        return element.category.toLowerCase().includes(this.state.filterCat.toLowerCase());
      });//Lodash.orderBy(ogData, [{ "category_name": this.state.filterCat }], ["desc"]);
      //////console.log('sorted', 8);
    } else if (this.state.filterPrice !== '') {
      sortedData = ogData.filter(element => {
        return Number(element.price) === Number(this.state.filterPrice);
      });//Lodash.orderBy(ogData, [{ "category_name": this.state.filterCat }], ["desc"]);
    } else {
      //sortedData = ogData;
      //////console.log('sorted', 1);
    }
    //////console.log('sortedData', sortedData);
    if(sortedData.length > 0){
      let groupedExtra = Lodash.groupBy(sortedData, function (exData) {
        if (exData.category !== '') {
          return exData.category;
        }
      });
      const serviceCat = Object.keys(groupedExtra).map(key => ({
        title: key,
        data: groupedExtra[key]
      }));
      this.setState({
        isCatgegoryClicked: 1,
        productList: serviceCat,
        close: false,
      });
    }
  }

  /**
   * search products
   * @param {Search} text
   */
  filterSearch(text, mode) {
    if (text === "") {
      this.setState({ productList: this.state.clone });
    } else {
      if (mode === false) {
        const newData = Lodash.filter(this.state.clone, item => {
          const itemData = item.name.toLowerCase();
          return itemData.includes(text.toLowerCase());
        });
        this.setState({
          productList: newData.length > 0 ? newData : this.state.clone
        });
      } else {
        const newData = Lodash.filter(this.state.clone, item => {
          const itemData = item.category.toLowerCase();
          return itemData.includes(text.toLowerCase());
        });
        this.setState({
          productList: newData.length > 0 ? newData : this.state.clone,
          filterView: false
        });
      }
    }
  }

  multiClick(rowData){
      if (this.state.selectedItem.includes(rowData)) {
        this.state.selectedItem.pop(rowData);
        ////////console.log(fx);
        if (this.state.selectedCounter === 1) {
          this.setState({ selectedItem: [], selectedCounter: 0, longPress: false });
        } else {
          this.setState({ selectedCounter: this.state.selectedCounter - 1 });
        }
      } else {
        this.state.selectedItem.push(rowData);
        this.setState({
          selectedCounter: this.state.selectedCounter + 1
        });
      }
  }

  findpro(rowData){
    const pp = this.state.selectedItem;
    const ppp = Lodash.findIndex(pp, { idservice: rowData.idservice}, 0);
    //////console.log('ppp', ppp);
    return ppp >= 0 ? true : false;
  }

  deleteProduct() {
    const postData = [];
    //////console.log('selecteditem', this.state.selectedItem);
    this.state.selectedItem.map(item => {
      postData.push({ 'integer': item.idservice });
    })
    Alert.alert(
      'מחיקה',
      'האם ברצונך למחוק?',
      [
        {
          text: 'לא', onPress: () => {
          this.setState({ selectedItem: [], selectedCounter: 0, longPress: false });
        }},
        {
          text: 'כן', onPress: () => {
          this.setState({ showp: true });
          Pref.getVal(Pref.branchId, (value) =>{
            Helper.networkHelperTokenPost(
              Pref.DeleteServiceUrl + value,
              JSON.stringify(postData),
              Pref.methodPost,
              this.state.token,
              result => {
                this.setState({ showp: false, selectedItem: [], selectedCounter: 0, longPress: false, message: result });
                this.fetchAllProducts();
              }, error => {
                this.setState({ showp: false });
              }
            );
          });
        } },
      ]
    );
  }

  /**
   *
   * @param {*} rowData
   * @param {*} index
   */
  renderRow(item, index) {
    return (
      <View>
        {index == 0 ? <View style={{
          height: 1,
          backgroundColor: '#dedede',
        }} /> : null}
        <List.Accordion title={item.title} titleStyle={{
          fontFamily: 'Rubik',
          fontSize: 16,
          fontWeight: '400',
          lineHeight: 25,
          marginStart:sizeWidth(3)
        }} style={{paddingVertical:sizeHeight(1.5)}}>
          <FlatList
            extraData={this.state}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={true}
            data={item.data}
            nestedScrollEnabled={true}
            ItemSeparatorComponent={()=>{
              return <View style={{
                backgroundColor: '#d9d9d9',
                height: 1,
              }} />
            }}
            keyExtractor={(item, index) => item.idservice.toString()}
            renderItem={({ item: eachTabData, index }) =>
              this.renderTabDataRow(eachTabData, index)
            }
          />
        </List.Accordion>
        {this.state.productList.length - 1 === index ? <View style={{
          height: 1,
          backgroundColor: '#dedede', 
        }} /> : null}

      </View>
    );
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
        <TouchableOpacity styleName="flexible" 
        onPress={() =>{!this.state.longPress ? 
            NavigationAction.navigate("BusinessEditAddProducts", {
              data: eachTabData,
              itemedit: true
            }) : this.multiClick(eachTabData)}}

          onLongPress={() => {
            this.state.selectedItem = [];
            this.state.selectedItem.push(eachTabData);
            this.setState({longPress: true, selectedCounter: 1 });
          }}
      >
          <Row styleName="vertical" >
            <Card  style={{
              marginEnd:sizeWidth(6),
              width: 65,
              height: 65,
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
            }}>
              <Image
                source={{ uri: `${Pref.BASEURL}${eachTabData.imageUrl}` }}
                style={{
                  width:65,
                  height:65,
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
            <View styleName="vertical">
              <View styleName="horizontal space-between">
                <Title styleName="bold" style={{
                  color: '#292929',
                  fontFamily: 'Rubik',
                  fontSize: 16,
                  fontWeight: '700',
                  multiline: false,
                  lineHeight: 25,}}>
                  {Lodash.capitalize(eachTabData.name)}
                </Title>
                {this.findpro(eachTabData) ? <Checkbox
                  status={"checked"}
                  color={'#3DACCF'}
                /> : <Title styleName="bold" style={{
                  color: '#292929',
                  fontFamily: 'Rubik',
                  fontSize: 16,
                  fontWeight: '700',
                  lineHeight: 25,
                  }}>₪{eachTabData.price}</Title>}
              </View>
              <View styleName="horizontal space-between">
                <Subtitle styleName="multiline" style={{
                  color: '#292929',
                  fontFamily: 'Rubik',
                  fontSize: 14,
                  multiline:true,
                  fontWeight: '400',
                  lineHeight: 25,}}>
                  {Lodash.capitalize(eachTabData.description)}
                </Subtitle>
              </View>
            </View>
          </Row>
        </TouchableOpacity>
      </View>
    );
  }
  renderCatRow(rowData, index) {
    return (
      <View>
        <TouchableOpacity
          onPress={() => this.filterSearch(rowData.category, true)}
        >
          <Row>
            <View styleName="vertical v-start h-start">
              <Subtitle numberOfLines={1}>
                {Lodash.capitalize(rowData.category)}
              </Subtitle>
            </View>
          </Row>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    return (
      <Screen
        style={{
          backgroundColor: "white"
        }}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff"/>
        {this.state.longPress === false ? <NavigationBar
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
            !this.state.close ? <View style={{ flexDirection: 'row', marginEnd: sizeWidth(5) }}>
              <TouchableOpacity onPress={() => this.setState({ isCatgegoryClicked: 2, filterView: true,close:true})}>
                <Image source={require('./../res/images/search.png')}
                  style={{ width: 24, height: 24, marginEnd: 16, }}
                />
              </TouchableOpacity>
              <BusinessMenuChoices />
            </View> : <View style={{ flexDirection: 'row', marginEnd: sizeWidth(5) }}>
                <TouchableOpacity onPress={() => this.setState({ isCatgegoryClicked: 1, filterView: false, close:false })}>
                  <Icon 
                    name={'close'}
                    size={36}
                    color={'#292929'}/>
                </TouchableOpacity>
              </View>
         }
          leftComponent={<View style={{marginStart:12}}>
            <Heading style={{
              fontSize: 20, color: '#292929',
              fontFamily: 'Rubik',
              fontWeight: '700',
            }}>{this.state.close ? 'חפש מוצר' : 'המוצרים שלי'}</Heading>
          </View>}
        /> : <NavigationBar
          styleName="inline"
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
            <TouchableOpacity onPress={() => this.setState({ longPress: false, selectedCounter: 0, selectedItem: [] })}>
              <Icon
                name="close"
                size={36}
                color="#292929"
                style={{ padding: 4, marginEnd:8, backgroundColor: "transparent" }}
              />
            </TouchableOpacity>
          }
            leftComponent={<Heading style={{
              fontSize: 20, color: '#292929',
              fontFamily: 'Rubik',
              fontWeight: '700',
              alignSelf:'flex-start',
              marginStart:sizeWidth(2.5),
            }}>{this.state.selectedCounter+ ' נבחרו '}</Heading>}
        />}
        {this.state.isCatgegoryClicked == 1  ? <View
          styleName="vertical"
          style={{ flex: 1, backgroundColor: "white" }}
        >
          <Button
            styleName=" muted border"
            mode={"contained"}
            uppercase={true}
            dark={true}
            loading={false}
            style={[styles.loginButtonStyle]}
            onPress={() => {this.state.longPress === false ?
              NavigationAction.navigate("BusinessEditAddProducts", { itemedit: false}) : this.deleteProduct()}}
          >

            <Subtitle
              style={{
                color: "white"
              }}
            >{this.state.longPress === false ? `הוספת מוצר חדש` :`מחק מוצר`}</Subtitle>
          </Button>
          
            <DummyLoader
              visibilty={this.state.progressView}
              center={
                this.state.productList.length > 0 ?
                  <FlatList
                    extraData={this.state}
                    data={this.state.productList}
                    disableVirtualization={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={true}
                    ItemSeparatorComponent={() => {
                      return <View style={{
                        height: 1,
                        backgroundColor: '#dedede',
                      }} />;
                    }}
                    keyExtractor={(item, index) => {
                      index.toString();
                    }}
                    renderItem={({ item: item, index }) =>
                      this.renderRow(item, index)
                    }
                  />
                  : <Subtitle style={{ color: '#777777', fontSize: 14, alignSelf: 'center', fontWeight: '700' }}>...לא נמצאו מוצרים</Subtitle>
              }
            />
          </View>: null}
          {this.state.isCatgegoryClicked == 2  ? <View style={{ flexDirection: 'column', marginTop: sizeHeight(3) }}>
          <TextInput
            mode='flat'
            label={"שם המוצר"}
            underlineColor='transparent'
            underlineColorAndroid='transparent'
            style={[styles.inputStyle,]}
            placeholderTextColor={'#DEDEDE'}
            placeholder={"enter product name"}
            onChangeText={value => this.setState({ filterBusiness: value })}
            value={this.state.filterBusiness}
          />
          <TextInput
            mode='flat'
            label={"בחר קטגוריה"}
            underlineColor='transparent'
            underlineColorAndroid='transparent'
            style={[styles.inputStyle, { marginTop: 16, }]}
            placeholderTextColor={'#DEDEDE'}
            placeholder={"enter category name"}
            onChangeText={value => this.setState({ filterCat: value })}
            value={this.state.filterCat}
          />

          <TextInput
            mode='flat'
            label={"מחיר"}
            underlineColor='transparent'
            underlineColorAndroid='transparent'
            style={[styles.inputStyle, { marginTop: 16, }]}
            placeholderTextColor={'#DEDEDE'}
            placeholder={"enter product price"}
            onChangeText={value => this.setState({ filterPrice: value })}
            value={this.state.filterPrice}
          />
          <View style={{ marginTop: sizeWidth(2), flexDirection: 'row', justifyContent: 'space-between',marginHorizontal:sizeWidth(4.2) }}>
            <View style={{ flexDirection: 'column' }}>
              <Subtitle style={{ color: '#777777', fontSize: 16, alignSelf: 'flex-start', }}>זמין במלאי?</Subtitle>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Checkbox
                  status={
                    this.state.filterStockk === 2 ? "checked" : "unchecked"
                  }
                  onPress={() =>
                    this.setState({
                      filterStockk:2,
                      filterStock: true,
                    })
                  }
                  color={'#3DACCF'}
                />
                <Subtitle style={{ color: '#777777', fontSize: 14, alignSelf: 'center', }}>כן</Subtitle>
                <Checkbox
                  status={
                    this.state.filterStockk === 1 ? "checked" : "unchecked"
                  }
                  onPress={() =>
                    this.setState({
                      filterStockk: 1,
                      filterStock: false,
                    })
                  }
                  color={'#3DACCF'}
                />
                <Subtitle style={{ color: '#777777', fontSize: 16, alignSelf: 'center', }}>לא</Subtitle>
              </View>
            </View>
          </View>
          <Button
            styleName=" muted border"
            mode={"contained"}
            uppercase={true}
            dark={true}
            loading={false}
            style={{
              color: "white",
              bottom: 0,
              paddingVertical: sizeWidth(2),
              marginHorizontal: sizeWidth(4),
              marginBottom: sizeHeight(2),
              top: sizeHeight(4),
              backgroundColor: '#3daccf',
              textAlign: "center",}}
            onPress={this.onFilterClick}
          >

            <Subtitle
              style={{
                color: "white"
              }}
            >חפש</Subtitle>
          </Button>
        </View> : null}
        <Loader
          isShow={this.state.showp}/>
        <Snackbar
          visible={this.state.message === "" ? false : true}
          duration={600}
          onDismiss={() =>
            this.setState({
              message: ""
            })
          }
        >
          {this.state.message}
        </Snackbar>
        </Screen>
    );
  }
}
const styles = StyleSheet.create({
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
  },
});