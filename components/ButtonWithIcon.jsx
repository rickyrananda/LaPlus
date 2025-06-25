import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'

const ButtonWithIcon = ( {title, handlePress, containerStyles, textStyle, isLoading, icons1, iconStyle1, icons2, iconStyle2}) => {
  return (
    <TouchableOpacity 
        className={`bg-Primary min-h-[40px] rounded p-3 ${containerStyles} ${isLoading ? 'opacity-50' : ''}`}
        onPress={handlePress}
        activeOpacity={0.7}
        disabled={isLoading}
        >
        <View className="flex flex-row items-start">
          <View className="flex flex-row gap-2 items-center" >

            <Image
              source={icons1}
              className={`${iconStyle1}`}
              resizeMode='contain'
            />
            <Text className={`${textStyle}`}>{title}</Text>
          </View>
          <Image
            source={icons2}
            className={`${iconStyle2}`}
            resizeMode='contain'
          />
        </View>
    </TouchableOpacity>
  )
}

export default ButtonWithIcon