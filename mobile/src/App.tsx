import React from 'react';
import { enableScreens } from 'react-native-screens';
import Stack from './Stack';

enableScreens(true);
function App(): React.JSX.Element {
  return <Stack />;
}

export default App;
