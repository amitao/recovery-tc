import { put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';

// worker Saga: will be fired on "LOGIN" actions
function* loginUser(action) {
  try {
    // clear any existing error on the login page
    yield put({ type: 'CLEAR_LOGIN_ERROR' }); //to errorsReducer

    const config = {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    };

    // send the action.payload as the body
    // the config includes credentials which
    // allow the server session to recognize the user
    yield axios.post('api/user/login', action.payload, config);
    
    // after the user has logged in
    // get the user information from the server
    yield put({type: 'FETCH_USER'}); //to userSaga
  } catch (error) {
    console.log('Error with user login:', error);
    if (error.response.status === 401) {
      // The 401 is the error status sent from passport
      // if user isn't in the database or
      // if the username and password don't match in the database
      yield put({ type: 'LOGIN_FAILED' }); //to errorsReducer
    } else {
      // Got an error that wasn't a 401
      // Could be anything, but most common cause is the server is not started
      yield put({ type: 'LOGIN_FAILED_NO_CODE' }); //to errorsReducer
    }
  }
}// end loginUser function

// worker Saga: will be fired on "LOGOUT" actions
function* logoutUser(action) {
  try {
    const config = {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    };

    // the config includes credentials which
    // allow the server session to recognize the user
    // when the server recognizes the user session
    // it will end the session
    yield axios.post('api/user/logout', config);

    // now that the session has ended on the server
    // remove the client-side user object to let
    // the client-side code know the user is logged out
    yield put({ type: 'UNSET_USER' }); //to userReducer

  } catch (error) {
    console.log('Error with user logout:', error);
  }
}// end logoutUser function

function* loginSaga() {
  yield takeLatest('LOGIN', loginUser); //from LoginPage
  yield takeLatest('LOGOUT', logoutUser); //from Nav, SideDrawer, or UserPage
}

export default loginSaga;
