import { TouchableOpacity, Text } from 'react-native'
import React from 'react'

const PrimaryButton = ({ title, handlePress, containerStyles, textStyle, isLoading }) => {
  return (
    <TouchableOpacity 
    className={`bg-Primary min-h-[40px] rounded py-2.5 items-center ${containerStyles} ${isLoading ? 'opacity-50' : ''}`}
    onPress={handlePress}
    activeOpacity={0.7}
    disabled={isLoading}
    >
      <Text className={`${textStyle}`} >{title}</Text>
    </TouchableOpacity>
  )
}

export default PrimaryButton