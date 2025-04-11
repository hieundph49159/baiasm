import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ActivityIndicator, TextInput, FlatList, Modal, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Feather, AntDesign } from '@expo/vector-icons';
import { API_CONFIG } from '../../config';
import { Picker } from '@react-native-picker/picker';

type Product = {
  id: string;
  name: string;
  image: string;
  price: string;
  quantity: number;
  lightPreference?: string; // Chỉ cho plants
};

export default function TongQuanAdmin() {
  const [activeSection, setActiveSection] = useState('products');
  const [productType, setProductType] = useState('plants'); // 'plants', 'pots', 'accessories'
  const [plants, setPlants] = useState<Product[]>([]);
  const [pots, setPots] = useState<Product[]>([]);
  const [accessories, setAccessories] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  
  // State cho tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');

  // State cho modal thêm/sửa sản phẩm
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  // State cho form thêm/sửa sản phẩm
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: '',
    image: '',
    quantity: '0',
    lightPreference: 'Ưa sáng', // Chỉ cho plants
    category: 'plants' // 'plants', 'pots', 'accessories'
  });

  
// Thêm state cho đơn hàng vào phần khai báo state
const [orders, setOrders] = useState<any[]>([]);
const [orderLoading, setOrderLoading] = useState(true);

useEffect(() => {
  fetchOrders();
}, []);

