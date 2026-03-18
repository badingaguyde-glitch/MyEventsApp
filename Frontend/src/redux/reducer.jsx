import UserDataService from "../services/UserDataServices";
import EventService from "../services/EventServices";
import TicketService from "../services/TicketServices";

// Action Types
const LOGIN_INIT = "LOGIN_INIT";
const LOGIN_SUCCESS = "LOGIN_SUCCESS";
const LOGIN_FAILURE = "LOGIN_FAILURE";
const SIGNUP_SUCCESS = "SIGNUP_SUCCESS";
const SIGNUP_FAILURE = "SIGNUP_FAILURE";
const FETCH_INIT = "FETCH_INIT";
const FETCH_SUCCESS = "FETCH_SUCCESS";
const FETCH_USER_SUCCESS = "FETCH_USER_SUCCESS";
const FETCH_FAILURE = "FETCH_FAILURE";
const ADD_UPDATE_KAYIT_SUCCESS = "ADD_UPDATE_KAYIT_SUCCESS";
const ADD_UPDATE_KAYIT_FAILURE = "ADD_UPDATE_KAYIT_FAILURE";
const DELETE_KAYIT_SUCCESS = "DELETE_KAYIT_SUCCESS";
const DELETE_KAYIT_FAILURE = "DELETE_KAYIT_FAILURE";
const FETCH_MY_EVENTS_SUCCESS = "FETCH_MY_EVENTS_SUCCESS";
const LOGOUT = "LOGOUT";

// Async Actions (Thunks)
export const login = ({ email, password }) => async (dispatch) => {
    dispatch({ type: LOGIN_INIT });
    try {
        const response = await UserDataService.login({ email, password });
        localStorage.setItem("user", JSON.stringify(response.data));
        dispatch({ type: LOGIN_SUCCESS, payload: response.data });
        return { payload: response.data, meta: { requestStatus: 'fulfilled' } };
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        dispatch({ type: LOGIN_FAILURE });
        return { payload: message, meta: { requestStatus: 'rejected' } };
    }
};

export const register = (data) => async (dispatch) => {
    try {
        await UserDataService.register(data);
        dispatch({ type: SIGNUP_SUCCESS });
    } catch (error) {
        dispatch({ type: SIGNUP_FAILURE });
    }
};

export const retrieveEvents = () => async (dispatch) => {
    dispatch({ type: FETCH_INIT });
    try {
        const res = await EventService.getAllEvents();
        dispatch({ type: FETCH_SUCCESS, payload: res.data });
    } catch (error) {
        dispatch({ type: FETCH_FAILURE });
    }
};

export const retrieveNearbyEvents = (lat, lng, radius = 50) => async (dispatch) => {
    dispatch({ type: FETCH_INIT });
    try {
        const res = await EventService.getNearbyEvents(lat, lng, radius);
        dispatch({ type: FETCH_SUCCESS, payload: res.data.events || [] });
    } catch (error) {
        dispatch({ type: FETCH_FAILURE });
    }
};

export const logout = () => (dispatch) => {
    localStorage.removeItem("user");
    dispatch({ type: LOGOUT });
};

export const checkOrganizerStatus = (token) => async (dispatch) => {
    try {
        const res = await EventService.getMyEvents(token);
        dispatch({ type: FETCH_MY_EVENTS_SUCCESS, payload: res.data });
    } catch (error) {
        if (error.response?.status === 401) {
            localStorage.removeItem("user");
            dispatch({ type: LOGOUT });
        }
    }
};

// Initial State
const user = JSON.parse(localStorage.getItem("user"));
const initialState = {
    isLoggedIn: user ? true : false,
    user: user || null,
    data: [],
    isLoading: false,
    isError: false,
    isSuccess: false,
    isKayitUpdated: false,
    isSignedUp: false,
    isDeleted: false,
    myEvents: []
};

// Reducer
const kayitReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN_INIT:
            return { ...state, isSuccess: false, isError: false, isLoading: true };
        case ADD_UPDATE_KAYIT_SUCCESS:
            return { ...state, isKayitUpdated: true, isError: false };
        case ADD_UPDATE_KAYIT_FAILURE:
            return { ...state, isError: true, isKayitUpdated: false };
        case LOGIN_SUCCESS:
            return { ...state, isLoggedIn: true, isError: false, user: action.payload, isLoading: false };
        case LOGIN_FAILURE:
            return { ...state, isError: true, isLoggedIn: false, isSignedUp: false, isLoading: false };
        case SIGNUP_SUCCESS:
            return { ...state, isSignedUp: true, isError: false };
        case SIGNUP_FAILURE:
            return { ...state, isError: true, isSignedUp: false };
        case FETCH_INIT:
            return { ...state, isLoading: true, isError: false };
        case FETCH_SUCCESS:
            return { ...state, isLoading: false, isError: false, isSuccess: true, data: action.payload };
        case FETCH_USER_SUCCESS:
            return { ...state, isLoading: false, isError: false, isSuccess: true, user: action.payload };
        case FETCH_FAILURE:
            return { ...state, isLoading: false, isError: true, isSuccess: false };
        case DELETE_KAYIT_SUCCESS:
            return { ...state, isDeleted: true, isError: false };
        case DELETE_KAYIT_FAILURE:
            return { ...state, isError: true, isDeleted: false };
        case FETCH_MY_EVENTS_SUCCESS:
            return { ...state, myEvents: action.payload };
        case LOGOUT:
            return { ...state, isLoggedIn: false, user: null, myEvents: [] };
        default:
            return state;
    }
};

export default kayitReducer;
