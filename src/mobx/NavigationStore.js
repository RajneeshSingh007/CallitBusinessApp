import { action, observable } from "mobx";

export default class NavigationStore {

  @observable navigation = {
    prevScreen: null,
    currentScreen: null
  };

  @action onChangeNavigation(prevScreen, currentScreen) {
    this.navigation = { prevScreen, currentScreen };
  }
}