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
    subtitle?: string;
    lightPreference?: 'Ưa bóng' | 'Ưa sáng';
}

const AllPlants: React.FC = () => {
    const router = useRouter();
    const { category } = useLocalSearchParams();

    const [plants, setPlants] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'ưa sáng' | 'ưa bóng'>('all');

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                const baseURL = `${API_CONFIG.baseURL}`;
                const response = await axios.get(`${baseURL}/plants`);

                // Lọc cây trồng theo preferenceLight nếu được chọn
                const filteredPlants = filter === 'all'
                    ? response.data
                    : response.data.filter((plant: Product) =>
                        plant.lightPreference?.toLowerCase() === filter
                    );

                setPlants(filteredPlants);
                setLoading(false);
            } catch (err: any) {
                console.error('Lỗi khi tải dữ liệu:', err.message);
                setError('Không thể tải danh sách cây. Vui lòng thử lại.');
                setLoading(false);
            }
        };

        fetchPlants();
    }, [filter]);

    const renderPlantItem = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.plantCard}
            onPress={() => {
                router.push({
                    pathname: "/(tabs)/ProductDetail",
                    params: {
                        id: item.id,
                        category: 'plants'
                    }
                });
            }}
        >
            <View style={styles.plantImageContainer}>
                <Image
                    source={{ uri: item.image }}
                    style={styles.plantImage}
                />
            </View>
            <View style={styles.plantDetailsContainer}>
                <Text style={styles.plantName}>{item.name}</Text>
                <View style={styles.plantInfoRow}>
                    <Text style={styles.plantPrice}>{item.price}</Text>
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
            <View style={styles.headerContainer}>
                <View style={styles.headerContainer1}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.textHeader} >Cây Trồng</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/Cart')} style={styles.cartButton}>
                        <Image source={require('../../assets/images/cart-icon.png')} style={styles.cartIcon} />
                    </TouchableOpacity>
                </View>
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            filter === 'all' && styles.activeFilterButton
                        ]}
                        onPress={() => setFilter('all')}
                    >
                        <Text style={filter === 'all' ? styles.activeFilterText : styles.filterText}>
                            Tất cả
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            filter === 'ưa sáng' && styles.activeFilterButton
                        ]}
                        onPress={() => setFilter('ưa sáng')}
                    >
                        <Text style={filter === 'ưa sáng' ? styles.activeFilterText : styles.filterText}>
                            Ưa sáng
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            filter === 'ưa bóng' && styles.activeFilterButton
                        ]}
                        onPress={() => setFilter('ưa bóng')}
                    >
                        <Text style={filter === 'ưa bóng' ? styles.activeFilterText : styles.filterText}>
                            Ưa bóng
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={plants}
                renderItem={renderPlantItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.plantGrid}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    headerContainer: {
        flexDirection: 'column',
        padding: 16,
        backgroundColor: 'white',
    },
    headerContainer1: {
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
    textHeader: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
    },
    backButtonText: {
        fontSize: 34,
        color: 'black',
    },
    cartButton: {
        padding: 10,
    },

    cartButtonText: {
        fontSize: 22,
        color: 'black',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: "flex-start",
        marginTop: 10,
    },
    filterButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    activeFilterButton: {
        backgroundColor: '#28a745',
    },
    filterText: {
        color: '#666',
    },
    activeFilterText: {
        color: 'white',
    },
    plantGrid: {
        paddingHorizontal: 8,
    },
    plantCard: {
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
    plantImageContainer: {
        backgroundColor: '#f5f5f5',
        aspectRatio: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    plantImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        borderRadius: 8,
    },
    plantDetailsContainer: {
        width: '100%',
        marginTop: 8,
    },
    plantName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    plantInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    plantPrice: {
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
export const screenOptions = {
    tabBarStyle: { display: 'none' },  // Ẩn tab bar
    headerShown: false,  // Ẩn header mặc định
};
export default AllPlants;

