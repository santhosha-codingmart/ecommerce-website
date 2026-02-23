import API from './api';

export const login = async (email, password) => {
    // Backend LoginRequest DTO expects: { email, password }
    const response = await API.post('/auth/signin', { email, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
    }
    return response.data;
};

export const signup = async (formData) => {
    // Backend SignupRequest DTO expects: { fullName, email, password, confirmPassword }
    return await API.post('/auth/signup', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
    });
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
};
