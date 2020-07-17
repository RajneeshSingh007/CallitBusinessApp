import {Dimensions, PermissionsAndroid, Platform} from 'react-native';
import {NavigationActions, StackActions} from 'react-navigation';
import NavigationAction from './../util/NavigationActions';
import Lodash from 'lodash';
import Moment from 'moment';

/**
 *
 * @param props
 */
export const closeCurrentPage = props => {
  props.navigation.goBack(null);
};

/**
 * onBackClick navigation..i.e back to homepage
 * @param props
 */
export const backClick = props => {
  NavigationAction.navigate('Home');
  //props.navigation.navigate("Home");
};

/**
 * onItemClick navigation
 * @private
 * @param props
 * @param val
 */
export const itemClick = (props, val) => {
  //props.navigation.navigate(val);
  NavigationAction.navigate(val);
};

export const passParamItemClick = (props, val, data) => {
  //props.navigation.navigate(val, data);
  NavigationAction.navigate(val, data);
};

/**
 * return device width
 * @returns {*}
 */
export const deviceWidth = () => {
  return Dimensions.get('window').width;
};

/**
 * return device height
 * @returns {*}
 */
export const deviceHeight = () => {
  return Dimensions.get('window').height;
};

/**
 * Ask permission on android
 * @returns {Promise<void>}
 */
export const requestPermissions = async () => {
  try {
    if (Platform.OS === 'android') {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]).then(result => {
        if (
          result['android.permission.ACCESS_COARSE_LOCATION'] &&
          result['android.permission.CALL_PHONE'] &&
          result['android.permission.READ_SMS'] &&
          result['android.permission.ACCESS_FINE_LOCATION'] &&
          result['android.permission.READ_EXTERNAL_STORAGE'] &&
          result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
        ) {
          //granted
        } else if (
          result['android.permission.ACCESS_COARSE_LOCATION'] ||
          result['android.permission.CALL_PHONE'] ||
          result['android.permission.READ_SMS'] ||
          result['android.permission.ACCESS_FINE_LOCATION'] ||
          result['android.permission.READ_EXTERNAL_STORAGE'] ||
          result['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            'never_ask_again'
        ) {
          //ignored
        }
      });
    }
  } catch (err) {
    console.warn(err);
  }
};

/**
 * networkHelper
 * @param url
 * @param jsonData
 * @param method
 * @param isTokenPresent
 * @param token
 * @param callback
 * @param errorCallback
 */
export const networkHelper = (
  url,
  jsonData,
  method,
  callback = responseJson => {},
  errorCallback = error => {},
) => {
  fetch(url, {
    method: method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: jsonData,
  })
    .then(response => {
      return response.json();
    })
    .then(responseJson => {
      callback(responseJson);
    })
    .catch(error => {
      //////console.log(error);
      errorCallback();
    });
};

/**
 * networkHelper
 * @param url
 * @param method
 * @param token
 * @param callback
 * @param errorCallback
 */
export const networkHelperToken = (
  url,
  method,
  token,
  callback = responseJson => {},
  errorCallback = error => {},
) => {
  fetch(url, {
    method: method,
    headers: {
      Authorization: 'Bearer ' + token,
    },
  })
    .then(response => response.json())
    .then(responseJson => {
      callback(responseJson);
    })
    .catch(error => {
      //////console.log(error);
      errorCallback();
    });
};

/**
 * networkHelper
 * @param url
 * @param method
 * @param token
 * @param callback
 * @param errorCallback
 */
export const networkHelperTokenPost = (
  url,
  jsonData,
  method,
  token,
  callback = responseJson => {},
  errorCallback = error => {},
) => {
  fetch(url, {
    method: method,
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: jsonData,
  })
    .then(response => {
      //console.log(response)
      return response.json();
    })
    .then(responseJson => {
      callback(responseJson);
    })
    .catch(error => {
      //////console.log(error);
      errorCallback();
    });
};

/**
 * finish current screen
 * @param props
 * @param screen
 */
export const navigateAfterFinish = (props, screen) => {
  const navigateAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({routeName: screen})],
  });
  props.navigation.dispatch(navigateAction);
};

/**
 * removeQuotes
 * @param text
 * @returns {string}
 */
export const removeQuotes = text => {
  if (text !== undefined || text !== null) {
    if (text.charAt(0) === '"' && text.charAt(text.length - 1) === '"') {
      return text.substr(1, text.length - 2);
    }
    return text;
  } else {
    return '';
  }
};

