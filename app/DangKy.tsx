import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native';
import { API_CONFIG } from '../config'; 
export default function DangKy() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [fullNameFocused, setFullNameFocused] = useState(false);
  const [phoneNumberFocused, setPhoneNumberFocused] = useState(false);
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !phoneNumber || !password) {
      setLoginError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!isAgreedToTerms) {
      setLoginError('Vui lòng đồng ý với Điều khoản & Chính sách bảo mật');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLoginError('Email không hợp lệ');
      return;
    }
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setLoginError('Số điện thoại không hợp lệ');
      return;
    }

    try {
      // Kiểm tra số điện thoại đã tồn tại chưa
      const checkPhoneResponse = await fetch(`${API_CONFIG.baseURL}/users?phoneNumber=${phoneNumber}`);
      const existingUsers = await checkPhoneResponse.json();

      if (existingUsers.length > 0) {
        setLoginError('Số điện thoại đã được đăng ký');
        return;
      }

      const checkEmailResponse = await fetch(`${API_CONFIG.baseURL}/users?email=${email}`);

      const existingEmails = await checkEmailResponse.json();

      if (existingEmails.length > 0) {
        setLoginError('Email đã được đăng ký');
        return;
      }

      // Tạo người dùng mới
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        fullName,
        email,
        phoneNumber,
        password,
        cart: []
      };

      const response = await fetch(`${API_CONFIG.baseURL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        router.push('/DangNhap');
      } else {
        setLoginError('Đăng ký thất bại');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      setLoginError('Có lỗi xảy ra');
    }
  };

  const handleLogin = () => {
    router.push('/DangNhap');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/background.png')}
        style={styles.topImage}
        resizeMode="stretch"
      />

      <View style={styles.signupContainer}>
        <Text style={styles.titleText}>Đăng ký</Text>
        <Text style={styles.subtitleText}>Tạo tài khoản</Text>

        <TextInput
          placeholder="Họ tên"
          style={[
            styles.input,
            fullNameFocused && styles.inputFocused
          ]}
          value={fullName}
          onChangeText={setFullName}
          onFocus={() => setFullNameFocused(true)}
          onBlur={() => setFullNameFocused(false)}
        />

        <TextInput
          placeholder="E-mail"
          style={[
            styles.input,
            emailFocused && styles.inputFocused
          ]}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
        />

        <TextInput
          placeholder="Số điện thoại"
          style={[
            styles.input,
            phoneNumberFocused && styles.inputFocused
          ]}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          onFocus={() => setPhoneNumberFocused(true)}
          onBlur={() => setPhoneNumberFocused(false)}
        />

        <View style={styles.passwordInputContainer}>
          <TextInput
            placeholder="Mật khẩu"
            secureTextEntry={!showPassword}
            style={[
              styles.input,
              styles.passwordInput,
              passwordFocused && styles.inputFocused
            ]}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Feather
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        {loginError ? (
          <Text style={styles.errorText}>{loginError}</Text>
        ) : null}
        <View style={styles.termsContainer}>
          <TouchableWithoutFeedback onPress={() => setIsAgreedToTerms(!isAgreedToTerms)}>
            <View style={styles.checkboxContainer}>
              <View style={[
                styles.checkbox,
                isAgreedToTerms && styles.checkboxChecked
              ]}>
                {isAgreedToTerms && <View style={styles.checkboxInner} />}
              </View>
              <Text style={styles.termsText}>
                Để đăng ký tài khoản, bạn đồng ý
                <Text style={styles.termsHighlight}> Terms & Conditions</Text> and
                <Text style={styles.termsHighlight}> Privacy Policy</Text>
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={handleSignup}
        >
          <Text style={styles.signupButtonText}>Đăng ký</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Hoặc</Text>
          <View style={styles.dividerLine} />
        </View>


        <View style={styles.socialSignupContainer}>
          <Image source={require('../assets/images/google-icon.png')} style={styles.socialLogo} />
          <Image source={require('../assets/images/facebook-icon.png')} style={styles.socialLogo} />
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Tôi đã có tài khoản </Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.loginLinkText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  errorText: {
    color: 'red',
    textAlign: 'left',
    marginBottom: 10,
  },
  topImage: {
    width: '100%',
    height: '30%',
  },
  signupContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  titleText: {
    fontSize: 44,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitleText: {
    textAlign: 'center',
    color: 'black',
    marginBottom: 20,
    fontSize: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  termsContainer: {
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: 'green',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'green',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: 'white',
  },
  termsText: {
    flex: 1,
    color: 'gray',
    fontSize: 12,
  },
  termsHighlight: {
    color: 'green',
    fontWeight: 'bold',
  },
  signupButton: {
    backgroundColor: '#007537',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
    alignItems: 'center',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  signupButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: 'gray',
  },
  socialSignupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 20,
  },
  socialLogo: {
    width: 40,
    height: 40,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: 'gray',
  },
  loginLinkText: {
    color: 'green',
    fontWeight: 'bold',
  },
  inputFocused: {
    borderColor: '#009245',
    borderWidth: 2,
  },
  passwordInputContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  passwordInput: {
    paddingRight: 40, 
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
});