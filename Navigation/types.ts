export type RootStackParamList = {
    Login: undefined;
    SignUp: undefined;
    Terms: undefined;
    ForgotPassword: undefined;
    EmailVerification: {
        userData: {
            uid: string;
            firstName: string;
            middleInitial: string;
            lastName: string;
            gender: string;
            userType: string;
            age: number;
            contactNumber: string;
            email: string;
        };
    };
    Support: undefined;
    MainTabs: undefined;
    Maps: undefined;
    Search: undefined;
    ArCam: undefined;
    Notification: undefined;
    Profile: undefined;
    ViewProfile: undefined;
    EditProfile: undefined;
    ChangePassword: undefined;
    Feedback: undefined;
    Splash: undefined;
    DeleteAccount: undefined;
    UpdateEmail: undefined;
    Map: { latitude: number; longitude: number; name: string };
};