const fetchOrders = async () => {
  try {
    setOrderLoading(true);
    const response = await fetch(`${API_CONFIG.baseURL}/orders`);
    const data = await response.json();
    
    // Chuẩn hóa dữ liệu
    const normalizedData = data.map(order => ({
      ...order,
      statusForDisplay: order.status === 'Đã hoàn thành' ? 'completed' : 'pending'
    }));
    
    setOrders(normalizedData);
    setOrderLoading(false);
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu đơn hàng:', error);
    setOrderLoading(false);
  }
};

  // Gọi API để lấy dữ liệu
  useEffect(() => {
    fetchData();
  }, []);

  //tính số người dùng app 
  useEffect(() => {
    fetch(`${API_CONFIG.baseURL}/users`)
      .then((res) => res.json())
      .then((data) => setUserCount(data.length))
      .catch((err) => console.error(err));
  }, []);
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Lấy dữ liệu cây
      const plantsResponse = await fetch(`${API_CONFIG.baseURL}/plants`);
      const plantsData = await plantsResponse.json();
      setPlants(plantsData);
      
      // Lấy dữ liệu chậu
      const potsResponse = await fetch(`${API_CONFIG.baseURL}/pots`);
      const potsData = await potsResponse.json();
      setPots(potsData);
      
      // Lấy dữ liệu phụ kiện
      const accessoriesResponse = await fetch(`${API_CONFIG.baseURL}/accessories`);
      const accessoriesData = await accessoriesResponse.json();
      setAccessories(accessoriesData);
      
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      setLoading(false);
    }
  };

  // Xác định danh sách sản phẩm hiện tại dựa trên loại sản phẩm được chọn
  const getCurrentProducts = () => {
    let filteredProducts: Product[] = [];
    
    switch (productType) {
      case 'plants':
        filteredProducts = plants;
        break;
      case 'pots':
        filteredProducts = pots;
        break;
      case 'accessories':
        filteredProducts = accessories;
        break;
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchQuery) {
      return filteredProducts.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filteredProducts;
  };

  // Mở modal thêm sản phẩm mới
  const handleAddProduct = () => {
    setIsEditMode(false);
    setCurrentProduct(null);
    setFormData({
      id: '',
      name: '',
      price: '',
      image: '',
      quantity: '0',
      lightPreference: 'Ưa sáng',
      category: productType 
    });
    setModalVisible(true);
  };

  // Mở modal sửa sản phẩm
  const handleEditProduct = (product: Product) => {
    setIsEditMode(true);
    setCurrentProduct(product);
    
    const formDataWithCategory = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: product.quantity.toString(),
      lightPreference: product.lightPreference || 'Ưa sáng',
      category: productType
    };
    
    setFormData(formDataWithCategory);
    setModalVisible(true);
  };
  

  // Xử lý xóa sản phẩm
  const handleDeleteProduct = async (product: Product) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`,
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: async () => {
            try {
              // Gọi API xóa sản phẩm
              await fetch(`${API_CONFIG.baseURL}/${productType}/${product.id}`, {
                method: 'DELETE',
              });
              
              // Cập nhật lại danh sách sản phẩm
              fetchData();
              
              Alert.alert("Thành công", "Đã xóa sản phẩm thành công!");
            } catch (error) {
              console.error('Lỗi khi xóa sản phẩm:', error);
              Alert.alert("Lỗi", "Không thể xóa sản phẩm. Vui lòng thử lại sau.");
            }
          }
        }
      ]
    );
  };

  // Xử lý khi bấm nút lưu trong modal
  const handleSaveProduct = async () => {
    // Kiểm tra dữ liệu nhập vào
    if (!formData.name || !formData.price || !formData.image || !formData.quantity) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ thông tin sản phẩm.");
      return;
    }
  
    // Nếu là cây, kiểm tra thêm lightPreference
    if (formData.category === 'plants' && !formData.lightPreference) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn điều kiện ánh sáng cho cây.");
      return;
    }
  
    try {
      const endpoint = formData.category;
      const productData: any = {
        name: formData.name,
        price: formData.price,
        image: formData.image,
        quantity: parseInt(formData.quantity),
      };
  
      if (formData.category === 'plants') {
        productData.lightPreference = formData.lightPreference;
      }
  
      let url = `${API_CONFIG.baseURL}/${endpoint}`;
      let method = 'POST';
  
      if (isEditMode && currentProduct) {
        url = `${url}/${currentProduct.id}`;
        method = 'PUT';
        productData.id = currentProduct.id;
      }
  
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
  
      if (!response.ok) {
        throw new Error('Lỗi khi lưu sản phẩm');
      }
  
      fetchData();
      setModalVisible(false);
      Alert.alert(
        "Thành công",
        isEditMode ? "Sản phẩm đã được cập nhật!" : "Sản phẩm mới đã được thêm!"
      );
    } catch (error) {
      console.error('Lỗi khi lưu sản phẩm:', error);
      Alert.alert("Lỗi", "Không thể lưu sản phẩm. Vui lòng thử lại sau.");
    }
  };
  

  // Render một item trong FlatList
  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
        <Text style={styles.productStock}>Tồn kho: {item.quantity}</Text>
        {productType === 'plants' && item.lightPreference && (
          <Text style={styles.productLight}>{item.lightPreference}</Text>
        )}
      </View>
      
      {/* Nút sửa và xóa */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEditProduct(item)}
        >
          <Feather name="edit" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteProduct(item)}
        >
          <Feather name="trash-2" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Hiển thị danh sách sản phẩm với FlatList và tìm kiếm
  const renderProductList = () => {
    const currentProducts = getCurrentProducts();
    const productTypeTitle = 
      productType === 'plants' ? 'Loại Cây' : 
      productType === 'pots' ? 'Loại Chậu' : 'Phụ Kiện';
    
    return (
      <View style={styles.productSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.productSectionTitle}>{productTypeTitle}</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Feather name="search" size={18} color="#666" style={styles.searchIcon} />
          </View>
        </View>
        <Text style={styles.totalCount}>Tổng số: {currentProducts.length} sản phẩm</Text>
        
        <FlatList
          data={currentProducts}
          renderItem={renderProductItem}
          keyExtractor={item => item.id}
          style={styles.flatList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
          }
        />

        {/* Nút thêm sản phẩm */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddProduct}
        >
          <AntDesign name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  // Render nội dung cho tab sản phẩm
  const renderProductsContent = () => {
    return (
      <View style={styles.sectionContent}>
        <Text style={styles.sectionTitle}>Quản Lý Sản Phẩm</Text>
        
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={[styles.statCard, productType === 'plants' && styles.activeStatCard]} 
            onPress={() => setProductType('plants')}
          >
            <Text style={styles.statNumber}>{plants.length}</Text>
            <Text style={styles.statLabel}>Loại cây</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statCard, productType === 'pots' && styles.activeStatCard]} 
            onPress={() => setProductType('pots')}
          >
            <Text style={styles.statNumber}>{pots.length}</Text>
            <Text style={styles.statLabel}>Loại chậu</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statCard, productType === 'accessories' && styles.activeStatCard]} 
            onPress={() => setProductType('accessories')}
          >
            <Text style={styles.statNumber}>{accessories.length}</Text>
            <Text style={styles.statLabel}>Phụ kiện</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#007537" style={styles.loader} />
        ) : (
          renderProductList()
        )}
      </View>
    );
  };


  const handleUpdateOrderStatus = (orderId: string, currentStatus: string) => {
    // Nếu đã hoàn thành rồi thì không cần làm gì
    if (currentStatus === "Đã hoàn thành") {
      return;
    }
  
    // Hiển thị hộp thoại xác nhận trước khi cập nhật
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn đánh dấu đơn hàng này là 'Đã hoàn thành'?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Xác nhận",
          onPress: async () => {
            try {
              // Cập nhật trạng thái mới
              const newStatus = "Đã hoàn thành";
              
              // Gọi API để cập nhật trạng thái
              const response = await fetch(`${API_CONFIG.baseURL}/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
              });
  
              if (!response.ok) {
                throw new Error('Không thể cập nhật trạng thái đơn hàng');
              }
  
              // Cập nhật state để UI hiển thị ngay mà không cần load lại
              setOrders(orders.map(order => 
                order.id === orderId 
                  ? { ...order, status: newStatus } 
                  : order
              ));
  
              Alert.alert("Thành công", "Đã cập nhật trạng thái đơn hàng thành 'Đã hoàn thành'");
            } catch (error) {
              console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
              Alert.alert("Lỗi", "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.");
            }
          }
        }
      ]
    );
  };

  // Render nội dung cho tab đơn hàng
  const renderOrdersContent = () => {
    return (
      <View style={styles.sectionContent}>
        <Text style={styles.sectionTitle}>Quản Lý Đơn Hàng</Text>
        
        {orderLoading ? (
          <ActivityIndicator size="large" color="#007537" style={styles.loader} />
        ) : (
          <>
            <Text style={styles.totalCount}>Tổng số: {orders.length} đơn hàng</Text>
            <FlatList
              data={orders}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.orderItem}>
                  <Text style={styles.orderID}>#{item.id}</Text>
                  <Text style={styles.orderInfo}>Khách hàng: {item.customerInfo.fullName || 'Khách hàng'}</Text>
                  <Text style={styles.orderInfo}>Tổng tiền: {item.finalAmount}</Text>
                  <Text style={styles.orderInfo}>Ngày đặt: {new Date(item.orderDate).toLocaleDateString()}</Text>
                  <TouchableOpacity
                    onPress={() => handleUpdateOrderStatus(item.id, item.status)}
                    style={item.status === 'Đang xử lý' ? styles.statusPending : styles.statusCompleted}
                  >
                    <Text style={styles.statusText}>
                      {item.status}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
              }
            />
          </>
        )}
      </View>
    );
  };

  // Render nội dung cho tab thống kê
  // Cập nhật renderStatsContent để hiển thị số đơn hàng thực tế
