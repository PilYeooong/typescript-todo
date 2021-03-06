import { all, fork, call, takeLatest, put } from 'redux-saga/effects';
import axios from 'axios';
import {
  LOAD_MY_INFO_FAILURE,
  LOAD_MY_INFO_REQUEST,
  LOAD_MY_INFO_SUCCESS,
  LOG_IN_REQUEST,
  LOG_IN_SUCCESS,
  LOG_IN_FAILURE,
  KAKAO_LOGIN_REQUEST,
  KAKAO_LOGIN_SUCCESS,
  KAKAO_LOGIN_FAILURE,
  GOOGLE_LOGIN_REQUEST,
  GOOGLE_LOGIN_SUCCESS,
  GOOGLE_LOGIN_FAILURE,
  SIGN_UP_REQUEST,
  SIGN_UP_SUCCESS,
  SIGN_UP_FAILURE,
  LOG_OUT_SUCCESS,
  LOG_OUT_FAILURE,
  LOG_OUT_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAILURE,
  UPDATE_PROFILE_REQUEST,
} from '../actions/types';
import {
  GoogleLoginRequestAction,
  IAuthForm,
  IUpdateProfile,
  KakaoLoginRequestAction,
  LoginRequestAction,
  SignUpRequestAction,
  UpdateProfileRequestAction,
} from '../actions';
import { IUser } from 'typings/db';

function loadMyInfoAPI() {
  return axios.get('/user');
}

function* loadMyInfo() {
  try {
    const result: { data: IUser } = yield call(loadMyInfoAPI);
    yield put({
      type: LOAD_MY_INFO_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOAD_MY_INFO_FAILURE,
      error: err.response.status,
    });
  }
}

function* watchLoadMyInfo() {
  yield takeLatest(LOAD_MY_INFO_REQUEST, loadMyInfo);
}

interface ILogin {
  data: ILoginResultData;
}

interface ILoginResultData {
  user: IUser;
  token: string;
}

function loginAPI(data: IAuthForm) {
  return axios.post('/user/login', data);
}

function* login(action: LoginRequestAction) {
  try {
    const result: ILogin = yield call(loginAPI, action.data);
    localStorage.setItem('jwtToken', result.data.token);
    yield put({
      type: LOG_IN_SUCCESS,
      data: result.data.user,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOG_IN_FAILURE,
      error: err.response.data,
    });
  }
}

function* watchLogin() {
  yield takeLatest(LOG_IN_REQUEST, login);
}

function kakaoLoginAPI(data: Object) {
  return axios.post('/user/kakao', data);
}

function* kakaoLogin(action: KakaoLoginRequestAction) {
  try {
    const result: ILogin = yield call(kakaoLoginAPI, action.data);
    localStorage.setItem('jwtToken', result.data.token);
    yield put({
      type: KAKAO_LOGIN_SUCCESS,
      data: result.data.user,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: KAKAO_LOGIN_FAILURE,
      error: err.response.data,
    });
  }
}

function* watchKakaoLogin() {
  yield takeLatest(KAKAO_LOGIN_REQUEST, kakaoLogin);
}

interface IProfileObj {
  googleId: string;
  imageUrl: string;
  email: string;
  name: string;
  givenName: string;
  familyName: string;
}
function googleLoginAPI(data: { result: IProfileObj; loginKeeper: boolean }) {
  return axios.post('/user/google', data);
}

function* googleLogin(action: GoogleLoginRequestAction) {
  try {
    const result: ILogin = yield call(googleLoginAPI, {
      result: action.data.profileObj,
      loginKeeper: action.loginKeeper,
    });
    localStorage.setItem('jwtToken', result.data.token);
    yield put({
      type: GOOGLE_LOGIN_SUCCESS,
      data: result.data.user,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: GOOGLE_LOGIN_FAILURE,
      error: err.response.data,
    });
  }
}

function* watchGoogleLogin() {
  yield takeLatest(GOOGLE_LOGIN_REQUEST, googleLogin);
}

function* logout() {
  try {
    localStorage.removeItem('jwtToken');
    yield put({
      type: LOG_OUT_SUCCESS,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOG_OUT_FAILURE,
      error: '로그아웃 실패',
    });
  }
}

function* watchLogout() {
  yield takeLatest(LOG_OUT_REQUEST, logout);
}

function signUpAPI(data: IAuthForm) {
  return axios.post('/user', data);
}

function* signUp(action: SignUpRequestAction) {
  try {
    yield call(signUpAPI, action.data);
    yield put({
      type: SIGN_UP_SUCCESS,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: SIGN_UP_FAILURE,
      error: err.response.data,
    });
  }
}

function* watchSignUp() {
  yield takeLatest(SIGN_UP_REQUEST, signUp);
}

function updateProfileAPI(data: IUpdateProfile) {
  return axios.patch('/user', data, {
    headers: { Authorization: `${localStorage.getItem('jwtToken')}` },
  });
}

interface IUpdateProfileResult {
  data: IUser | undefined;
}

function* updateProfile(action: UpdateProfileRequestAction) {
  try {
    const result: IUpdateProfileResult = yield call(updateProfileAPI, action.data);
    yield put({
      type: UPDATE_PROFILE_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: UPDATE_PROFILE_FAILURE,
      error: err.response.data,
    });
  }
}

function* watchUpdateProfile() {
  yield takeLatest(UPDATE_PROFILE_REQUEST, updateProfile);
}

export default function* userSaga() {
  yield all([
    fork(watchLoadMyInfo),
    fork(watchLogin),
    fork(watchSignUp),
    fork(watchLogout),
    fork(watchUpdateProfile),
    fork(watchKakaoLogin),
    fork(watchGoogleLogin),
  ]);
}
