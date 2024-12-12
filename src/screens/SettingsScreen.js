import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, StyleSheet, Alert, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { auth, db } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs } from "firebase/firestore";
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    photoURL: null,
  });
  const [books, setBooks] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [monthlyData, setMonthlyData] = useState(Array(12).fill(0));

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

      const currentYear = new Date().getFullYear().toString();
      setSelectedYear(currentYear);

    }, [])
  );

  useEffect(() => {
    const counts = Array(12).fill(0);
    books.forEach((book) => {
      const date = new Date(book.completedDate);
      if (date.getFullYear().toString() === selectedYear) {
        counts[date.getMonth()] += 1;
      }
    });
    setMonthlyData(counts);
  }, [books, selectedYear]);

  const maxBooks = Math.max(...monthlyData);

  const segments = maxBooks < 4 ? maxBooks : 4;

  let yAxisInterval = 1;

  const yAxisMin = maxBooks === 0 ? 0 : 0;
  const yAxisMax = maxBooks === 0 ? 1 : maxBooks;

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@user_info');
      await auth.signOut();
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('로그아웃 실패', '로그아웃 중 문제가 발생했습니다.');
    }
  };

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginBottom: 30,
  },
});

export default SettingsScreen;
