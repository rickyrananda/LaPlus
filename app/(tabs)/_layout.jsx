import { View, Text, Image, TouchableOpacity } from 'react-native'
import { Tabs, Redirect } from 'expo-router'
import { icons } from '../../constants'

const TabIcon = ( { icon, color, name, focused } ) => {
  return (
    <View className="items-center justify-center gap-1">
      <Image 
        source={icon}
        resizeMode='contain'
        tintColor={color}
        className="w-6 h-6"
      />
      <Text className={`${focused ? 'font-isemibold' : 'font-iregular'} text-xs`} style={{ color: color }}>
        {name}
      </Text>
    </View>
  )
}

const OffsetTabIcon = ( { icon, color, name, focused } ) => {
  return (
    <View className="items-center justify-center">
      <View className="items-center justify-center rounded-full border-white border-4 w-[72px] h-[72px] top-[-30] bg-Primary">
        <Image 
          source={icon}
          resizeMode='contain'
          tintColor={color}
          className="w-6 h-6"
        />
      </View>
      <View>

        <Text className={`${focused ? 'font-isemibold' : 'font-iregular'} text-xs top-[-21]`} style={{ color: color }}>
          {name}
        </Text>
      </View>
    </View>
  )
}



const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#FFF',
          tabBarInactiveTintColor: '#80AAFA',
          tabBarStyle: {
            backgroundColor: '#0154F6',
            height: 74,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }
        }}
      >
        <Tabs.Screen 
          name='home'
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.home}
                color={color}
                name="Home"
                focused={focused}
              />
            )
          }}
        />

        <Tabs.Screen 
          name='dashboard'
          options={{
            title: 'Dashboard',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.dashboard}
                color={color}
                name="Dashboard"
                focused={focused}
              />
            )
          }}
        />

        <Tabs.Screen 
          name='invoice'
          options={{
            title: 'Kasir',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <OffsetTabIcon
                icon={icons.invoice}
                color={color}
                name="Kasir"
                focused={focused}
              />
            ),
        
          }}
        />
        
        <Tabs.Screen 
          name='stok-pengeluaran'
          options={{
            title: 'Stok',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.stok}
                color={color}
                name="Stok"
                focused={focused}
              />
            )
          }}
        />

        <Tabs.Screen 
          name='daftar-harga'
          options={{
            title: 'Harga',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.harga}
                color={color}
                name="Harga"
                focused={focused}
              />
            )
          }}
        />

      </Tabs>
    </>
  )
}

export default TabsLayout