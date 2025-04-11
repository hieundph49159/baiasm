import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { API_CONFIG } from '../../config';
interface User {
  id: string;
  fullName: string;
  email: string;
  isAdmin?: boolean;
}

export default function NguoiDungAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_CONFIG.baseURL}/users`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quản Lý Người Dùng</Text>
        </View>

        <View style={styles.content}>
          <ScrollView style={styles.contentScroll}>
            <Text style={styles.sectionTitle}>Danh Sách Người Dùng</Text>
            <View style={styles.usersList}>
              {loading ? (
                <ActivityIndicator size="large" color="#007537" />
              ) : (
                users.map((user) => (
                  <View key={user.id} style={styles.userItem}>
                    <Feather name="user" size={24} color="#007537" />
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{user.fullName}</Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
                    </View>
                    {user.isAdmin && (
                      <View style={styles.adminBadge}>
                        <Text style={styles.adminText}>Admin</Text>
                      </View>
                    )}
                  </View>
                ))
              )}
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
  usersList: {
    margin: 16,
  },
  userItem: {
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
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  adminBadge: {
    backgroundColor: '#007537',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  adminText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  }
});