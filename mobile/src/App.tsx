import React from 'react';
import { enableScreens } from 'react-native-screens';
import Root from './navigation/Root';
import { AuthProvider } from './providers/AuthProvider';

enableScreens(true);
function App(): React.JSX.Element {
  return(
    <AuthProvider>
      <Root />;
    </AuthProvider>
  );
}

export default App;
