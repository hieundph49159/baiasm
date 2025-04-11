import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router'
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import axios from 'axios';
import { API_CONFIG } from '../../config';
const { width } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  subtitle?: string;
  lightPreference?: 'Ưa bóng' | 'Ưa sáng';
  category: 'plants' | 'pots' | 'accessories' | 'combos';
}

const TrangChu: React.FC = () => {
  const router = useRouter();

  const [products, setProducts] = useState<{
    plants: Product[];
    pots: Product[];
    accessories: Product[];
    combos: Product[];
  }>({
    plants: [],
    pots: [],
    accessories: [],
    combos: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseURL = `${API_CONFIG.baseURL}`;
        const [plantsRes, potsRes, accessoriesRes, combosRes] = await Promise.all([
          axios.get(`${baseURL}/plants`),
          axios.get(`${baseURL}/pots`),
          axios.get(`${baseURL}/accessories`),
          axios.get(`${baseURL}/combos`),
        ]);

        setProducts({
          plants: plantsRes.data.map((p: Product) => ({ ...p, category: "plants" })),
          pots: potsRes.data.map((p: Product) => ({ ...p, category: "pots" })),
          accessories: accessoriesRes.data.map((p: Product) => ({ ...p, category: "accessories" })),
          combos: combosRes.data.map((p: Product) => ({ ...p, category: "combos" })),
        });

        setLoading(false);
      } catch (error: any) {
        console.error('Lỗi khi tải dữ liệu:', error.message);
        setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối hoặc thử lại sau.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderProduct = (item: Product) => (
    <TouchableOpacity
      key={item.id}
      style={styles.productCard}
      onPress={() => {
        console.log("Navigating to ProductDetail:", { id: item.id, category: item.category });

        router.push({
          pathname: "/(tabs)/ProductDetail",
          params: {
            id: item.id,
            category: item.category
          }
        });
      }}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
        />
      </View>
      <View style={styles.productDetailsContainer}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.productInfoRow}>
          <Text style={styles.productPrice}>{item.price}</Text>
          {item.lightPreference && (
            <View style={styles.lightPreferenceChip}>
              <Text style={styles.lightPreferenceText}>
                {item.lightPreference}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
       {/* Header with Title and Cart */}
       <View style={styles.appHeader}>
        <Text style={styles.headerTitle}>Planta - tóa sáng{"\n"}không gian nhà bạn</Text>
        <TouchableOpacity 
          style={styles.cartIconWrapper}
          onPress={() => {
            router.push({
              pathname: "/(tabs)/Cart"
            });
          }}
        >
          <View style={styles.cartIconBackground}>
            <Image 
              source={require('../../assets/images/cart-icon.png')} 
              style={styles.cartIcon}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Banner Section */}
      <View style={styles.bannerContainer}>
        <Image
          source={require('../../assets/images/banner.png')}
          style={styles.banner}
          resizeMode="cover"
        />
        <View style={styles.bannerTextOverlay}>
         
          <TouchableOpacity 
            style={styles.newItemsButton}
            
          >
            <Text style={styles.newItemsButtonText}>Xem hàng mới về</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Plants Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cây trồng</Text>
        
        <View style={styles.productGrid}>
          {products.plants.slice(0, 4).map(renderProduct)}
        </View>
        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={() => {
            router.push({
              pathname: "/(tabs)/AllPlants",
              params: {
                category: 'plants'
              }
            });
          }}
        >
          <Text style={styles.viewMoreText}>Xem thêm Cây trồng</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Pots Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chậu cây trồng</Text>
        <View style={styles.productGrid}>
          {products.pots.slice(0, 4).map(renderProduct)}
        </View>

        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={() => {
            router.push({
              pathname: "/(tabs)/AllPots", 
              params: {
                category: 'pots'
              }
            });
          }}
        >
          <Text style={styles.viewMoreText}>Xem thêm Chậu cây trồng</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>



      {/* Accessories Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phụ kiện</Text>
        <View style={styles.productGrid}>
          {products.accessories.slice(0, 4).map(renderProduct)}
        </View>
        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={() => {
            router.push({
              pathname: "/(tabs)/AllAccessories",
              params: {
                category: 'accessories'
              }
            });
          }}
        >
          <Text style={styles.viewMoreText}>Xem thêm Phụ kiện</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Combos Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Combo chăm sóc (mới)</Text>
        {products.combos.map((item) => (
          <View key={item.id} style={styles.comboCard}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <Text style={styles.comboName}>{item.name}</Text>
            <Text style={styles.comboDescription}>{item.subtitle}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize:28,
     color: '#333',
     
  },
  cartIconWrapper: {
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartIconBackground: {
    backgroundColor: 'white',
    borderRadius: 34,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  cartIcon: {
    width: 24,
    height: 24,
    tintColor: '#333', 
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  viewMoreText: {
    color: '#28a745',
    fontSize: 16,
  },
  
  bannerContainer: {
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: 190,
  },
  bannerTextOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 16,
    display: 'flex',
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',

  },
  productCard: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  productImageContainer: {
    backgroundColor: '#f5f5f5',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    borderRadius: 18,
  },
  productDetailsContainer: {
    padding: 8,
  },
  productInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productName: {
    fontSize: 14,
    color: '#333',
    textAlign: 'left',
  },
  productPrice: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
  lightPreferenceChip: {
    backgroundColor: '#e6f3e6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  lightPreferenceText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
  },
  comboCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  comboName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  comboDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    marginTop:"15%"
  },
  
  bannerSubtitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  newItemsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    bottom: 50,
  },
  newItemsButtonText: {
    color: '#28a745',
    fontWeight: '600',
    marginRight: 8,
    fontSize: 19,
  },
  arrow: {
    color: '#28a745',
    fontWeight: '600',
    fontSize: 24,
    bottom: 3,
  },
  
});

export default TrangChu;