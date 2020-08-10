import {AsyncStorage} from 'react-native';

/**
 * Pref Key
 */
export const methodPost = 'POST';
export const methodGet = 'GET';
export const methodPut = 'POST'; //PUT
export const methodDelete = 'DELETE';
export const bBearerToken = 'businesstoken';
export const bLoggedStatus = 'businessloggedstatus';
export const bData = 'businessdata';
export const bId = 'businessid';
export const branchSelected = 'branchSelected';
export const branchId = 'branchid';
export const printon = 'printon';
export const LASTTOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMTA0MjhjYThmMWM0NDlkYmUwOGE2YmM0MTRiNDIyMSIsIm5hbWVpZCI6ImF1dG9jb21wbHQzMiIsImV4cCI6MTkwMTAzMzQ2OSwiaXNzIjoiY2FsbGl0YXBwbGljYXRpb24iLCJhdWQiOiJjYWxsaXRhcHBsaWNhdGlvbiJ9.czeFZoed1-yKdum3YKN7GIqAzbNMFaT3ms60DWFQ83w';
export const CardAccount = 'cgdemo';
export const CardPass = 'C!kd2nc3a';
export const CardMid = '11665';
export const dateToLogout = 'dateLogin';

/**
 * Business Server Url
 */
// 'http://djangoman123-001-site1.btempurl.com/'
//  http://192.236.162.188/
export const BASEURL = 'http://djangoman123-001-site1.btempurl.com/';

export const UserOwnerLoginUrl = `${BASEURL}api/UserownersLogin`;
export const AddServiceUrl = `${BASEURL}api/AddService`;
export const FetchServicesUrl = `${BASEURL}api/ServicesByBranchId/`;
export const UpdateServiceUrl = `${BASEURL}api/ServicesUpdate/`;
export const FetchExtrasUrl = `${BASEURL}api/ExtraByBusiness/`;
export const ExtraCatUrl = `${BASEURL}api/Categories/`;
export const LogOutUrl = `${BASEURL}api/UserownerLogout/`;
export const GetOrdersUrl = `${BASEURL}api/GetOrdersByDate/`;
export const AddExtraUrl = `${BASEURL}api/Extra`;
export const DeleteServiceExtraUrl = `${BASEURL}api/DeleteServiceExtra/`;
export const GetProductServiceExtraUrl = `${BASEURL}api/ServiceExtrasByService/`;
export const DeleteExtraUrl = `${BASEURL}api/DeleteExtras/`;
export const AddServiceExtraUrl = `${BASEURL}api/AddServiceExtra/`;
export const UpdateExtraUrl = `${BASEURL}api/UpdateExtra/`;
export const DeleteServiceUrl = `${BASEURL}api/DeleteServices/`;
export const BusinessDetailUrl = `${BASEURL}api/getBusinessForOwner/`;
export const BranchUpdateUrl = `${BASEURL}api/UpdateBranch/`;
export const DeclineUrl = `${BASEURL}api/DeclineOrder/`;
export const UpdateStatusUrl = `${BASEURL}api/UpdateOrderStatus/`;
export const BusinessOwnerUrl = `${BASEURL}api/getBranchForOwner/`;
export const GetDeliveryUrl = `${BASEURL}api/DeliveryPrice/`;
export const UpdateDeliveryUrl = `${BASEURL}api/UpdateDeliveryPrice/`;
export const GerReviewsUrl = `${BASEURL}api/GetReviews/`;
export const ServiceUrl = `${BASEURL}api/getServiceForCustomer/`;
export const BranchListURL = `${BASEURL}api/BranchesByBusinessId/`;
export const LogoURL = `${BASEURL}api/PostBusinessLogo/`;
export const AddDeliveryPrices = `${BASEURL}api/AddDeliveryPrices/`;
export const DeleteDeliveryPrices = `${BASEURL}api/DeleteDeliveryPrice/`;
export const Cities = `${BASEURL}api/Cities/`;
export const GetDeliveryListItemUrl = `${BASEURL}api/DeliveryPrices/`;
export const GetDeliveryListItemAutoCompleteSearchUrl = `${BASEURL}api/CitiesAutocomplete/`;
export const UpdateBusiness = `${BASEURL}api/UpdateBusiness/`;
export const ServerTimeUrl = `${BASEURL}api/getServerTime/`;
//export const CreditCardUrl = `https://api.creditguard.co.il/merchants/xpo/Relay`;
//export const CreditCardUrl = `https://cguat2.creditguard.co.il/xpo/Relay`;
export const CreditCardUrl = `https://api.creditguard.co.il/merchants/xpo/Relay`;
export const GetSessionCardUrl = `${BASEURL}api/getSessionIdForCG`;

export const GetServiceCategories = `${BASEURL}/api/getServiceCategories/`;
export const AddServiceCategory = `${BASEURL}/api/addServiceCategory`;
export const UpdateServiceCategory = `${BASEURL}/api/UpdateServiceCategory/`;
export const DeleteServiceCategory = `${BASEURL}/api/deleteServiceCategory/`;
export const UserDilveryLoginUrl = `${BASEURL}/api/UserdeliveryLogin`;
export const ServiceAvailableUpdate = `${BASEURL}api/ServicesAvailableUpdate/`;

export const STAGING_CODE_PUSH = 'i2kT4q5oMp-8bHeLO0VJSSqkDN-0so8TEGYDV';
export const PRODUCTION_CODE_PUSH = 'Cugnw4a2ldNF12it28lPZ4lMWy4sqLkJKn_yj';
export const STAGING_CODE_PUSH_IOS = 'RoqzlZoSHrYC2klZ34Ow5bWTb2NSZD6h-pT6D';
export const PRODUCTION_CODE_PUSH_IOS = '_rFud2ALD67luta0yAS9niOzfA63Nyv8-PQHF';

/**
 * Set Val
 * @param key
 * @param val
 * @returns {Promise<void>}
 */
export const setVal = async (key, val) => {
  let value = JSON.stringify(val);
  if (value) {
    AsyncStorage.setItem(key, value);
  }
};

/**
 * Get value
 * @param key
 * @param callback
 */
export const getVal = (key, callback = response => {}) => {
  AsyncStorage.getItem(key).then(value => {
    callback(value);
  });
};

export const returnCheckNumber = text => {
  const checkIsNumber = '/[^0-9]/g';
  return checkIsNumber.test(text);
};
