// axiosConfig.js
import axios from 'axios';
/*import store from 'store/store.ts';*/
/*import {clearSession} from 'store/features/user/userSlice.ts';
import {navigate} from 'navigators/root.tsx';
import i18next from 'i18n/i18n.config.ts';*/
import Toast from 'react-native-toast-message';
import axiosRetry, {IAxiosRetryConfig} from 'axios-retry';
/*import format from 'utils/format';
import Config from 'react-native-config';
import {setModalLogout, setmodalLogoutMsg} from "store/features/config/alertSlice.ts";*/
import { navigate } from '../components/RootNavigator';

// const lang = i18next.language;

// export const BASE_URL = 'http://localhost:3001';
export const BASE_URL = 'http://192.168.252.27:3001';
// export const BASE_URL = 'http://127.0.0.1:3001';
// exp://30.30.17.158:8081

const config = {
    // baseURL: process.env.API_URL, // Remplacez par votre URL de base
    // baseURL: process.env.API_URLMOCK, // Remplacez par votre URL de base
    baseURL: BASE_URL, // Remplacez par votre URL de base
    timeout: 60000, // Temps d'attente en millisecondes
    headers: {
        'Content-Type': 'application/json',
        'no-encoded-request': 'true',
        'x-canal': 'mobile',
        // lang,
    },
};

const configAxiosRetry: IAxiosRetryConfig = {
    retries: 3,
    retryDelay: retryCount => {
        console.log(`Tentative de retry: ${retryCount}`);
        return retryCount * 1000; // Temps d'attente entre chaque tentative (en millisecondes)
    },
};

const api = axios.create(config);
axiosRetry(api, configAxiosRetry);

export const authApi = axios.create(config);
axiosRetry(authApi, configAxiosRetry);

// Ajouter un interceptors pour gérer les erreurs et les réponses
/*authApi.interceptors.request.use(
    config => {
        const token = store.getState().session.user?._session;
        console.warn(
            config.method,
            BASE_URL,
            config.url,
            format(new Date(), 'dd/MM/y HH:mm:ss'),
        );
        if (token && token.length > 0) {
            config.headers['x-session'] = token;
        }
        //  console.log(JSON.stringify(config, null, 2));
        return config;
    },
    error => {
        return Promise.reject(error);
    },
);
authApi.interceptors.response.use(
    response => response,
    error => {
        // Gérer les erreurs
        if (error.response) {
            if (error.response.status === 401) {
                console.error(
                    'auth error:',
                    error.response.url,
                    error.response.status,
                    'auth error 1:',
                    error.response.data.errors,
                    'auth error: 2',
                    error.response.data.message,
                );
                store.dispatch(clearSession());
                if (!store.getState().common.modalLogout && store.getState().common.modalLogoutMsg.length === 0){
                    store.dispatch(setModalLogout(true));
                    store.dispatch(setmodalLogoutMsg(error.response.data.message));
                }
            } else if (
                error.response.status === 400 ||
                error.response.status === 406 ||
                error.response.status === 412
            ) {
                console.error(
                    'Backend error:',
                    error.response.status,
                    error.response.data.errors,
                    error.response.data.message,
                );
            } else {
                /!*Toast.show({
                    type: 'errorToast',
                    props: {
                        message: 'Erreur réseau',
                    },
                });*!/
                // Le serveur a répondu avec un statut autre que 2xx
                console.error(
                    'Backend error:',
                    error.response.status,
                    error.response.data.errors,
                    error.response.data.message,
                );
            }
        } else if (error.request) {
            // La requête a été faite mais aucune réponse n'a été reçue
            console.error('No response received:', error.request);

            Toast.show({
                type: 'errorToast',
                props: {
                    message: 'Erreur réseau',
                },
            });

            navigate('Error');

            // navigate('Error');
        } else {
            // Une erreur s'est produite lors de la configuration de la requête
            console.error('Axios error:', error.message);
        }
        return Promise.reject(error);
    },
);*/

function navigateToErrorPage() {
    Toast.show({
      type: 'errorToast',
      props: {
        message: 'Erreur réseau',
      },
    });
  
    // Naviguer après une courte attente (500 ms)
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
        // console.error('No response received:', error.request);
        navigateToErrorPage();
      } else {
        console.error('Axios error:', error.message);
      }
      return Promise.reject(error);
    }
  );

export default api;
