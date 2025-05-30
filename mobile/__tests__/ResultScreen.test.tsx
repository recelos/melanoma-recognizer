import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import ResultScreen from '../src/screens/ResultScreen';
import { useAuth } from '../src/providers/AuthProvider';
import * as apiService from '../src/services/apiService';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';

// Mocks
jest.mock('../src/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../src/services/apiService', () => ({
  ...jest.requireActual('../src/services/apiService'),
  uploadPhoto: jest.fn(),
  getFolders: jest.fn(),
  saveFile: jest.fn(),
  isApiResponse: jest.fn(() => true), // <--- kluczowe
}));
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({ getParent: () => ({ setOptions: jest.fn() }), pop: jest.fn() }),
    useRoute: () => ({ params: { photoPath: 'mocked/photo.jpg' } }),
  };
});

const mockUser = { uid: 'test-user' };

// Tests
describe('ResultScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
  });

  it('renders loading spinner initially', async () => {
    (apiService.uploadPhoto as jest.Mock).mockResolvedValue({ result: 'melanoma' });
    (apiService.getFolders as jest.Mock).mockResolvedValue({ data: [] });

    const { getByTestId } = render(
      <NavigationContainer>
        <ResultScreen route={{ params: { photoPath: 'mocked/photo.jpg' } }} />
      </NavigationContainer>
    );

    expect(getByTestId('ActivityIndicator')).toBeTruthy();
  });

  it('renders image and classification result', async () => {
    (apiService.uploadPhoto as jest.Mock).mockResolvedValue({ result: 'melanoma' });
    (apiService.getFolders as jest.Mock).mockResolvedValue({ data: [{ id: 1, name: 'Folder 1' }] });

    const { getByText, getByRole } = render(
      <NavigationContainer>
        <ResultScreen route={{ params: { photoPath: 'mocked/photo.jpg' } }} />
      </NavigationContainer>
    );

    await waitFor(() => getByText(/Result of the classification/i));
    expect(getByText(/Result of the classification: melanoma/i)).toBeTruthy();
    expect(getByRole('button')).toBeTruthy();
  });

  it('displays error if upload fails', async () => {
    (apiService.uploadPhoto as jest.Mock).mockRejectedValue(new Error('Upload failed'));
    (apiService.getFolders as jest.Mock).mockResolvedValue({ data: [] });

    const alertSpy = jest.spyOn(Alert, 'alert');
    render(
      <NavigationContainer>
        <ResultScreen route={{ params: { photoPath: 'mocked/photo.jpg' } }} />
      </NavigationContainer>);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error', expect.stringContaining('Unable to upload picture'));
      }
    );
  });

  it('calls saveFile when save button is pressed', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: 'user123' },
    });
    (apiService.uploadPhoto as jest.Mock).mockResolvedValue({ result: 'benign' });
    (apiService.getFolders as jest.Mock).mockResolvedValue({ data: [{ id: 1, name: 'Folder 1' }] });
    const saveMock = (apiService.saveFile as jest.Mock).mockResolvedValue({});

    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <ResultScreen route={{ params: { photoPath: 'mocked/photo.jpg' } }} />
      </NavigationContainer>
    );

    await waitFor(() => getByText(/Save picture/i));
    const button = getByTestId('save-button');
    fireEvent.press(button);
    await waitFor(() => {
      expect(saveMock).toHaveBeenCalledWith('mocked/photo.jpg', 1, 'benign');
    });
  });
});
