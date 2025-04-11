import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../config';
import axios from 'axios';

type RootStackParamList = {
  DangNhap: undefined;
  Profile: undefined;
  EditProfile: { user: User }; // Nhận ID từ route params
};

type User = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
};

export default function Profile() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Profile'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Profile'>>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;

        const response = await axios.get<User>(`${API_CONFIG.baseURL}/users/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error('Lỗi tải thông tin người dùng:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'DangNhap' }],
    });
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.Textheader}>PROFILE</Text>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: `https://ui-avatars.com/api/?name=${user.fullName.replace(' ', '+')}` }}
          style={styles.profileImage}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.fullName}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.TextItem}>Chung</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditProfile', { user })}
          style={styles.menuItem1}
        >
          <Text>Chỉnh sửa thông tin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem1}>
          <Text>Cẩm nang trồng cây</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem1}>
          <Text>Lịch sử giao dịch</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.TextItem}>Q&A</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem1}>
          <Text>Bảo mật và Điều khoản</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem1}>
          <Text>Điều khoản và điều kiện</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem1}>
          <Text>Chính sách quyền riêng tư</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuItem, styles.logoutMenuItem]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    alignContent: 'center',
    justifyContent: 'center',
  },
  Textheader: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',

  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 5,
    borderRadius: 12,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  menuContainer: {
    backgroundColor: 'white',
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItem1: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  logoutMenuItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: 'red',
    fontWeight: 'bold',
  },
  TextItem: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'gray',
  },
});
