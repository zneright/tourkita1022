import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                <Image
                    source={{ uri: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VDRo2IU0ne/at68qzhu_expires_30_days.png' }}
                    resizeMode="contain"
                    style={styles.logo}
                />
                <Text style={styles.agreementText}>
                    By signing in you are agreeing to our{' '}
                    <Text style={styles.linkText} onPress={() => navigation.navigate('Terms')}>Terms and Privacy Policy</Text>
                </Text>

                <View style={styles.tabContainer}>
                    <Text style={styles.activeTab}>Login</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={styles.inactiveTab}>Sign Up</Text>
                    </TouchableOpacity>
                </View>

                <TextInput style={styles.input} placeholder="Enter email" keyboardType="email-address" />
                <TextInput style={styles.input} placeholder="Enter password" secureTextEntry />

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotPasswordContainer}>
                    <Text style={styles.forgotPassword}>Forget password?</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Maps')}>
                    <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
                    <Text style={styles.guestText}>Log in as Guest</Text>
                </TouchableOpacity>

                <Image
                    source={{ uri: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VDRo2IU0ne/8xg4yipa_expires_30_days.png' }}
                    resizeMode="cover"
                    style={styles.bottomImage}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20 },
    logo: { width: 200, height: 200 },
    agreementText: { color: '#6B5E5E', fontSize: 13, textAlign: 'center', width: width * 0.8 },
    linkText: { fontWeight: 'bold', color: '#603F26' },
    tabContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
    activeTab: { color: '#603F26', fontSize: 20, marginTop: 10 },
    inactiveTab: { color: '#A5A5A5', fontSize: 20, marginLeft: 26, marginTop: 10 },
    input: { height: 45, backgroundColor: '#FFFFFF', borderColor: '#603F26', borderRadius: 15, borderWidth: 1, paddingHorizontal: 15, width: width * 0.8, marginBottom: 10 },
    forgotPasswordContainer: { alignSelf: 'flex-end', marginRight: 48 },
    forgotPassword: { color: '#603F26', fontSize: 10 },
    loginButton: { alignItems: 'center', backgroundColor: '#603F26', borderRadius: 5, paddingVertical: 11, width: width * 0.8, marginVertical: 10, elevation: 4 },
    loginText: { color: '#FFFFFF', fontSize: 20 },
    guestText: { color: '#603F26', fontSize: 14, marginTop: 6, marginBottom: 10 },
    bottomImage: { width: width, height: 200, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
});
