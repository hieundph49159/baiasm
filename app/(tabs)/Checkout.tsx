import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
    TextInput,
    ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../config';

interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: string;
    image: string;
    quantity: number;
    category?: 'plants' | 'pots' | 'accessories' | 'combos';
}

interface UserInfo {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
}

export default function Checkout() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // Get data passed from the Cart screen
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [shippingFee, setShippingFee] = useState(30000); // Default shipping fee
    const [isLoading, setIsLoading] = useState(true);
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [dataLoaded, setDataLoaded] = useState(false); // Add this flag to prevent infinite loops
    const baseURL = `${API_CONFIG.baseURL}`;

    // Modified useEffect to prevent infinite loops
    useEffect(() => {
        if (!dataLoaded) {
            loadData();
        }
    }, [dataLoaded]);

    const loadData = async () => {
        try {
            // Get data from params if available
            if (params.cartData && params.userData && params.totalAmount) {
                const parsedCartData = JSON.parse(params.cartData as string);
                const parsedUserData = JSON.parse(params.userData as string);
                const parsedTotalPrice = parseFloat(params.totalAmount as string);
                
                setCartItems(parsedCartData);
                setUserInfo(parsedUserData);
                setTotalPrice(parsedTotalPrice);
                setIsLoading(false);
                setDataLoaded(true); // Mark data as loaded
            } else {
                // Fallback to fetching from API if params are not available
                await fetchUserData();
                setDataLoaded(true); // Mark data as loaded
            }
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback to fetching from API if there's an error parsing params
            await fetchUserData();
            setDataLoaded(true); // Mark data as loaded
        }
    };

    const getUserId = async () => {
        return await AsyncStorage.getItem('userId');
    };

    const fetchUserData = async () => {
        try {
            const userId = await getUserId();
            if (!userId) {
                router.push('/DangNhap');
                return;
            }
            
            const response = await axios.get(`${baseURL}/users/${userId}`);
            setUserInfo({
                id: response.data.id,
                fullName: response.data.fullName,
                email: response.data.email,
                phoneNumber: response.data.phoneNumber || '',
            });
            setCartItems(response.data.cart || []);
            calculateTotalPrice(response.data.cart || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setIsLoading(false);
            Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
        }
    };

    const calculateTotalPrice = (items: CartItem[]) => {
        const total = items.reduce((sum, item) => {
            const price = parseFloat(item.price.replace(/\./g, '').replace('đ', ''));
            return sum + (price * item.quantity);
        }, 0);
        setTotalPrice(total);
    };

    const getItemType = (productId: string) => {
        // Logic to determine product type based on ID pattern
        if (productId.includes('a')) {
            return 'pot';
        } else if (productId.includes('b')) {
            return 'accessory';
        } else {
            return 'plant';
        }
    };

    const handlePlaceOrder = async () => {
        if (!address.trim()) {
            Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ giao hàng');
            return;
        }

        setIsLoading(true);
        try {
            const userId = await getUserId();
            if (!userId || !userInfo) {
                router.push('/DangNhap');
                return;
            }

            // Format prices
            const formattedTotal = `${totalPrice.toLocaleString()}đ`;
            const formattedShipping = `${shippingFee.toLocaleString()}đ`;
            const formattedFinal = `${(totalPrice + shippingFee).toLocaleString()}đ`;

            // Create order object
            const newOrder = {
                id: `ord-${Date.now()}${Math.floor(Math.random() * 1000)}`,
                userId: userId,
                customerInfo: {
                    fullName: userInfo.fullName,
                    email: userInfo.email,
                    phoneNumber: userInfo.phoneNumber,
                    address: address
                },
                items: cartItems.map(item => ({
                    ...item,
                    type: getItemType(item.productId)
                })),
                totalAmount: formattedTotal,
                shippingFee: formattedShipping,
                finalAmount: formattedFinal,
                paymentMethod: paymentMethod,
                status: "Đang xử lý",
                orderDate: new Date().toISOString()
            };

            // Add new order
            await axios.post(`${baseURL}/orders`, newOrder);

            // Clear user cart
            await axios.patch(`${baseURL}/users/${userId}`, { cart: [] });

            setIsLoading(false);
            Alert.alert(
                'Đặt hàng thành công',
                'Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.push('/(tabs)/Notifications') // Navigate to Notifications screen
                    }
                ]
            );
        } catch (error) {
            console.error('Error placing order:', error);
            setIsLoading(false);
            Alert.alert('Lỗi', 'Không thể hoàn tất đơn hàng. Vui lòng thử lại sau.');
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#28a745" />
                <Text style={styles.loadingText}>Đang tải...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thanh Toán</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollContainer}>
                {/* Customer Information Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Họ và tên:</Text>
                        <Text style={styles.infoValue}>{userInfo?.fullName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email:</Text>
                        <Text style={styles.infoValue}>{userInfo?.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Số điện thoại:</Text>
                        <Text style={styles.infoValue}>{userInfo?.phoneNumber}</Text>
                    </View>
                </View>

                {/* Shipping Address Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
                    <TextInput
                        style={styles.addressInput}
                        placeholder="Nhập địa chỉ giao hàng của bạn"
                        value={address}
                        onChangeText={setAddress}
                        multiline
                    />
                </View>

                {/* Order Summary Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
                    {cartItems.map(item => (
                        <View key={item.id} style={styles.orderItemContainer}>
                            <Image source={{ uri: item.image }} style={styles.orderItemImage} />
                            <View style={styles.orderItemDetails}>
                                <Text style={styles.orderItemName}>{item.name}</Text>
                                <Text style={styles.orderItemPrice}>{item.price} x {item.quantity}</Text>
                            </View>
                            <Text style={styles.orderItemTotal}>
                                {(parseFloat(item.price.replace(/\./g, '').replace('đ', '')) * item.quantity).toLocaleString()}đ
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Payment Method Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                    <TouchableOpacity 
                        style={[styles.paymentOption, paymentMethod === 'COD' && styles.paymentOptionSelected]} 
                        onPress={() => setPaymentMethod('COD')}
                    >
                        <Text style={paymentMethod === 'COD' ? styles.paymentTextSelected : styles.paymentText}>Thanh toán khi nhận hàng (COD)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.paymentOption, paymentMethod === 'BANKING' && styles.paymentOptionSelected]} 
                        onPress={() => setPaymentMethod('BANKING')}
                    >
                        <Text style={paymentMethod === 'BANKING' ? styles.paymentTextSelected : styles.paymentText}>Chuyển khoản ngân hàng</Text>
                    </TouchableOpacity>
                </View>

                {/* Order Total Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tạm tính:</Text>
                        <Text style={styles.totalValue}>{totalPrice.toLocaleString()}đ</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Phí vận chuyển:</Text>
                        <Text style={styles.totalValue}>{shippingFee.toLocaleString()}đ</Text>
                    </View>
                    <View style={[styles.totalRow, styles.finalTotalRow]}>
                        <Text style={styles.finalTotalLabel}>Tổng cộng:</Text>
                        <Text style={styles.finalTotalValue}>{(totalPrice + shippingFee).toLocaleString()}đ</Text>
                    </View>
                </View>

                {/* Place Order Button */}
                <TouchableOpacity
                    style={styles.placeOrderButton}
                    onPress={handlePlaceOrder}
                >
                    <Text style={styles.placeOrderButtonText}>ĐẶT HÀNG</Text>
                </TouchableOpacity>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 10,
    },
    backButtonText: {
        fontSize: 34,
        color: 'black',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollContainer: {
        flex: 1,
    },
    sectionContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    infoLabel: {
        width: 120,
        fontSize: 16,
        color: '#666',
    },
    infoValue: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    addressInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
        minHeight: 80,
    },
    orderItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderItemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    orderItemDetails: {
        flex: 1,
        paddingHorizontal: 12,
    },
    orderItemName: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    orderItemPrice: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    orderItemTotal: {
        fontSize: 16,
        fontWeight: '500',
        color: '#28a745',
    },
    paymentOption: {
        padding: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 12,
    },
    paymentOptionSelected: {
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
    },
    paymentText: {
        fontSize: 16,
        color: '#333',
    },
    paymentTextSelected: {
        fontSize: 16,
        color: '#28a745',
        fontWeight: '500',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    totalLabel: {
        fontSize: 16,
        color: '#666',
    },
    totalValue: {
        fontSize: 16,
        color: '#333',
    },
    finalTotalRow: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    finalTotalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    finalTotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#28a745',
    },
    placeOrderButton: {
        backgroundColor: '#28a745',
        padding: 16,
        margin: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    placeOrderButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});