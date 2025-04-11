import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    SafeAreaView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { API_CONFIG } from '../../config';
interface Product {
    id: string;
    name: string;
    price: string;
    image: string;
}

const AllAccessories: React.FC = () => {
    const router = useRouter();
    const [accessories, setAccessories] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAccessories = async () => {
            try {
                const baseURL = `${API_CONFIG.baseURL}`;
                const response = await axios.get(`${baseURL}/accessories`);

                setAccessories(response.data);
                setLoading(false);
            } catch (err: any) {
                console.error('Lỗi khi tải dữ liệu:', err.message);
                setError('Không thể tải danh sách phụ kiện. Vui lòng thử lại.');
                setLoading(false);
            }
        };

        fetchAccessories();
    }, []);

    const renderAccessoryItem = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => {
                router.push({
                    pathname: "/(tabs)/ProductDetail",
                    params: {
                        id: item.id,
                        category: 'accessories'
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
                <Text style={styles.productPrice}>{item.price}</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Đang tải...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer1}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.textHeader} > Phụ Kiện</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/Cart')} style={styles.cartButton}>
                        <Image source={require('../../assets/images/cart-icon.png')} style={styles.cartIcon} />
                    </TouchableOpacity>
            </View>

            <FlatList
                data={accessories}
                renderItem={renderAccessoryItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.productGrid}
            />
        </SafeAreaView>
    );
};

export const screenOptions = {
    tabBarStyle: { display: 'none' },
    headerShown: false,
};

export default AllAccessories;

const styles = StyleSheet.create({
  
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    headerContainer1: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 50,
    },
    textHeader:{
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
    },
    cartButton: {
        padding: 10,
    },

    cartButtonText: {
        fontSize: 22,
        color: 'black',
    },
    backButton: {
        marginRight: 16,
    },
    backButtonText: {
        fontSize: 24,
        color: '#333'
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    productGrid: {
        padding: 8,
    },
    productCard: {
        width: '48%',
        margin: 4,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImageContainer: {
        backgroundColor: '#f5f5f5',
        aspectRatio: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        borderRadius: 8,
    },
    productDetailsContainer: {
        width: '100%',
        marginTop: 8,
        alignItems: 'center',
    },
    productName: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
    },
    productPrice: {
        fontSize: 14,
        color: '#28a745',
        fontWeight: '600',
        marginTop: 4,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    cartIcon: {
        width: 24,
        height: 24,
        tintColor: 'black', 
    },
});