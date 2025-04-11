import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../config';
import { useFocusEffect } from '@react-navigation/native';

export default function Notifications() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const baseURL = `${API_CONFIG.baseURL}`;

  // Fetches orders from the API
  const fetchOrders = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await axios.get(`${baseURL}/orders?userId=${userId}`);
      
      // Sort orders by date (newest first)
      const sortedOrders = response.data.sort((a, b) => {
        return new Date(b.orderDate) - new Date(a.orderDate);
      });
      
      setOrders(sortedOrders);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load when component mounts
  useEffect(() => {
    fetchOrders();
    
    // Set up a refresh interval (checks for new orders every 30 seconds)
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 30000);
    
    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);
  
  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
      return () => {};
    }, [])
  );

  // Handle manual refresh when user pulls down
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Group orders by date
  const groupOrdersByDate = () => {
    const grouped = {};
    
    orders.forEach(order => {
      const date = formatDate(order.orderDate);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(order);
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  const groupedOrders = groupOrdersByDate();
  const dateKeys = Object.keys(groupedOrders);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LỊCH SỬ GIAO DỊCH</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#28a745"]}
          />
        }
      >
        {dateKeys.length > 0 ? (
          dateKeys.map(date => (
            <View key={date}>
              <Text style={styles.dateHeader}>Thứ {new Date(date.split('/').reverse().join('-')).getDay() === 0 ? 'Chủ nhật' : new Date(date.split('/').reverse().join('-')).getDay() + 1}, {date}</Text>
              
              {groupedOrders[date].map(order => (
                <View key={order.id}>
                  {order.items.map((item, index) => (
                    <View key={`${order.id}-${index}`} style={styles.orderItem}>
                      <Image source={{ uri: item.image }} style={styles.productImage} />
                      <View style={styles.orderInfo}>
                        <Text style={[styles.orderStatus, 
                          { color: order.status === 'Đã hoàn thành' ? '#28a745' : 
                                 order.status === 'Đang xử lý' ? '#ffc107' : '#dc3545' }]}>
                          {order.status === 'Đã giao' ? 'Đặt hàng thành công' : 
                           order.status === 'Đang xử lý' ? 'Đơn hàng đang xử lý' : 'Đơn hàng đã hoàn thành'}
                        </Text>
                        <Text style={styles.productName}>{item.name}</Text>
                        <Text style={styles.productQuantity}>{item.quantity} sản phẩm</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  dateHeader: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  orderItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  orderInfo: {
    marginLeft: 16,
    flex: 1,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});