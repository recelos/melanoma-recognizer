import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CameraScreen from '../src/screens/CameraScreen';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';

// Mocks
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('react-native-vision-camera', () => ({
  Camera: jest.fn().mockImplementation(({ style }) => <div style={style} testID="mock-camera" />),
  useCameraDevice: jest.fn(),
  useCameraPermission: jest.fn(),
  useCameraFormat: jest.fn(() => ({})),
}));

const mockNavigate = jest.fn();
(useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });

// Tests
describe('CameraScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders permission screen when no permission', () => {
    const mockRequestPermission = jest.fn();
    require('react-native-vision-camera').useCameraPermission.mockReturnValue({
      hasPermission: false,
      requestPermission: mockRequestPermission,
    });

    const { getByText } = render(<CameraScreen />);
    expect(getByText('Requesting camera permission...')).toBeTruthy();
    expect(mockRequestPermission).toHaveBeenCalled();
  });

  it('renders error when no device', () => {
    require('react-native-vision-camera').useCameraPermission.mockReturnValue({
      hasPermission: true,
      requestPermission: jest.fn(),
    });
    require('react-native-vision-camera').useCameraDevice.mockReturnValue(undefined);

    const { getByText } = render(<CameraScreen />);
    expect(getByText('No access to camera')).toBeTruthy();
  });

  it('renders camera and button correctly', () => {
    require('react-native-vision-camera').useCameraPermission.mockReturnValue({
      hasPermission: true,
      requestPermission: jest.fn(),
    });
    require('react-native-vision-camera').useCameraDevice.mockReturnValue({ id: '1' });

    const { getByText, getByTestId } = render(<CameraScreen />);
    expect(getByText('Please focus the camera on the birthmark')).toBeTruthy();
    expect(getByText('Take Photo')).toBeTruthy();
    expect(getByTestId('mock-camera')).toBeTruthy();
  });

  it('alerts when takePicture is called and camera ref is null', async () => {
    jest.spyOn(Alert, 'alert');
    require('react-native-vision-camera').useCameraPermission.mockReturnValue({
      hasPermission: true,
      requestPermission: jest.fn(),
    });
    require('react-native-vision-camera').useCameraDevice.mockReturnValue({ id: '1' });

    const { getByText } = render(<CameraScreen />);
    fireEvent.press(getByText('Take Photo'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Camera is not available');
    });
  });

it('navigates to Result after successful photo capture', async () => {
  const mockTakePhoto = jest.fn().mockResolvedValue({ path: '/some/photo.jpg' });

  const TestCamera = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      takePhoto: mockTakePhoto,
    }));
    return <View testID="mock-camera" />;
  });

  (require('react-native-vision-camera') as any).Camera = TestCamera;

  require('react-native-vision-camera').useCameraPermission.mockReturnValue({
    hasPermission: true,
    requestPermission: jest.fn(),
  });
  require('react-native-vision-camera').useCameraDevice.mockReturnValue({ id: '1' });

  const { getByText } = render(<CameraScreen />);
  fireEvent.press(getByText('Take Photo'));

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('Result', {
      photoPath: 'file:///some/photo.jpg',
    });
  });
});
});