const renderStatsContent = () => {
  return (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Thống Kê</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userCount}</Text>
          <Text style={styles.statLabel}>Người dùng</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{orders.length}</Text>
          <Text style={styles.statLabel}>Đơn hàng</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{plants.length + pots.length + accessories.length}</Text>
          <Text style={styles.statLabel}>Sản phẩm</Text>
        </View>
      </View>
    </View>
  );
};
  

  // Content for top tabs
  const renderTopTabContent = () => {
    switch (activeSection) {
      case 'products':
        return renderProductsContent();
      case 'orders':
        return renderOrdersContent();
      case 'stats':
        return renderStatsContent();
      default:
        return null;
    }
  };

  // Render Modal thêm/sửa sản phẩm
  const renderProductModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditMode ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Loại sản phẩm</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.category}
                  style={styles.picker}
                  onValueChange={(itemValue:any) => 
                    setFormData({...formData, category: itemValue})
                  }
                >
                  <Picker.Item label="Cây" value="plants" />
                  <Picker.Item label="Chậu" value="pots" />
                  <Picker.Item label="Phụ kiện" value="accessories" />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tên sản phẩm</Text>
              <TextInput
                style={styles.formInput}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                placeholder="Nhập tên sản phẩm"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Giá</Text>
              <TextInput
                style={styles.formInput}
                value={formData.price}
                onChangeText={(text) => setFormData({...formData, price: text})}
                placeholder="Ví dụ: 250.000đ"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>URL Hình ảnh</Text>
              <TextInput
                style={styles.formInput}
                value={formData.image}
                onChangeText={(text) => setFormData({...formData, image: text})}
                placeholder="Nhập URL hình ảnh"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Số lượng tồn kho</Text>
              <TextInput
                style={styles.formInput}
                value={formData.quantity}
                onChangeText={(text) => setFormData({...formData, quantity: text})}
                placeholder="Nhập số lượng"
                keyboardType="numeric"
              />
            </View>

            {formData.category === 'plants' && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ánh sáng phù hợp</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.lightPreference}
                    style={styles.picker}
                    onValueChange={(itemValue:any) => 
                      setFormData({...formData, lightPreference: itemValue})
                    }
                  >
                    <Picker.Item label="Ưa sáng" value="Ưa sáng" />
                    <Picker.Item label="Ưa bóng" value="Ưa bóng" />
                  </Picker>
                </View>
              </View>
            )}

            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveProduct}
              >
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tổng Quan</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.tabContent}>
            {/* Top Navigation */}
            <View style={styles.topTabs}>
              <TouchableOpacity
                style={[styles.topTabItem, activeSection === 'products' && styles.activeTopTab]}
                onPress={() => setActiveSection('products')}
              >
                <Feather name="box" size={20} color={activeSection === 'products' ? 'white' : '#e0e0e0'} />
                <Text style={[styles.topTabText, activeSection === 'products' && styles.activeTopTabText]}>
                  SẢN PHẨM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.topTabItem, activeSection === 'orders' && styles.activeTopTab]}
                onPress={() => setActiveSection('orders')}
              >
                <Feather name="file-text" size={20} color={activeSection === 'orders' ? 'white' : '#e0e0e0'} />
                <Text style={[styles.topTabText, activeSection === 'orders' && styles.activeTopTabText]}>
                  ĐƠN HÀNG
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.topTabItem, activeSection === 'stats' && styles.activeTopTab]}
                onPress={() => setActiveSection('stats')}
              >
                <Feather name="bar-chart-2" size={20} color={activeSection === 'stats' ? 'white' : '#e0e0e0'} />
                <Text style={[styles.topTabText, activeSection === 'stats' && styles.activeTopTabText]}>
                  THỐNG KÊ
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Tab Content */}
            {renderTopTabContent()}
            
            {/* Modal thêm/sửa sản phẩm */}
            {renderProductModal()}
          </View>
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
  tabContent: {
    flex: 1,
  },
  topTabs: {
    flexDirection: 'row',
    backgroundColor: '#007537',
    height: 50,
  },
  topTabItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTopTab: {
    borderBottomWidth: 3,
    borderBottomColor: 'white',
  },
  topTabText: {
    fontSize: 12,
    color: '#e0e0e0',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  activeTopTabText: {
    color: 'white',
  },
  sectionContent: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 16,
    color: '#333',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '30%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeStatCard: {
    borderColor: '#007537',
    borderWidth: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007537',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
 
  productSection: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007537',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
    width: '50%',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
  },
  searchIcon: {
    marginLeft: 8,
  },
  totalCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  flatList: {
    flex: 1,
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#007537',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    color: '#666',
  },
  productLight: {
    fontSize: 12,
    color: '#007537',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  loader: {
    marginTop: 30,
  },
  
  // Styles cho orders
  ordersList: {
    marginTop: 8,
  },
  orderItem: {
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
  orderID: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  orderInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusPending: {
    backgroundColor: '#ffcc00',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusCompleted: {
    backgroundColor: '#28a745',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Styles cho nút thêm, sửa, xóa
  actionButtons: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#ff7043',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 15,
    bottom:5,
    backgroundColor: '#007537',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  
  // Styles cho modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2e7d32',
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
    fontWeight: '500',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#2e7d32',
    padding: 12,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
