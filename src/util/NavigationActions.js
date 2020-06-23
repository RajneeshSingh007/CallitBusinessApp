import {
  DrawerActions,
  NavigationActions,
  StackActions
} from "react-navigation";

let _navigator;

const setTopLevelNavigator = navigatorRef => {
  _navigator = navigatorRef;
};

const navigate = (routeName, params) => {
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params
    })
  );
};

const goBack = () => {
  _navigator.dispatch(NavigationActions.back({}));
};

const replace = (routeName, params) => {
  _navigator.dispatch(
    StackActions.replace({
      routeName,
      params
    })
  );
};

const resetPage = (routeName, params) => {
  _navigator.dispatch(
    StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName, params })]
    })
  );
};

const toggleDrawer = () => {
  _navigator.dispatch(DrawerActions.toggleDrawer());
};

const openDrawer = () => {
  _navigator.dispatch(DrawerActions.openDrawer());
};

const closeDrawer = () => {
  _navigator.dispatch(DrawerActions.closeDrawer());
};

export default {
  setTopLevelNavigator,
  navigate,
  goBack,
  resetPage,
  replace,
  openDrawer,
  toggleDrawer,
  closeDrawer
};
