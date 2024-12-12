import { ALADIN_API_KEY } from '@env';

export const searchBooks = async (query) => {
  const API_KEY = ALADIN_API_KEY; // 알라딘 API 키
  const BASE_URL = "https://www.aladin.co.kr/ttb/api/ItemSearch.aspx";

  try {
    const response = await fetch(
      `${BASE_URL}?ttbkey=${API_KEY}&Query=${encodeURIComponent(query)}&QueryType=Title&MaxResults=10&SearchTarget=Book&Output=JS&Version=20131101`
    );

    if (!response.ok) {
      throw new Error("API 호출 실패");
    }

    const data = await response.json();

    return data.item || [];
  } catch (error) {
    console.error("책 검색 중 오류 발생:", error);
    return [];
  }
};
