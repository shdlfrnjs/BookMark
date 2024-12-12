import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

const MyReadingLogs = ({ route }) => {
  const { bookId } = route.params;
  const [readingLogs, setReadingLogs] = useState([]);
  const [bookReport, setBookReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return <Text style={styles.errorText}>로그인이 필요합니다.</Text>;
  }

  const userId = user.uid;

  const fetchReadingLogs = async () => {
    try {
      const q = query(
        collection(db, "readingLogs"),
        where("bookId", "==", bookId),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      const logsList = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      const sortedLogs = logsList.sort((a, b) => new Date(b.date) - new Date(a.date));
      setReadingLogs(sortedLogs);
    } catch {
      setError("독서 로그를 불러오는 데 실패했습니다.");
    }
  };

  const fetchBookReport = async () => {
    try {
      const q = query(
        collection(db, "bookReport"),
        where("bookId", "==", bookId),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const report = querySnapshot.docs[0].data();
        const createdAt = report.createdAt instanceof Timestamp
          ? new Intl.DateTimeFormat('ko-KR', {
              timeZone: 'Asia/Seoul',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
            }).format(report.createdAt.toDate())
          : "알 수 없음";
        setBookReport({ review: report.review || "독후감 없음", createdAt });
      }
    } catch {
      setError("독후감을 불러오는 데 실패했습니다.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchReadingLogs();
      await fetchBookReport();
      setLoading(false);
    };
    fetchData();
  }, [bookId]);

  if (loading) return <Text style={styles.loadingText}>로딩 중...</Text>;
  if (error) return <Text style={styles.errorText}>{error}</Text>;

  return (
    <View style={styles.container}>
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
      {bookReport && (
        <View style={styles.bookReportSection}>
          <Text style={styles.bookReportTitle}>독후감</Text>
          <Text style={styles.bookReportDate}>작성일: {bookReport.createdAt}</Text>
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
