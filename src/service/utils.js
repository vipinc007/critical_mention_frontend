"use strict";
export default class Utils {
  static USER_LOCATION_TOKEN =
    "CRITICAL_MENTION_USER_LOCATION_PREFERENCE_001_002";

  static save_location(userobject) {
    localStorage.setItem(this.USER_LOCATION_TOKEN, JSON.stringify(userobject));
  }
  static get_saved_location() {
    console.log("key name", this.USER_LOCATION_TOKEN);
    var returnObjName = JSON.parse(
      localStorage.getItem(this.USER_LOCATION_TOKEN)
    );

    if (returnObjName && Object.keys(returnObjName).length > 0) {
      return returnObjName;
    }
    return null;
  }

  static clear_storage() {
    localStorage.clear();
  }
}
