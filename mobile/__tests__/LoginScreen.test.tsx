import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../src/screens/LoginScreen';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/firebase/config';
import { Alert } from 'react-native';

// Mocks
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('firebase/auth', () => {
  return {
    getAuth: jest.fn(() => ({})),
    signInWithEmailAndPassword: jest.fn(),
  };
});
jest.spyOn(Alert, 'alert');

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders inputs and login button', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Log In')).toBeTruthy();
    expect(getByText("Don't have an account? Register")).toBeTruthy();
  });

  it('calls Firebase signInWithEmailAndPassword and navigates on success', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({});

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Log In'));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'test@example.com',
        'password123'
      );
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'You are now logged in!');
      expect(mockNavigate).toHaveBeenCalledWith('CameraStack');
    });
  });

  it('shows alert on login failure', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'wrong@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'badpassword');
    fireEvent.press(getByText('Log In'));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('Login failed', 'Invalid credentials');
    });
  });

  it('navigates to Register screen on press', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText("Don't have an account? Register"));

    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });
});
