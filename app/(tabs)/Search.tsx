import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../config';
interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  lightPreference?: 'Ưa bóng' | 'Ưa sáng';
  category: 'plants' | 'pots' | 'accessories' | 'combos';
  quantity?: number;
}

const SearchScreen: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all products
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const baseURL = `${API_CONFIG.baseURL}`;
        const [plantsRes, potsRes, accessoriesRes] = await Promise.all([
          axios.get(`${baseURL}/plants`),
          axios.get(`${baseURL}/pots`),
          axios.get(`${baseURL}/accessories`),
        ]);

        const combinedProducts = [
          ...plantsRes.data.map((p: Product) => ({ ...p, category: "plants" })),
          ...potsRes.data.map((p: Product) => ({ ...p, category: "pots" })),
          ...accessoriesRes.data.map((p: Product) => ({ ...p, category: "accessories" })),
        ];

        setAllProducts(combinedProducts);
        setLoading(false);
      } catch (err: any) {
        console.error('Lỗi khi tải sản phẩm:', err.message);
        setError('Không thể tải sản phẩm. Vui lòng kiểm tra kết nối.');
        setLoading(false);
      }
    };

    fetchAllProducts();
    loadSearchHistory();
  }, []);

  // Load search history from AsyncStorage
  const loadSearchHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('searchHistory');
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory));
      }
    } catch (err) {
      console.error('Lỗi khi tải lịch sử tìm kiếm:', err);
    }
  };

  // Save search term to history
  const saveSearchToHistory = async (term: string) => {
    if (!term.trim()) return;
    
    try {
      // Add new term to the beginning and remove duplicates
      const updatedHistory = [term, ...searchHistory.filter(item => item !== term)];
      // Keep only the most recent 10 searches
      const limitedHistory = updatedHistory.slice(0, 10);
      
      setSearchHistory(limitedHistory);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(limitedHistory));
    } catch (err) {
      console.error('Lỗi khi lưu lịch sử tìm kiếm:', err);
    }
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setShowHistory(false);
    
    if (term) {
      saveSearchToHistory(term);
    }
  };

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm) {
      const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filteredProducts);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, allProducts]);

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: "/(tabs)/ProductDetail",
      params: {
        id: product.id,
        category: product.category
      }
    });
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => handleProductPress(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
        {item.quantity !== undefined && (
          <Text style={styles.quantityText}>
            Còn {item.quantity} sp
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleSearch(item)}
    >
      <Ionicons name="time-outline" size={16} color="#888" style={styles.historyIcon} />
      <Text style={styles.historyText}>{item}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            placeholder="Tìm kiếm sản phẩm"
            value={searchTerm}
            onChangeText={setSearchTerm}
            onFocus={() => setShowHistory(true)}
            onSubmitEditing={() => handleSearch(searchTerm)}
            style={styles.searchInput}
          />
          <Ionicons
            name="search"
            color="#888"
            size={20}
            style={styles.searchIcon}
          />
        </View>
      </View>

      {showHistory && searchHistory.length > 0 && !searchTerm ? (
        <FlatList
          data={searchHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item, index) => `history-${index}`}
          style={styles.historyList}
          contentContainerStyle={styles.historyListContent}
        />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderProductItem}
          keyExtractor={(item, index) => `${item.category}-${item.id}-${index}`}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            searchTerm ? (
              <View style={styles.centerContainer}>
                <Text>Không tìm thấy sản phẩm</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop:50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginRight: 24, // To center the text properly accounting for back button
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    height: 36,
  },
  searchIcon: {
    marginLeft: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: 36,
  },
  historyList: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historyListContent: {
    paddingHorizontal: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyIcon: {
    marginRight: 12,
  },
  historyText: {
    fontSize: 15,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  productItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 14,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 2,
  },
  quantityText: {
    fontSize: 12,
    color: '#666',
  },
});

export default SearchScreen;