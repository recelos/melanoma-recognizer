import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FolderListScreen from '../src/screens/FolderListScreen';
import * as apiService from '../src/services/apiService';
import { useAuth } from '../src/providers/AuthProvider';
import { NavigationContainer } from '@react-navigation/native';

// Mock modules
jest.mock('../src/services/apiService');
jest.mock('../src/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn(), getParent: () => ({ setOptions: jest.fn() }) }),
    useRoute: () => ({ params: {} }),
  };
});

describe('FolderListScreen', () => {
  const mockUser = { uid: 'user123' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
  });

  it('shows loading indicator initially', () => {
    (apiService.getFolders as jest.Mock).mockResolvedValueOnce({ data: [] });

    const { getByTestId } = render(
      <NavigationContainer>
        <FolderListScreen />
      </NavigationContainer>
    );

    expect(getByTestId('ActivityIndicator')).toBeTruthy();
  });

  it('shows error when user is not logged in', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    const { findByText } = render(
      <NavigationContainer>
        <FolderListScreen />
      </NavigationContainer>
    );

    expect(await findByText(/Log in to access benigns/i)).toBeTruthy();
  });

  it('renders list of folders on success', async () => {
    (apiService.getFolders as jest.Mock).mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Folder A' },
        { id: 2, name: 'Folder B' },
      ],
    });

    const { findByText } = render(
      <NavigationContainer>
        <FolderListScreen />
      </NavigationContainer>
    );

    expect(await findByText('Folder A')).toBeTruthy();
    expect(await findByText('Folder B')).toBeTruthy();
  });

  it('shows fallback error message if fetching fails', async () => {
    (apiService.getFolders as jest.Mock).mockRejectedValueOnce(new Error('Server error'));

    const { findByText } = render(
      <NavigationContainer>
        <FolderListScreen />
      </NavigationContainer>
    );

    expect(await findByText(/Issue during loading folders/i)).toBeTruthy();
  });

  it('shows modal and creates a new folder', async () => {
    (apiService.getFolders as jest.Mock).mockResolvedValueOnce({ data: [] });
    (apiService.createNewFolder as jest.Mock).mockResolvedValueOnce({});

    const { getByText, getByPlaceholderText, findByText } = render(
      <NavigationContainer>
        <FolderListScreen />
      </NavigationContainer>
    );

    await findByText('Create new folder');
    fireEvent.press(getByText('Create new folder'));

    const input = getByPlaceholderText('Folder name');
    fireEvent.changeText(input, 'Test Folder');

    fireEvent.press(getByText('Create'));

    await waitFor(() =>
      expect(apiService.createNewFolder).toHaveBeenCalledWith('Test Folder', mockUser.uid)
    );
  });

  it('navigates to Gallery on folder press', async () => {
    const navigateMock = jest.fn();

    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      navigate: navigateMock,
      getParent: () => ({ setOptions: jest.fn() }),
    });

    (apiService.getFolders as jest.Mock).mockResolvedValueOnce({
      data: [{ id: 42, name: 'Sample Folder' }],
    });

    const { findByText } = render(
      <NavigationContainer>
        <FolderListScreen />
      </NavigationContainer>
    );

    const folder = await findByText('Sample Folder');
    fireEvent.press(folder);

    expect(navigateMock).toHaveBeenCalledWith('Gallery', { folderId: 42 });
  });
});
