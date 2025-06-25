/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        Primary: {
          DEFAULT: '#0154F6',
          2: '#3881EF',
          3: '#5788E7',
        },
        Secondary: {
          DEFAULT: '#F6DD01',
          2: '#F1E575',
        },
        Hitam: {
          DEFAULT: '#222222',
          2: '#333333',
          3: '#555555',
          4: '#777777',
        },
        Hijau: {
          DEFAULT: '#47E1A0',
          '2': '#A9F2D3',
        },
        Merah: {
          DEFAULT: '#E14747',
          2: '#F2A9A9',
        }
      },
      fontFamily: {
        pregular: ["Poppins-Regular", "sans-serif"],
        psemibold: ["Poppins-SemiBold", "sans-serif"],
        ilight: ["Inter-Light", "sans-serif"],
        iregular: ["Inter-Regular", "sans-serif"],
        imedium: ["Inter-Medium", "sans-serif"],
        isemibold: ["Inter-SemiBold", "sans-serif"],
        ibold: ["Inter-Bold", "sans-serif"],
        iextrabold: ["Inter-ExtraBold", "sans-serif"],
      },
      backgroundColor: {
        Hijau: {
          DEFAULT: '#47E1A0',
          2: '#A9F2D3',
        },
        Merah: {
          DEFAULT: '#E14747',
          2: '#F2A9A9',
        }
      }
    },
  },
  plugins: [],
}

