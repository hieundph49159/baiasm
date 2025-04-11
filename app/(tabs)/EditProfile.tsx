import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { API_CONFIG } from '../../config';
type User = {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    password?: string;
    cart: any[];
};

export default function EditProfile() {
    const navigation = useNavigation();
    const route = useRoute();
    
    const { user } = route.params as { user: User };
    
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    
    // Gán dữ liệu người dùng vào các state
    useEffect(() => {
        setFullName(user.fullName);
        setEmail(user.email);
        setPhoneNumber(user.phoneNumber);
    }, [user]);
    
    const handleSave = async () => {
        try {
            // Bảo đảm trả về tất cả các trường dữ liệu cần thiết
            const updateData: Partial<User> = {
                fullName,
                email,
                phoneNumber,
                id: user.id, // Giữ lại id
                cart: user.cart || [] // Giữ lại cart hoặc khởi tạo mảng rỗng nếu không tồn tại
            };
            
            // Chỉ thêm password nếu người dùng nhập password mới
            if (password.trim()) {
                updateData.password = password;
            } else if (user.password) {
                // Giữ lại password cũ nếu không nhập password mới
                updateData.password = user.password;
            }
            
            const response = await axios.put(`${API_CONFIG.baseURL}/users/${user.id}`, updateData);
            navigation.goBack();
        } catch (error) {
            console.error('Lỗi cập nhật thông tin:', error);
        }
    };
    
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            
            <Text style={styles.header}>Chỉnh sửa thông tin</Text>
            
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Họ và tên" />
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
            <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Số điện thoại" keyboardType="numeric" />
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Mật khẩu mới (nếu muốn đổi)" secureTextEntry />
            
            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Lưu thông tin</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: 'white' },
    backButton: { position: 'absolute', top: 20, left: 20, padding: 10, marginTop: 30 },
    backButtonText: { fontSize: 24, fontWeight: 'bold' },
    header: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, marginTop: 40 },
    input: { borderBottomWidth: 1, marginBottom: 15, padding: 10 },
    button: { backgroundColor: '#28a745', padding: 15, alignItems: 'center', borderRadius: 5 },
    buttonText: { color: 'white', fontSize: 16 },
});