import { AxiosResponse } from 'axios';

import api from './axiosConfig';

export const getEleves = async () => {
    const endpoint = '/eleves';
    try {
        const res = await api.get(endpoint);
         // console.log('res.data====>', res.data);
        return res.data;
    } catch (error) {
        // console.error('API error:', endpoint, error);
        throw error;
    }
};