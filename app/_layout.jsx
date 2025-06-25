import { SplashScreen, Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import { useEffect } from 'react';

import GlobalProvider from '../context/GlobalProvider'

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Inter-Light": require("../assets/fonts/Inter-Light.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
    "Inter-ExtraBold": require("../assets/fonts/Inter-ExtraBold.ttf"),
  });

  useEffect(() => {
    if(error) throw error;

    if(fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error])

  if(!fontsLoaded && !error) return null;

  return (
    <GlobalProvider>
      <Stack>
        <Stack.Screen name='index' options={{ headerShown: false}}/>
        <Stack.Screen name='(auth)' options={{ headerShown: false}}/>
        <Stack.Screen name='(tabs)' options={{ headerShown: false}}/>
        <Stack.Screen name='(setting)' options={{ headerShown: false}}/>
        <Stack.Screen name='createStockPengeluaran' options={{ headerShown: false}}/>
        <Stack.Screen name='createHarga' options={{ headerShown: false}}/>
        <Stack.Screen name='createInvoice' options={{ headerShown: false}}/>
        <Stack.Screen name='editInvoice' options={{ headerShown: false}}/>
        <Stack.Screen name='detailInvoice' options={{ headerShown: false}}/>
      </Stack>
    </GlobalProvider>
  )
}

export default RootLayout