/**
 * check if json is object or string
 */
export const checkJson = item => {
  item = typeof item !== 'string' ? JSON.stringify(item) : item;

  try {
    item = JSON.parse(item);
  } catch (e) {
    return false;
  }
  if (typeof item === 'object' && item !== null) {
    return true;
  }
  return false;
};

/**
 *
 * @param {Group by} list
 * @param {*} keyGetter
 */
export const groupBy = (list, keyGetter) => {
  const map = new Map();
  list.forEach(item => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
};

export const subslongText = (name, length) => {
  const size = name.length;
  return size > length ? name.substring(0, length) + '...' : name;
};

/**
 *
 * @param {*} array
 */
export const countcatextraItem = array => {
  var r = [],
    o = {};
  Lodash.map(array, (a, index) => {
    if (!o[a.name]) {
      o[a.name] = {category: a.category, value: 0, name: a.name};
      r.push(o[a.name]);
    }
    o[a.name].value++;
  });
  return r;
};

/**
 *
 * @param {*} result
 */
export const groupExtraWithCountString = (result, val) => {
  if (result === undefined || result === null || result.length === 0) {
    return '';
  }
  const data = val ? countcatextraItem(result) : result;
  let groupedExtra = Lodash.groupBy(data, function(exData) {
    if (exData.category !== '') {
      return exData.category;
    }
  });
  let extraString = '';
  Object.keys(groupedExtra).map(key => {
    let filterExtras = key + ': ';
    const datass = groupedExtra[key];
    Lodash.map(datass, (ele, index) => {
      if (val) {
        if (index === datass.length - 1) {
          filterExtras += `${ele.value > 1 ? `${ele.value}x` : ''} ${ele.name}`;
        } else {
          filterExtras += `${ele.value > 1 ? `${ele.value}x` : ''}  ${
            ele.name
          },`;
        }
      } else {
        if (index === datass.length - 1) {
          filterExtras += `${ele.name}`;
        } else {
          filterExtras += `${ele.name}, `;
        }
      }
    });
    extraString += filterExtras.trim() + '\n';
  });
  return extraString;
};

/**
 * order data
 * @param {*} arr
 */
export const orderData = (arr, isHistory, checkst = true) => {
  if (arr.length > 0) {
    const result = [];
    let mappingData = Lodash.map(arr, io => {
      const date = Moment(io.orderdate).format('YYYY/MM/DD HH:mm');
      const find = Lodash.find(
        result,
        xm =>
          xm.fkcustomerO === io.fkcustomerO &&
          xm.date === io.date &&
          xm.cartGuid === io.cartGuid,
      );
      if (find === undefined) {
		const stchecker = checkst ? io.status <= 3 : io.status >= 3
        if (stchecker) {
          const data = [];
          data.push(io);
          result.push({
            fkcustomerO: io.fkcustomerO,
            title: date,
            isdelivery: io.isdelivery,
            name: `${io.firstname} ${io.lastname}` || '',
            address: `${io.address}` || '',
            customertelephone: `${io.customertelephone}` || '',
            deliveryprice: `${io.deliveryprice}` || '',
            isHistory: isHistory,
            orderdate: date,
            paid: io.paid,
            status: io.status,
            cartGuid: io.cartGuid,
            idorder: io.idorder,
            data: data,
            totalPrice: io.price,
            shovar: io.shovar,
            servicelist: [],
          });
        }
      } else {
        const indx = Lodash.findLastIndex(
          result,
          xm =>
            xm.fkcustomerO === io.fkcustomerO &&
            xm.date === io.date &&
            xm.cartGuid === io.cartGuid,
        );
        if (indx !== -1) {
          const {data} = find;
          data.push(io);
          find.data = data;
          find.totalPrice = Lodash.sumBy(find.data, ix => ix.price);
          result[indx] = find;
        }
      }
    });
    return Lodash.orderBy(result, ['title'], ['desc']);
  } else {
    return [];
  }
};

/**
 *
 */
export const getCombinedprice = (totalPrice, deliveryPrices) => {
  let price = Number(totalPrice);
  if (
    deliveryPrices !== undefined &&
    deliveryPrices !== null &&
    deliveryPrices !== '' &&
    Number(deliveryPrices) > 0
  ) {
    price += Number(deliveryPrices);
  }
  return price;
};
