// MyReadingLogs.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';  // Timestamp 추가

const MyReadingLogs = ({ route }) => {
  const { bookId } = route.params; // bookId를 route에서 받아옵니다.
  const [readingLogs, setReadingLogs] = useState([]);  // 독서 기록
  const [bookReport, setBookReport] = useState(null);   // 독후감
  const [loading, setLoading] = useState(true);         // 로딩 상태
  const [error, setError] = useState(null);

  // 현재 로그인된 사용자 가져오기
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    setError("로그인이 필요합니다.");
    return <Text style={styles.errorText}>로그인이 필요합니다.</Text>;
  }

  const userId = user.uid; // 로그인된 사용자의 UID

  // 독서 기록 가져오기
  const fetchReadingLogs = async () => {
    try {
      const q = query(
        collection(db, "readingLogs"),
        where("bookId", "==", bookId), // bookId로 필터링
        where("userId", "==", userId) // 현재 사용자 ID로 필터링
      );
      const querySnapshot = await getDocs(q);
      const logsList = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      // 날짜를 기준으로 내림차순 정렬
      const sortedLogs = logsList.sort((a, b) => {
        // 'date'가 문자열이나 Date 객체일 경우
        const dateA = new Date(a.date); // 문자열이거나 Date 객체일 경우
        const dateB = new Date(b.date);

        // 내림차순으로 정렬
        return dateB - dateA;
      });
      
      setReadingLogs(sortedLogs); // 정렬된 로그 상태로 설정
    } catch (error) {
      setError("독서 로그를 불러오는 데 실패했습니다.");
    }
  };

  // 독후감 가져오기
  const fetchBookReport = async () => {
    try {
      const q = query(
        collection(db, "bookReport"),  // 컬렉션 이름을 bookReport로 수정
        where("bookId", "==", bookId), // bookId로 필터링
        where("userId", "==", userId) // 현재 사용자 ID로 필터링
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const report = querySnapshot.docs[0].data(); // 첫 번째 독후감만 가져옵니다.

        // createdAt이 Timestamp이면 toDate()로 변환 후 한국 시간대로 출력
        const createdAt = report.createdAt instanceof Timestamp
        ? new Intl.DateTimeFormat('ko-KR', {
            timeZone: 'Asia/Seoul',  // 한국 시간대
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
          }).format(report.createdAt.toDate())  // 한국 시간대로 포맷
        : "알 수 없음"; // 만약 예상한 타입이 아니면 '알 수 없음'으로 표시

        setBookReport({
          review: report.review || "독후감 없음",
          createdAt: createdAt,
        });
      } else {
        setBookReport(null); // 독후감이 없을 경우 null
      }
    } catch (error) {
      setError("독후감을 불러오는 데 실패했습니다.");
    }
  };

  // 페이지 로드 시 독서 기록과 독후감 모두 가져오기
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // 로딩 시작
      await fetchReadingLogs();  // 독서 기록 가져오기
      await fetchBookReport();   // 독후감 가져오기
      setLoading(false); // 로딩 종료
    };

    fetchData();
  }, [bookId]); // bookId가 변경될 때마다 로그와 독후감 새로 조회

  if (loading) return <Text style={styles.loadingText}>로딩 중...</Text>;
  if (error) return <Text style={styles.errorText}>{error}</Text>;

  return (
    <View style={styles.container}>
      {/* 독서 기록 섹션 */}
      <FlatList
        data={readingLogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.logItem}>
            <Text style={styles.logDate}>{item.date}</Text>
            <Text style={styles.logReview}>{item.review}</Text>
          </View>
        )}
      />

      {/* 독후감 섹션 (있다면 추가) */}
      {bookReport && (
        <View style={styles.bookReportSection}>
          <Text style={styles.bookReportTitle}>독후감</Text>
          <Text style={styles.bookReportDate}>
            작성일: {bookReport.createdAt}
          </Text>
          <Text style={styles.bookReportReview}>{bookReport.review}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  logItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 3,
  },
  logDate: {
    fontSize: 16,
    color: '#333',
  },
  logReview: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  bookReportSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  bookReportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookReportDate: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  bookReportReview: {
    fontSize: 16,
    marginTop: 10,
    color: '#333',
  },
});

export default MyReadingLogs;
