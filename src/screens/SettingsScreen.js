import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, StyleSheet, Alert, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit'; // BarChart 사용
import { auth, db } from '../firebaseConfig'; // Firebase 설정에서 auth와 firestore 불러오기
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs } from "firebase/firestore";
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native'; // useFocusEffect를 가져옵니다.

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    photoURL: null,
  });
  const [books, setBooks] = useState([]); // 독서 데이터
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [monthlyData, setMonthlyData] = useState(Array(12).fill(0));

  // 사용자 정보 가져오기
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserInfo({
        name: user.displayName || '이름 없음',
        email: user.email,
        photoURL: user.photoURL || 'https://via.placeholder.com/100',
      });
    }
  }, []);

  // Firebase에서 books 데이터 가져오기
  useFocusEffect(
    React.useCallback(() => {
      const fetchBooks = async () => {
        try {
          const user = auth.currentUser;
          if (!user) return;

          const booksRef = collection(db, "books");
          const q = query(booksRef, where("userId", "==", user.uid), where("isCompleted", "==", true)); // 쿼리 생성
          const querySnapshot = await getDocs(q);

          const booksData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setBooks(booksData);
        } catch (error) {
          console.error("Error fetching books:", error);
        }
      };

      fetchBooks();

      // 연도를 올해로 설정
      const currentYear = new Date().getFullYear().toString();
      setSelectedYear(currentYear);

    }, []) // 빈 배열로 두면, 화면이 포커스를 받을 때마다 호출됩니다.
  );

  // 선택한 연도의 데이터로 월별 책 권수 계산
  useEffect(() => {
    const counts = Array(12).fill(0);
    books.forEach((book) => {
      const date = new Date(book.completedDate); // completedDate는 문자열 형식
      if (date.getFullYear().toString() === selectedYear) {
        counts[date.getMonth()] += 1; // 해당 월에 책 권수 카운트
      }
    });
    setMonthlyData(counts);
  }, [books, selectedYear]);

  // 최대 권수를 기준으로 세그먼트 수 결정
  const maxBooks = Math.max(...monthlyData);

  // 데이터가 4 미만일 때는 해당 데이터의 숫자만큼, 4 이상일 땐 4로 설정
  const segments = maxBooks < 4 ? maxBooks : 4;

  let yAxisInterval = 1; // yAxisInterval은 항상 1로 설정 (간격 1)

  // maxBooks가 0일 때, yAxisMin을 0으로 설정하고, maxBooks가 0일 때 yAxisMax는 1로 설정
  const yAxisMin = maxBooks === 0 ? 0 : 0; // yAxisMin을 0으로 고정
  const yAxisMax = maxBooks === 0 ? 1 : maxBooks; // maxBooks가 0일 때는 y축 최대값을 1로 설정, 그 외에는 maxBooks 그대로

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@user_info');
      await auth.signOut();
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('로그아웃 실패', '로그아웃 중 문제가 발생했습니다.');
    }
  };

  // 동적으로 연도 생성 (올해부터 5년 전까지)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i <= 5; i++) {
    years.push((currentYear - i).toString());
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image source={{ uri: userInfo.photoURL }} style={styles.profileImage} />
        <Text style={styles.name}>{userInfo.name}</Text>
        <Text style={styles.email}>{userInfo.email}</Text>
      </View>
  
      <View style={styles.separator} />
      
      {/* 월별 독서량과 셀렉트 박스를 한 줄에 배치 */}
      <View style={styles.yearAndChartContainer}>
        <Text style={styles.chartTitle}>연도별 독서 성과</Text>
        <Picker
          selectedValue={selectedYear}
          onValueChange={(itemValue) => setSelectedYear(itemValue)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          {years.map((year) => (
            <Picker.Item key={year} label={year} value={year} />
          ))}
        </Picker>
      </View>
  
      {/* 월별 독서 그래프 */}
      <View style={styles.chartContainer}>
        <BarChart
          data={{
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
            datasets: [
              {
                data: monthlyData,
              },
            ],
          }}
          width={Dimensions.get('window').width - 20}
          height={300}
          yAxisInterval={yAxisInterval}
          segments={segments}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 139, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
              paddingLeft: 10,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#ffa726',
            },
            yAxisMax: yAxisMax,
            yAxisMin: yAxisMin,
            barPercentage: 0.3,
            categoryPercentage: 0.5,
            fillShadowGradientFrom: '#00008b',
            fillShadowGradientTo: '#00008b',
            fillShadowGradientOpacity: 1,
          }}
          style={styles.chart}
        />
      </View>
  
      <Button title="로그아웃" onPress={handleLogout} style={styles.logoutButton} />
    </View>
  );  
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  profileContainer: { alignItems: 'center', marginBottom: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginTop: 25, marginBottom: 5 },
  name: { fontSize: 20, fontWeight: 'bold' },
  email: { fontSize: 16, color: '#555', marginBottom: 10 },
  picker: { height: 50, width: 120, alignSelf: 'center', marginBottom: 0, justifyContent: 'center' },
  pickerItem: {
    textAlign: 'center',
    justifyContent: 'center',
  },
  chartTitle: { fontSize: 25, fontWeight: 'bold', textAlign: 'left', marginBottom: 10 },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
  },
  chart: { marginVertical: 10, borderRadius: 16, marginBottom: 12 },
  logoutButton: { marginTop: 40 },
  yearAndChartContainer: {
    flexDirection: 'row', // 가로로 배치
    alignItems: 'center', // 세로 정렬
    justifyContent: 'space-between', // 사이 공간을 균등하게 배치
  },
  separator: {
    height: 1, // 선의 높이
    backgroundColor: '#ccc', // 선의 색상
    marginBottom: 30, // 위아래 여백
  },
});

export default SettingsScreen;
