/* eslint-disable */
import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alert';

//type is either password or data
export const updateSettings = async (data, type) => {
  try {
    const url = type === 'password' ? 'updateMyPassword' : 'updateMe';
    const res = await axios({
      method: 'PATCH',
      url: `http://localhost:3000/api/v1/users/${url}`,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} Updated successfully!`);
      //   window.setTimeout(() => {
      //     location.assign('/me');
      //   }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
