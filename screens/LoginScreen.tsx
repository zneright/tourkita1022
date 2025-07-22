import React, { useState } from 'react';
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
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Feather';
import { useUser } from '../screens/UserContext'; // ✅ import User Context

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { setUser, setIsGuest } = useUser(); // ✅ context methods

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Missing Fields', 'Please enter both email and password.');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (user.emailVerified) {
                setUser(user);       // ✅ store Firebase user
                setIsGuest(false);   // ✅ ensure it's not a guest
                navigation.reset({ index: 0, routes: [{ name: 'Maps' }] });
            } else {
                Alert.alert('Email Not Verified', 'Please verify your email before logging in.');
            }
        } catch (error: any) {
            let message = 'Login failed. Please try again.';
            if (error.code === 'auth/user-not-found') message = 'No user found with that email.';
            else if (error.code === 'auth/wrong-password') message = 'Incorrect password.';
            else if (error.code === 'auth/invalid-email') message = 'Invalid email format.';

            Alert.alert('Login Error', message);
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = () => {
        setUser(null);          // ✅ no user
        setIsGuest(true);       // ✅ mark as guest
        navigation.reset({ index: 0, routes: [{ name: 'Maps' }] }); // or 'Maps'
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                <Image
                    source={require('../assets/TourkitaLogo.jpg')}
                    resizeMode="contain"
                    style={styles.logo}
                />

                <Text style={styles.agreementText}>
                    By signing in you are agreeing to our{' '}
                    <Text style={styles.linkText} onPress={() => navigation.navigate('Terms')}>
                        Terms and Privacy Policy
                    </Text>
                </Text>

                <View style={styles.tabContainer}>
                    <Text style={styles.activeTab}>Login</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={styles.inactiveTab}>Sign Up</Text>
                    </TouchableOpacity>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Enter email"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter password"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <Icon name={showPassword ? 'eye' : 'eye-off'} size={20} color="#603F26" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotPasswordContainer}>
                    <Text style={styles.forgotPassword}>Forget password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.loginText}>{loading ? 'Logging in...' : 'Login'}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleGuestLogin}>
                    <Text style={styles.guestText}>Log in as Guest</Text>
                </TouchableOpacity>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
        paddingBottom: 190,
    },
    logo: { width: 200, height: 200 },
    agreementText: {
        color: '#6B5E5E',
        fontSize: 13,
        textAlign: 'center',
        width: width * 0.8,
    },
    linkText: { fontWeight: 'bold', color: '#603F26' },
    tabContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
    activeTab: { color: '#603F26', fontSize: 20 },
    inactiveTab: { color: '#A5A5A5', fontSize: 20, marginLeft: 26 },
    input: {
        height: 45,
        backgroundColor: '#FFFFFF',
        borderColor: '#603F26',
        borderRadius: 15,
        borderWidth: 1,
        paddingHorizontal: 15,
        width: width * 0.8,
        marginBottom: 10,
    },
    passwordContainer: {
        flexDirection: 'row',
        width: width * 0.8,
        marginBottom: 10,
        position: 'relative',
    },
    eyeIcon: { position: 'absolute', right: 10, top: 12 },
    forgotPasswordContainer: { alignSelf: 'flex-end', marginRight: 48 },
    forgotPassword: { color: '#603F26', fontSize: 10 },
    loginButton: {
        alignItems: 'center',
        backgroundColor: '#603F26',
        borderRadius: 5,
        paddingVertical: 11,
        width: width * 0.8,
        marginVertical: 10,
        elevation: 4,
    },
    loginText: { color: '#FFFFFF', fontSize: 20 },
    guestText: { color: '#603F26', fontSize: 14, marginTop: 6, marginBottom: 10 },
});
