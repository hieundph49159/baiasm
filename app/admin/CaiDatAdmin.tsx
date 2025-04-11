import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { router, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

export default function CaiDatAdmin() {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userId');
      router.replace('/DangNhap');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cài Đặt</Text>
        </View>
        
        <View style={styles.content}>
          <ScrollView style={styles.contentScroll}>
            <Text style={styles.sectionTitle}>Cài Đặt Hệ Thống</Text>
            <View style={styles.settingsContainer}>
              <TouchableOpacity style={styles.settingItem}>
                <Feather name="user" size={24} color="#007537" />
                <Text style={styles.settingText}>Thông tin cá nhân</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem}>
                <Feather name="lock" size={24} color="#007537" />
                <Text style={styles.settingText}>Đổi mật khẩu</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem}>
                <Feather name="bell" size={24} color="#007537" />
                <Text style={styles.settingText}>Thông báo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Feather name="log-out" size={24} color="white" />
                <Text style={styles.logoutText}>Đăng Xuất</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007537',
    padding: 16,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentScroll: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 16,
    color: '#333',
    textAlign: 'center',
    justifyContent: 'center'
  },
  settingsContainer: {
    margin: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d9534f',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 12,
  }
});