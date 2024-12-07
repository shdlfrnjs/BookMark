// src/api/aladinApi.js
import axios from 'axios';
import { ALADIN_API_KEY } from '@env';

const API_KEY = ALADIN_API_KEY;
const BASE_URL = 'http://www.aladin.co.kr/ttb/api/ItemSearch.aspx';

export const searchBooks = async (query) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        ttbkey: ALADIN_API_KEY,
        Query: query,
        QueryType: 'Title',
        SearchTarget: 'Book',
        MaxResults: 10,
        Output: 'js',
      },
    });
    return response.data.item || [];
  } catch (error) {
    console.error('Error fetching books:', error.message);
    return [];
  }
};