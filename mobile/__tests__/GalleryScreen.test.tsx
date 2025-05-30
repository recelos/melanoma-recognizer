import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import GalleryScreen from '../src/screens/GalleryScreen';
import * as apiService from '../src/services/apiService';
import { useAuth } from '../src/providers/AuthProvider';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';

// Mocks
jest.mock('../src/services/apiService');
jest.mock('../src/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({ getParent: () => ({ setOptions: jest.fn() }) }),
    useRoute: () => ({
      params: { folderId: 1 },
    }),
  };
});

// Tests
describe('GalleryScreen', () => {
  const mockUser = { uid: '123' };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    jest.clearAllMocks();
  });

  it('renders loader while fetching', async () => {
    (apiService.fetchPhotosByFolder as jest.Mock).mockResolvedValueOnce([]);

    const { getByTestId } = render(
      <NavigationContainer>
        <GalleryScreen />
      </NavigationContainer>
    );

    expect(getByTestId('ActivityIndicator')).toBeTruthy();
  });

  it('renders photos when available', async () => {
    const photos = [
      { id: 1, url: 'http://example.com/photo1.jpg', classification_result: 'benign' },
      { id: 2, url: 'http://example.com/photo2.jpg', classification_result: 'melanoma' },
    ];

    (apiService.fetchPhotosByFolder as jest.Mock).mockResolvedValueOnce(photos);

    const { findByText } = render(
      <NavigationContainer>
        <GalleryScreen />
      </NavigationContainer>
    );

    expect(await findByText('benign')).toBeTruthy();
    expect(await findByText('melanoma')).toBeTruthy();
  });

  it('renders empty text when no photos are returned', async () => {
    (apiService.fetchPhotosByFolder as jest.Mock).mockResolvedValueOnce([]);

    const { findByText } = render(
      <NavigationContainer>
        <GalleryScreen />
      </NavigationContainer>
    );

    expect(await findByText(/No photos assigned to this benign./i)).toBeTruthy();
  });

  it('shows error alert on fetch failure', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    (apiService.fetchPhotosByFolder as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));

    render(
      <NavigationContainer>
        <GalleryScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });

    alertSpy.mockRestore();
  });
});
