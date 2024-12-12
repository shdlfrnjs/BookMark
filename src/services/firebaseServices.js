import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

// 새 책 추가 함수
export const addBook = async (bookData) => {
  try {
    const bookRef = collection(db, "books");
    await addDoc(bookRef, {
      ...bookData,
      pagesRead: 0,
    });
    console.log("책이 성공적으로 추가되었습니다.");
  } catch (error) {
    console.error("책 추가 실패:", error);
  }
};

// 읽은 페이지 수 업데이트 함수
export const updatePagesRead = async (bookId, pagesRead) => {
  try {
    const bookRef = doc(db, "books", bookId);
    await updateDoc(bookRef, {
      pagesRead: pagesRead,
    });
    console.log("페이지 수 업데이트 성공!");
  } catch (error) {
    console.error("페이지 수 업데이트 실패:", error);
  }
};
