import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import TongQuanAdmin from './TongQuanAdmin';
import NguoiDungAdmin from './NguoiDungAdmin';
import CaiDatAdmin from './CaiDatAdmin';

export default function TrangChuAdmin() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <TongQuanAdmin />;
      case 'users':
        return <NguoiDungAdmin />;
      case 'settings':
        return <CaiDatAdmin />;
      default:
        return <TongQuanAdmin />;
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {renderContent()}
        </View>
        
        {/* Bottom Navigation */}
        <View style={styles.bottomTabs}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('dashboard')}
          >
            <Feather 
              name="grid" 
              size={24} 
              color={activeTab === 'dashboard' ? '#007537' : '#808080'} 
            />
            <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
              Tổng Quan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('users')}
          >
            <Feather 
              name="users" 
              size={24} 
              color={activeTab === 'users' ? '#007537' : '#808080'} 
            />
            <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
              Người Dùng
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('settings')}
          >
            <Feather 
              name="settings" 
              size={24} 
              color={activeTab === 'settings' ? '#007537' : '#808080'} 
            />
            <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
              Cài Đặt
            </Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  bottomTabs: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    color: '#808080',
    marginTop: 4,
  },
  activeTabText: {
    color: '#007537',
    fontWeight: 'bold',
  }
});