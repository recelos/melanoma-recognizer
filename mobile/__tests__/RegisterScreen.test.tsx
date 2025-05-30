import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterScreen from '../src/screens/RegisterScreen'; // dopasuj ścieżkę
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { createNewUser } from '../src/services/apiService';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  createUserWithEmailAndPassword: jest.fn(),
}));

jest.mock('../src/services/apiService', () => ({
  createNewUser: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText, getByTestId } = render(<RegisterScreen />);
    expect(getByTestId('register-title')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByTestId('register-button')).toBeTruthy();
  });

  it('registers a user and navigates on success', async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: { uid: 'abc123' },
    });

    const { getByPlaceholderText, getByTestId } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByTestId('register-button'));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123');
      expect(createNewUser).toHaveBeenCalledWith('abc123', 'test@example.com');
      expect(mockNavigate).toHaveBeenCalledWith('CameraStack');
    });
  });

  it('shows alert on error', async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(new Error('Registration failed'));

    const { getByPlaceholderText, getByTestId } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'error@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), '123456');
    fireEvent.press(getByTestId('register-button'));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalled();
    });
  });
});
