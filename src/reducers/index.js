import { combineReducers } from "redux";
import loginReducer from "./loginReducer";
import locationReducer from "./locationReducer";
import alertReducer from "./alertReducer";
import constantReducer from "./constantReducer";
import userInfoReducer from "./userInfoReducer";
import orderReducer from "./orderReducer";

export default combineReducers({
  login: loginReducer,
  location: locationReducer,
  alert: alertReducer,
  constant: constantReducer,
  userInfo: userInfoReducer,
  order: orderReducer
});
