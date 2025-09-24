import axios from 'axios';
import Toast from 'react-native-toast-message';
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';
import { navigate } from '../components/RootNavigator';

// Mettre à jour BASE_URL
export const BASE_URL = 'http://161.97.103.214:3002';

const config = {
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'no-encoded-request': 'true',
    'x-canal': 'mobile',
  },
};

const configAxiosRetry: IAxiosRetryConfig = {
  retries: 3,
  retryDelay: retryCount => {
    console.log(`Tentative de retry: ${retryCount}`);
    return retryCount * 1000;
  },
};

const api = axios.create(config);
axiosRetry(api, configAxiosRetry);

export const authApi = axios.create(config);
axiosRetry(authApi, configAxiosRetry);

function navigateToErrorPage() {
  Toast.show({
    type: 'errorToast',
    props: {
      message: 'Erreur réseau',
    },
  });

  setTimeout(() => {
    navigate('Error');
  }, 500);
}

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('Backend error:', error, error.response.data);
    } else if (error.request) {
      navigateToErrorPage();
    } else {
      console.error('Axios error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;