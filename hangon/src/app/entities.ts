import { combineReducers } from "redux";

import hangboardReducer from "../shared/store/hangboardSlice";

export default combineReducers({
  hangboard: hangboardReducer,
});
