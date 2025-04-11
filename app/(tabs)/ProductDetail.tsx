import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Modal, Alert  } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../config';


interface Product {
    id: string;
    name: string;
    price: string;
    image: string;
    quantity?: number;
    subtitle?: string;
    lightPreference?: 'Ưa bóng' | 'Ưa sáng';
    category: 'plants' | 'pots' | 'accessories' | 'combos';
}

interface ProductDetailProps {
    onCartUpdate?: () => void;
}
export default function ProductDetail({ onCartUpdate }: ProductDetailProps) {
    const router = useRouter();
    const { id, category } = useLocalSearchParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        setQuantity(0); // Reset số lượng về 0 khi load sản phẩm mới
    }, [id, category]);

    useEffect(() => {
        if (product) {
            const price = parseFloat(product.price.replace(/\./g, '').replace('đ', ''));
            setTotalPrice(quantity * price);
        }
    }, [quantity, product]);

    useEffect(() => {
        const fetchProductDetail = async () => {
            console.log('Params received:', { id, category });

            try {
                const baseURL = `${API_CONFIG.baseURL}`;
                console.log('Full URL:', `${baseURL}/${category}/${id}`);
                const response = await axios.get(`${baseURL}/${category}/${id}`);
                console.log('Response data:', response.data);
                setProduct(response.data);
            } catch (error) {
                console.error('Chi tiết lỗi:', error);
            }
        };

        fetchProductDetail();
    }, [id, category]);

    const incrementQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decrementQuantity = () => {
        if (quantity > 0) {
            setQuantity(prev => prev - 1);
        }
    };

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                if (storedUserId) {
                    setUserId(storedUserId);
                } else {
                   
                    Alert.alert('Lỗi', 'Vui lòng đăng nhập');
                }
            } catch (error) {
                console.error('Lỗi khi lấy userId:', error);
                Alert.alert('Lỗi', 'Không thể xác định người dùng');
            }
        };

        fetchUserId();
    }, []);

    // ... (keep other existing useEffects)

    const addToCart = async () => {
        if (!product || quantity === 0) {
            Alert.alert('Lỗi', 'Vui lòng chọn số lượng sản phẩm');
            return;
        }

       
        if (!userId) {
            Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
            return;
        }
    
        try {
            const baseURL = `${API_CONFIG.baseURL}`;
    
            // Fetch current user data
            const userResponse = await axios.get(`${baseURL}/users/${userId}`);
            console.log(userResponse);
            const userData = userResponse.data;
    
            // Validate product availability
            if (product.quantity !== undefined && quantity > product.quantity) {
                Alert.alert('Lỗi', `Chỉ còn ${product.quantity} sản phẩm trong kho`);
                return;
            }
    
            // Prepare cart update
            const existingCartItemIndex = userData.cart ? 
                userData.cart.findIndex((item: any) => item.productId === product.id) 
                : -1;
    
            let updatedCart;
            const newTotalQuantity = existingCartItemIndex !== -1 
                ? userData.cart[existingCartItemIndex].quantity + quantity 
                : quantity;
    
            // Check total quantity against available stock
            if (product.quantity !== undefined && newTotalQuantity > product.quantity) {
                Alert.alert('Lỗi', `Số lượng sản phẩm vượt quá giới hạn. Chỉ còn ${product.quantity} sản phẩm.`);
                return;
            }
    
            if (existingCartItemIndex !== -1) {
                // Update existing cart item
                updatedCart = [...userData.cart];
                updatedCart[existingCartItemIndex] = {
                    ...updatedCart[existingCartItemIndex],
                    quantity: newTotalQuantity
                };
            } else {
                // Add new cart item
                const newCartItem = {
                    id: uuid.v4().toString(),
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: quantity,
                    category: product.category
                };
    
                updatedCart = userData.cart ? [...userData.cart, newCartItem] : [newCartItem];
            }
    
            // Update user's cart
            await axios.patch(`${baseURL}/users/${userId}`, {
                cart: updatedCart
            });
    
            // Optional: Update product quantity in inventory
            if (product.quantity !== undefined) {
                await axios.patch(`${baseURL}/${category}/${id}`, {
                    quantity: product.quantity - quantity
                });
            }
    
            // Trigger cart update callback
            if (onCartUpdate) {
                onCartUpdate();
            }
            
            // Show confirmation modal
            setModalVisible(true);
            
            // Reset quantity
            setQuantity(0);
            
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error);
            Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
        }
    };
    // Xử lý chuyển đến trang giỏ hàng
    const chuyenDenGioHang = () => {
        setModalVisible(false);
        router.push('/(tabs)/Cart');
    };

    // Xử lý tiếp tục mua sắm
    const tiepTucMuaSam = () => {
        setModalVisible(false);
    };

    if (!product) return <View style={styles.loadingContainer}><Text>Đang tải...</Text></View>;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/Cart')} style={styles.cartButton}>
                        <Image source={require('../../assets/images/cart-icon.png')} style={styles.cartIcon} />
                    </TouchableOpacity>
                </View>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            {/* Tiêu đề modal */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalHeaderText}>Thêm vào giỏ hàng</Text>
                            </View>
                            
                            {/* Nội dung modal */}
                            <View style={styles.modalContent}>
                                <Image 
                                    source={{ uri: product?.image }} 
                                    style={styles.modalProductImage} 
                                    resizeMode="contain"
                                />
                                <Text style={styles.modalMessage}>
                                    Bạn đã thêm {product?.name} vào giỏ hàng thành công!
                                </Text>
                            </View>
                            
                            {/* Các nút hành động */}
                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity 
                                    style={styles.modalButtonCart} 
                                    onPress={chuyenDenGioHang}
                                >
                                    <Text style={styles.modalButtonCartText}>Xem giỏ hàng</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={styles.modalButtonContinue} 
                                    onPress={tiepTucMuaSam}
                                >
                                    <Text style={styles.modalButtonContinueText}>Tiếp tục mua sắm</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: product.image }}
                        style={styles.productImage}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.detailsContainer}>
                    <View style={styles.categoryContainer}>
                      
                        {product.lightPreference && (
                            <Text style={styles.lightPreferenceText}>{product.lightPreference}</Text>
                        )}
                    </View>

                    <Text style={styles.productPrice}>{product.price}</Text>

                    <View style={styles.detailsSection}>
                        <Text style={styles.detailsSectionTitle}>Chi tiết sản phẩm</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Kích cỡ</Text>
                            <Text style={styles.detailValue}>Nhỏ</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Xuất xứ</Text>
                            <Text style={styles.detailValue}>Châu Phi</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Tình trạng</Text>
                            <Text style={styles.detailValuequantity}>{product.quantity ? `Còn ${product.quantity} sp` : 'Hết hàng'}</Text>
                        </View>
                    </View>

                    <View style={styles.quantityTotalContainer}>
                        <Text style={styles.textLabel}>Đã chọn {quantity} sản phẩm</Text>
                        <Text style={styles.textLabel}>Tạm tính</Text>
                    </View>

                    <View style={styles.quantityRow}>
                        <View style= {styles.quantityRow}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={decrementQuantity}
                        >
                            <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{quantity}</Text>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={incrementQuantity}
                        >
                            <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                        </View>
                        <View>
                        <Text style={styles.totalPriceText}>{totalPrice.toLocaleString()}đ</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                    style={[
                        styles.buyButton, 
                        { 
                            backgroundColor: quantity > 0 ? '#28a745' : '#ccc',
                            opacity: quantity > 0 ? 1 : 0.5
                        }
                    ]}
                    disabled={quantity === 0}
                    onPress={addToCart}
                >
                    <Text style={styles.buyButtonText}>CHỌN MUA</Text>
                </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        marginTop: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },

    backButton: {
        padding: 10,
    },

    backButtonText: {
        fontSize: 34,
        color: 'black',
    },

    productName: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
        paddingTop: 10,
    },

    cartButton: {
        padding: 10,
    },

    cartButtonText: {
        fontSize: 22,
        color: 'black',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    imageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    navigationArrow: {
        padding: 8,
    },
    arrowText: {
        fontSize: 20,
        color: '#333',
    },
    productImage: {
        width: '70%',
        height: 250,
        alignSelf: 'center',
        borderRadius: 16,
        
    },
    dotIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    activeDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#28a745',
        marginHorizontal: 4,
    },
    inactiveDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 4,
    },
    detailsContainer: {
        padding: 16,
    },
    categoryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 14,
        color: '#666',
    },
    lightPreferenceText: {
        fontSize: 14,
        color: '#28a745',
        backgroundColor: '#e6f3e6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    productPrice: {
        fontSize: 18,
        color: '#28a745',
        fontWeight: 'bold',
        marginBottom: 16,
    },
    detailsSection: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    detailsSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
    },
    detailValuequantity: {
        fontSize: 14,
        color: '#288a56',
        fontWeight: 'bold',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    quantityButton: {
        width: 40,
        height: 40,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    quantityButtonText: {
        fontSize: 20,
        color: '#333',
    },
    quantityText: {
        fontSize: 18,
        marginHorizontal: 16,
    },
    totalPriceText: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 10,
        
    },
    quantityTotalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    textLabel: {
        fontSize: 17,
        color: '#666',
    },
    quantityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        
    },
    buyButton: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buyButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cartIcon: {
        width: 24,
        height: 24,
        tintColor: 'black', 
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)', // Màu đen mờ
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Khung chứa modal
    modalContainer: {
        width: '85%', // Chiếm 85% chiều rộng màn hình
        backgroundColor: 'white', // Nền trắng
        borderRadius: 20, // Góc bo tròn
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000', // Hiệu ứng bóng
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5 // Độ nổi cho Android
    },

    // Tiêu đề modal
    modalHeader: {
        width: '100%',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0', // Đường phân cách nhạt
        paddingBottom: 10,
        marginBottom: 15
    },

    // Chữ tiêu đề
    modalHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#28a745' // Màu chủ đạo xanh lá
    },

    // Khung nội dung
    modalContent: {
        alignItems: 'center',
        marginBottom: 20
    },

    // Hình ảnh sản phẩm trong modal
    modalProductImage: {
        width: 120, // Tăng kích thước
        height: 120,
        borderRadius: 10, // Góc bo tròn
        marginBottom: 15
    },

    // Thông báo
    modalMessage: {
        fontSize: 16,
        textAlign: 'center',
        color: '#333',
        marginBottom: 20,
        paddingHorizontal: 10
    },

    // Khung chứa nút
    modalButtonContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    // Nút Xem giỏ hàng
    modalButtonCart: {
        flex: 1,
        backgroundColor: '#28a745', // Màu xanh lá
        padding: 12,
        borderRadius: 10,
        marginRight: 10,
        alignItems: 'center'
    },

    // Chữ nút Xem giỏ hàng
    modalButtonCartText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15
    },

    // Nút Tiếp tục mua sắm
    modalButtonContinue: {
        flex: 1,
        backgroundColor: '#f0f0f0', // Nền xám nhạt
        padding: 12,
        borderRadius: 10,
        alignItems: 'center'
    },

    // Chữ nút Tiếp tục mua sắm
    modalButtonContinueText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 15
    }
});
