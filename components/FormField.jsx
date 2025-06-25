import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'

import { icons } from '../constants'
import { EyeIcon, EyeSlashIcon } from 'react-native-heroicons/solid'


const FormField = ({ title, value, placeholder, handleChangeText, otherStyles, theOtherStyles, display, ...props}) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View className={`space-y-0.5 ${otherStyles}`}>
      <Text className={`${display} text-sm text-Hitam-2 font-isemibold`}>{title}</Text>

      <View className={`border-[1px] flex-row border-Hitam-4 w-full h-10 px-4 bg-white rounded focus:border-Primary focus:border-2 items-center ${theOtherStyles} `}>
        <TextInput
          className="flex-1 text-Hitam-2 font-iregular text-base"
          value={value}
          placeholder={placeholder}
          placeholderTextColor='#777'
          onChangeText={handleChangeText}
          secureTextEntry={title === 'Password' && !showPassword}
          keyboardType={(title === 'Nominal' || title === 'Nomor Hp' || title === 'Qty') ? 'numeric' : 'default'}
        />
        {title === 'Password' &&  (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image 
              source={!showPassword ? icons.show : icons.noshow}
              className='w-5 h-5'
              resizeMethod='contain'
            />
          </TouchableOpacity>
        )}
      

      </View>
    </View>
  )
}

export default FormField