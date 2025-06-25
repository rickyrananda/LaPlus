import { View, Text } from 'react-native'
import { useGlobalContext } from "../../context/GlobalProvider";
import { Redirect,Stack } from 'expo-router'


const AuthLayout = () => {
  const { loading, isLogged } = useGlobalContext();

  if (isLogged) return <Redirect href="/home" />;
  

  return (
    <>
      <Stack>
        <Stack.Screen
          name='sign-in'
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name='sign-up'
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name='create-laundry'
          options={{
            headerShown: false
          }}
        />
      </Stack>
    </>
  )
}

export default AuthLayout