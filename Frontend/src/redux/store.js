import { createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import kayitReducer from "./reducer";

const store = createStore(kayitReducer, applyMiddleware(thunk));

export default store;
