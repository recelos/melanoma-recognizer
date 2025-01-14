import React from 'react';
import { enableScreens } from 'react-native-screens';
import Root from './navigation/Root';

enableScreens(true);
function App(): React.JSX.Element {
  return <Root />;
}

export default App;
