import { View, Text } from 'react-native'
import { useGlobalContext } from "../../context/GlobalProvider";
import { Redirect,Stack } from 'expo-router'


const SettingLayout = () => {

  return (
    <>
      <Stack>
        <Stack.Screen
          name='profile'
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name='edit-profile'
          options={{
            headerShown: false
          }}
        />
      </Stack>
    </>
  )
}

export default SettingLayout