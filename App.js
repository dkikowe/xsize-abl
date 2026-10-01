import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const DESIGN_WIDTH = 414;
const DESIGN_HEIGHT = 896;
const TEST_CODE = '0000';
const AUTH_STORAGE_KEY = 'xsize_partner_authenticated';
const AUTH_ROLE_STORAGE_KEY = 'xsize_partner_role';
const CLIENT_ID_STORAGE_KEY = 'xsize_partner_client_id';
const CLIENT_PHONE_STORAGE_KEY = 'xsize_partner_client_phone';
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const LEGAL_LINKS = {
  privacy: 'https://legal-site-navy-nine.vercel.app/privacy',
  terms: 'https://legal-site-navy-nine.vercel.app/terms',
};
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://xsize-back-production.up.railway.app';
const MAX_COMPRESSED_IMAGE_MB = 2;
const brandPink = '#ec3477';
const softPink = '#f13f83';
const darkText = '#242326';
const mutedText = '#8f8f95';
const borderColor = '#dedee4';
const cities = [
  'Абай',
  'Акколь',
  'Аксай',
  'Аксу',
  'Актау',
  'Актобе',
  'Алатау',
  'Алга',
  'Алматы',
  'Алтай',
  'Арал',
  'Аркалык',
  'Арыс',
  'Астана',
  'Атбасар',
  'Атырау',
  'Аягоз',
  'Байконыр',
  'Балхаш',
  'Булаево',
  'Державинск',
  'Ерейментау',
  'Есик',
  'Есиль',
  'Жанаозен',
  'Жанатас',
  'Жаркент',
  'Жезказган',
  'Жем',
  'Жетысай',
  'Житикара',
  'Зайсан',
  'Казалинск',
  'Кандыагаш',
  'Караганды',
  'Каражал',
  'Каратау',
  'Каркаралинск',
  'Каскелен',
  'Кентау',
  'Кокшетау',
  'Конаев',
  'Костанай',
  'Косшы',
  'Кулсары',
  'Курчатов',
  'Кызылорда',
  'Ленгер',
  'Лисаковск',
  'Макинск',
  'Мамлютка',
  'Павлодар',
  'Петропавловск',
  'Приозерск',
  'Риддер',
  'Рудный',
  'Сарань',
  'Сарканд',
  'Сарыагаш',
  'Сатпаев',
  'Семей',
  'Сергеевка',
  'Серебрянск',
  'Степногорск',
  'Степняк',
  'Тайынша',
  'Талгар',
  'Талдыкорган',
  'Тараз',
  'Текели',
  'Темир',
  'Темиртау',
  'Тобыл',
  'Туркестан',
  'Уральск',
  'Усть-Каменогорск',
  'Ушарал',
  'Уштобе',
  'Форт-Шевченко',
  'Хромтау',
  'Шалкар',
  'Шар',
  'Шардара',
  'Шахтинск',
  'Шемонаиха',
  'Шу',
  'Шымкент',
  'Щучинск',
  'Экибастуз',
  'Эмба',
];

const initialForm = {
  fullName: '',
  city: '',
  birthDate: '',
  gender: '',
  phone: '',
  code: '',
  agreement: false,
  personalData: false,
  mainPhoto: null,
  extraPhotos: [null, null, null, null],
};

const initialLoginForm = {
  phone: '',
  code: '',
  agreement: false,
  personalData: false,
};

const initialMasterForm = {
  fullName: '',
  phone: '',
  city: '',
  birthDate: '',
  gender: 'male',
  experience: '',
  workFormat: '',
  about: '',
  documents: {
    id: null,
    certificates: [],
    diplomas: [],
    licenses: [],
  },
  portfolio: '',
  agreement: false,
  personalData: false,
};

const initialSalonForm = {
  salonName: '',
  ownerName: '',
  phone: '',
  agreement: false,
  personalData: false,
  website: '',
  legalName: '',
  city: '',
  address: '',
  workDays: '',
  openTime: '09:00',
  closeTime: '18:00',
  documents: {
    ownerId: null,
    licenses: [],
    certificates: [],
  },
  photos: [],
};

const homeCategories = [
  { image: require('./assets/home-categories/cosmetology.png'), label: 'Косметология' },
  { image: require('./assets/home-categories/body-correction.png'), label: 'Коррекция\nфигуры' },
  { image: require('./assets/home-categories/spa.png'), label: 'SPA' },
  { image: require('./assets/home-categories/massage.png'), label: 'Массаж' },
  { image: require('./assets/home-categories/shop.png'), label: 'Магазин' },
  { image: require('./assets/home-categories/education.png'), label: 'Обучение' },
];

const popularMasters = [
  {
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=480&q=80',
    name: 'Анна Смирнова',
    price: 'от 2 500 ₽',
    rating: '4.9',
    specialty: 'LPG массаж',
  },
  {
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=480&q=80',
    name: 'Екатерина Лебедева',
    price: 'от 3 500 ₽',
    rating: '4.8',
    specialty: 'Косметолог',
  },
  {
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=480&q=80',
    name: 'Мария Иванова',
    price: 'от 2 000 ₽',
    rating: '4.9',
    specialty: 'Массажист',
  },
];

const topSalons = [
  {
    address: 'ул. Петровка, 15',
    image: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=640&q=80',
    name: 'XSIZE Premium',
    rating: '4.9',
    tags: 'SPA • Косметология',
  },
  {
    address: 'ул. Большая Якиманка, 22',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=640&q=80',
    name: 'Body & Soul',
    rating: '4.8',
    tags: 'Массаж • Коррекция',
  },
  {
    address: 'ул. Остоженка, 7',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=640&q=80',
    name: 'Luxe Beauty',
    rating: '4.9',
    tags: 'Косметология • SPA',
  },
];

const searchSalonPhotos = [
  require('./assets/search-salons/salon-treatment-room.png'),
  require('./assets/search-salons/salon-spa-room.png'),
  require('./assets/search-salons/salon-reception.png'),
];

const searchResults = [
  {
    ...popularMasters[0],
    address: 'пр. Кабанбай Батыра, 48',
    availableNow: true,
    city: 'Астана',
    distance: '1,2 км',
    district: 'Есиль',
    kind: 'master',
    priceValue: 2500,
    photos: [searchSalonPhotos[1], searchSalonPhotos[0]],
    ratingNumber: 4.9,
    scheduleTitle: 'LPG массаж',
    serviceGroup: 'Массаж',
    slots: ['10:00', '12:30', '16:00'],
    status: 'Свободно с 10:00',
  },
  {
    ...topSalons[0],
    address: 'пр. Туран, 37',
    availableNow: true,
    city: 'Астана',
    distance: '1,5 км',
    district: 'Нура',
    kind: 'salon',
    price: 'от 1 500 ₽',
    priceValue: 1500,
    photos: [searchSalonPhotos[0], searchSalonPhotos[2]],
    ratingNumber: 4.9,
    scheduleTitle: 'SPA и уходы',
    serviceGroup: 'SPA',
    slots: ['11:00', '13:00', '15:00', '18:00'],
    specialty: topSalons[0].tags,
    status: 'Открыто до 21:00',
  },
  {
    ...popularMasters[1],
    address: 'ул. Сыганак, 16',
    availableNow: false,
    city: 'Астана',
    distance: '2,1 км',
    district: 'Алматы',
    kind: 'master',
    priceValue: 3500,
    photos: [searchSalonPhotos[2], searchSalonPhotos[1]],
    ratingNumber: 4.8,
    scheduleTitle: 'Косметология',
    serviceGroup: 'Косметология',
    slots: ['11:30', '14:00', '17:30'],
    status: 'Свободно с 11:30',
  },
  {
    ...topSalons[1],
    address: 'ул. Достык, 12',
    availableNow: false,
    city: 'Астана',
    distance: '2,8 км',
    district: 'Сарыарка',
    kind: 'salon',
    price: 'от 4 000 ₽',
    priceValue: 4000,
    photos: [searchSalonPhotos[1], searchSalonPhotos[0]],
    ratingNumber: 4.8,
    scheduleTitle: 'Коррекция фигуры',
    serviceGroup: 'Коррекция',
    slots: ['13:00', '15:00', '17:00'],
    specialty: topSalons[1].tags,
    status: 'Открыто до 22:00',
  },
  {
    ...topSalons[2],
    address: 'ул. Сарайшык, 5',
    availableNow: true,
    city: 'Астана',
    distance: '3,4 км',
    district: 'Есиль',
    kind: 'salon',
    price: 'от 2 000 ₽',
    priceValue: 2000,
    photos: [searchSalonPhotos[2], searchSalonPhotos[0]],
    ratingNumber: 4.9,
    scheduleTitle: 'Уход за лицом',
    serviceGroup: 'Косметология',
    slots: ['10:15', '12:00', '16:30'],
    specialty: topSalons[2].tags,
    status: 'Свободно сегодня',
  },
];

const defaultSearchFilters = {
  availableNow: false,
  city: 'Астана',
  district: 'Все районы',
  price: 'Цена',
  rating: 'Рейтинг',
  service: 'Все услуги',
};

const searchFilterOptions = {
  city: ['Астана', 'Алматы', 'Шымкент', 'Актау', 'Актобе', 'Караганда'],
  district: ['Все районы', 'Есиль', 'Нура', 'Алматы', 'Сарыарка'],
  price: ['до 2 000 ₽', 'до 3 000 ₽', 'до 5 000 ₽'],
  rating: ['4.8+', '4.9+'],
  service: ['Все услуги', 'Косметология', 'SPA', 'Массаж', 'Коррекция'],
};

const searchFilterTitles = {
  city: 'Город',
  district: 'Район',
  price: 'Цена',
  rating: 'Рейтинг',
  service: 'Услуга',
};

function matchesSearchFilters(item, filters) {
  const priceLimit = {
    'до 2 000 ₽': 2000,
    'до 3 000 ₽': 3000,
    'до 5 000 ₽': 5000,
  }[filters.price];
  const ratingLimit = {
    '4.8+': 4.8,
    '4.9+': 4.9,
  }[filters.rating];

  if (filters.city && item.city !== filters.city) return false;
  if (filters.district !== 'Все районы' && item.district !== filters.district) return false;
  if (filters.service !== 'Все услуги' && item.serviceGroup !== filters.service) return false;
  if (priceLimit && item.priceValue > priceLimit) return false;
  if (ratingLimit && item.ratingNumber < ratingLimit) return false;
  if (filters.availableNow && !item.availableNow) return false;

  return true;
}

function mediaSource(image) {
  return typeof image === 'string' ? { uri: image } : image;
}

const clientAppointments = [
  {
    date: '28 августа',
    day: 'пятница',
    duration: '60 мин',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=420&q=80',
    master: 'Анна Смирнова',
    place: 'XSIZE Premium',
    price: '12 000 ₸',
    service: 'Чистка лица',
    status: 'Подтверждено',
    statusTone: 'green',
    time: '11:00',
  },
  {
    date: '30 августа',
    day: 'воскресенье',
    duration: '90 мин',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=420&q=80',
    master: 'Екатерина Лебедева',
    place: 'Body & Soul',
    price: '18 500 ₸',
    service: 'LPG массаж',
    status: 'Ожидает',
    statusTone: 'pink',
    time: '15:30',
  },
  {
    date: '2 сентября',
    day: 'среда',
    duration: '45 мин',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=420&q=80',
    master: 'Мария Иванова',
    place: 'Luxe Beauty',
    price: '9 000 ₸',
    service: 'SPA уход',
    status: 'Предоплата',
    statusTone: 'gold',
    time: '10:15',
  },
];

const astanaMapRegion = {
  latitude: 51.1282,
  latitudeDelta: 0.085,
  longitude: 71.4304,
  longitudeDelta: 0.085,
};

const astanaMapPoints = [
  {
    availableNow: true,
    city: 'Астана',
    coordinate: { latitude: 51.1281, longitude: 71.4305 },
    district: 'Нура',
    item: topSalons[0],
    label: 'XSIZE Premium',
    priceValue: 1500,
    ratingNumber: 4.9,
    serviceGroup: 'SPA',
    type: 'salon',
  },
  {
    availableNow: true,
    city: 'Астана',
    coordinate: { latitude: 51.1218, longitude: 71.4712 },
    district: 'Есиль',
    item: popularMasters[0],
    label: 'Анна Смирнова',
    priceValue: 2500,
    ratingNumber: 4.9,
    serviceGroup: 'Массаж',
    type: 'master',
  },
  {
    availableNow: false,
    city: 'Астана',
    coordinate: { latitude: 51.0924, longitude: 71.4182 },
    district: 'Сарыарка',
    item: topSalons[1],
    label: 'Body & Soul',
    priceValue: 4000,
    ratingNumber: 4.8,
    serviceGroup: 'Коррекция',
    type: 'salon',
  },
  {
    availableNow: false,
    city: 'Астана',
    coordinate: { latitude: 51.1455, longitude: 71.4017 },
    district: 'Алматы',
    item: popularMasters[1],
    label: 'Екатерина',
    priceValue: 3500,
    ratingNumber: 4.8,
    serviceGroup: 'Косметология',
    type: 'master',
  },
  {
    availableNow: true,
    city: 'Астана',
    coordinate: { latitude: 51.1113, longitude: 71.4479 },
    district: 'Есиль',
    item: topSalons[2],
    label: 'Luxe Beauty',
    priceValue: 2000,
    ratingNumber: 4.9,
    serviceGroup: 'Косметология',
    type: 'salon',
  },
];

function buildGoogleMapHtml(points) {
  const markers = points.map(({ coordinate, label, type }) => ({
    label,
    lat: coordinate.latitude,
    lng: coordinate.longitude,
    type,
  }));

  return `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width" />
    <style>
      html, body, #map {
        height: 100%;
        margin: 0;
        overflow: hidden;
        width: 100%;
      }
      .gm-style-cc,
      .gmnoprint,
      a[href^="https://maps.google.com/maps"] {
        display: none !important;
      }
    </style>
    <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&language=ru&region=KZ"></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      const markerData = ${JSON.stringify(markers)};
      const brandPink = '${brandPink}';
      const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: ${astanaMapRegion.latitude}, lng: ${astanaMapRegion.longitude} },
        clickableIcons: false,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        mapTypeControl: false,
        streetViewControl: false,
        styles: [
          { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
          { featureType: 'poi.medical', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e9f2f7' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
          { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f7f4f5' }] }
        ],
        zoom: 12,
      });

      markerData.forEach((point) => {
        const marker = new google.maps.Marker({
          icon: {
            fillColor: brandPink,
            fillOpacity: 1,
            path: google.maps.SymbolPath.CIRCLE,
            scale: 11,
            strokeColor: '#ffffff',
            strokeWeight: 4,
          },
          map,
          position: { lat: point.lat, lng: point.lng },
          title: point.label,
        });

        marker.addListener('click', () => {
          window.ReactNativeWebView?.postMessage(JSON.stringify({ label: point.label }));
        });
      });
    </script>
  </body>
</html>`;
}

const heroSlides = [
  {
    background: '#fde3ea',
    image: require('./assets/home-banners/hero-body-care.png'),
    subtitle: 'Скидки до 30% на коррекцию фигуры',
    title: 'Тело к лету',
  },
  {
    background: '#fff0f4',
    image: require('./assets/home-banners/hero-spa.png'),
    subtitle: 'Услуги и мастера рядом с вами',
    title: 'Красота рядом',
  },
  {
    background: '#f7e8ee',
    image: require('./assets/home-banners/hero-products.png'),
    subtitle: 'Массаж, уходы и релакс в салонах',
    title: 'SPA-день',
  },
];

export default function App() {
  const { width, height } = useWindowDimensions();
  const scaleX = width / DESIGN_WIDTH;
  const scaleY = height / DESIGN_HEIGHT;
  const scale = Math.min(scaleX, scaleY);
  const styles = makeStyles(scale, scaleY);
  const [screen, setScreen] = useState('loading');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [masterStep, setMasterStep] = useState(1);
  const [masterForm, setMasterForm] = useState(initialMasterForm);
  const [salonStep, setSalonStep] = useState(1);
  const [salonForm, setSalonForm] = useState(initialSalonForm);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [navigationStack, setNavigationStack] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('client');
  const [authOriginScreen, setAuthOriginScreen] = useState('home');
  const [authRedirectScreen, setAuthRedirectScreen] = useState('profile');
  const [clientSubmitting, setClientSubmitting] = useState(false);
  const [masterSubmitting, setMasterSubmitting] = useState(false);
  const [salonSubmitting, setSalonSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const [authenticated, storedRole] = await Promise.all([
          AsyncStorage.getItem(AUTH_STORAGE_KEY),
          AsyncStorage.getItem(AUTH_ROLE_STORAGE_KEY),
        ]);
        if (!mounted) return;
        setIsAuthenticated(authenticated === 'true');
        setUserRole(storedRole || 'client');
        setScreen('home');
      } catch (_error) {
        if (mounted) setScreen('home');
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const rememberAuthenticatedUser = async (profile = {}) => {
    const role = profile.role || 'client';
    await AsyncStorage.multiSet([
      [AUTH_STORAGE_KEY, 'true'],
      [AUTH_ROLE_STORAGE_KEY, role],
    ]);
    setIsAuthenticated(true);
    setUserRole(role);
    if (profile.id) {
      await AsyncStorage.setItem(CLIENT_ID_STORAGE_KEY, profile.id);
    } else if (profile.phone) {
      await AsyncStorage.removeItem(CLIENT_ID_STORAGE_KEY);
    }
    if (profile.phone) {
      await AsyncStorage.setItem(CLIENT_PHONE_STORAGE_KEY, profile.phone);
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([
      AUTH_STORAGE_KEY,
      AUTH_ROLE_STORAGE_KEY,
      CLIENT_ID_STORAGE_KEY,
      CLIENT_PHONE_STORAGE_KEY,
    ]);
    setIsAuthenticated(false);
    setUserRole('client');
    setNavigationStack([]);
    setSelectedProfile(null);
    setLoginForm(initialLoginForm);
    setScreen('profile');
  };

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateLoginForm = (key, value) => {
    setLoginForm((current) => ({ ...current, [key]: value }));
  };

  const updateMasterForm = (key, value) => {
    setMasterForm((current) => ({ ...current, [key]: value }));
  };

  const updateSalonForm = (key, value) => {
    setSalonForm((current) => ({ ...current, [key]: value }));
  };

  const openDetailScreen = (nextScreen, item) => {
    setNavigationStack((current) => [...current, { screen, selectedProfile }]);
    setSelectedProfile(item);
    setScreen(nextScreen);
  };

  const openLegalDocument = async (type) => {
    const url = LEGAL_LINKS[type] || LEGAL_LINKS.privacy;
    try {
      await Linking.openURL(url);
    } catch (_error) {
      Alert.alert('Ссылка недоступна', 'Не удалось открыть документ. Попробуйте позже.');
    }
  };

  const openProfileSettings = () => {
    setNavigationStack((current) => [...current, { screen, selectedProfile }]);
    setScreen('profile-settings');
  };

  const switchMainScreen = (nextScreen) => {
    setNavigationStack([]);
    setSelectedProfile(null);
    setScreen(nextScreen);
  };

  const requireClientAuth = (nextScreen = 'profile') => {
    if (isAuthenticated && userRole === 'client') {
      switchMainScreen(nextScreen);
      return true;
    }
    if (isAuthenticated) {
      Alert.alert('Клиентская функция', 'Для записи на услугу нужен аккаунт клиента.');
      return false;
    }
    setAuthOriginScreen(screen === 'loading' ? 'home' : screen);
    setAuthRedirectScreen(nextScreen);
    setLoginForm(initialLoginForm);
    setScreen('login-phone');
    return false;
  };

  const handleTabNavigation = (tab) => {
    if (tab === 'Главная') switchMainScreen('home');
    if (tab === 'Поиск') switchMainScreen('search');
    if (tab === 'Записи') {
      if (isAuthenticated && userRole !== 'client') switchMainScreen('partner-appointments');
      else requireClientAuth('appointments');
    }
    if (tab === 'Профиль') switchMainScreen('profile');
    if (tab === 'Сообщество') {
      Alert.alert(tab, 'Раздел будет подключен следующим этапом.');
    }
  };

  const startClientLogin = (redirectScreen = 'profile') => {
    setAuthOriginScreen(screen === 'loading' || screen === 'welcome' ? 'home' : screen);
    setAuthRedirectScreen(redirectScreen);
    setLoginForm(initialLoginForm);
    setScreen('login-phone');
  };

  const startClientRegistration = (redirectScreen = 'profile') => {
    setAuthOriginScreen(screen === 'loading' || screen === 'welcome' ? 'home' : screen);
    setAuthRedirectScreen(redirectScreen);
    setForm(initialForm);
    setStep(1);
    setScreen('register');
  };

  const goBack = () => {
    if (
      (screen === 'master-detail' ||
        screen === 'salon-detail' ||
        screen === 'profile-settings') &&
      navigationStack.length > 0
    ) {
      const previousRoute = navigationStack[navigationStack.length - 1];
      setNavigationStack((current) => current.slice(0, -1));
      setSelectedProfile(previousRoute.selectedProfile);
      setScreen(previousRoute.screen);
      return;
    }
    if (screen === 'welcome') {
      setScreen('home');
      return;
    }
    if (screen === 'home') {
      return;
    }
    if (screen === 'search') {
      setScreen('home');
      return;
    }
    if (screen === 'appointments') {
      setScreen('home');
      return;
    }
    if (screen === 'partner-appointments') {
      setScreen('profile');
      return;
    }
    if (screen === 'master-detail' || screen === 'salon-detail') {
      setScreen('home');
      setSelectedProfile(null);
      return;
    }
    if (screen === 'master-success') {
      setScreen('home');
      setMasterStep(1);
      return;
    }
    if (screen === 'salon-success') {
      setScreen('home');
      setSalonStep(1);
      return;
    }
    if (screen === 'login-success') {
      setScreen(authRedirectScreen || 'home');
      setLoginForm(initialLoginForm);
      return;
    }
    if (screen === 'login-code') {
      setScreen('login-phone');
      updateLoginForm('code', '');
      return;
    }
    if (screen === 'login-phone') {
      setScreen(authOriginScreen || 'home');
      setLoginForm(initialLoginForm);
      return;
    }
    if (screen === 'master-register') {
      if (masterStep === 1) {
        setMasterForm(initialMasterForm);
        setScreen(authOriginScreen || 'profile');
        return;
      }
      setMasterStep((current) => current - 1);
      return;
    }
    if (screen === 'salon-register') {
      if (salonStep === 1) {
        setSalonForm(initialSalonForm);
        setScreen(authOriginScreen || 'profile');
        return;
      }
      setSalonStep((current) => current - 1);
      return;
    }
    if (step === 1) {
      setForm(initialForm);
      setScreen(authOriginScreen || 'home');
      return;
    }

    if (screen === 'code') {
      setScreen('register');
      setStep(4);
      updateForm('code', '');
      return;
    }

    setStep((current) => current - 1);
  };

  const continueRegistration = () => {
    Keyboard.dismiss();
    if (step === 1) {
      if (!form.fullName.trim()) {
        Alert.alert('Введите имя и фамилию');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!form.city) {
        Alert.alert('Выберите город');
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      if (!form.birthDate.trim() || !form.gender) {
        Alert.alert('Укажите дату рождения и пол');
        return;
      }
      setStep(4);
      return;
    }

    if (step === 4) {
      if (digitsOnly(form.phone).length < 10) {
        Alert.alert('Введите номер телефона');
        return;
      }
      if (!form.agreement || !form.personalData) {
        Alert.alert('Подтвердите согласия', 'Необходимо принять пользовательское соглашение и политику конфиденциальности.');
        return;
      }
      setScreen('code');
      updateForm('code', '');
    }
  };

  const deleteClientAccount = async () => {
    const identity = await getStoredClientIdentity();
    await deleteJson('/api/profile/client', identity);
    await logout();
  };

  const finishRegistration = async () => {
    if (clientSubmitting) return;

    setClientSubmitting(true);
    try {
      const result = await submitClientRegistration(form);
      await rememberAuthenticatedUser({
        id: result.id,
        phone: result.registration?.phone || phoneToApi(form.phone),
        role: 'client',
      });
      setScreen(authRedirectScreen || 'profile');
      setStep(1);
      setForm(initialForm);
    } catch (error) {
      Alert.alert('Ошибка сохранения', error.message);
    } finally {
      setClientSubmitting(false);
    }
  };

  const continueLogin = () => {
    if (digitsOnly(loginForm.phone).length < 10) {
      Alert.alert('Введите номер телефона');
      return;
    }
    if (!loginForm.agreement || !loginForm.personalData) {
      Alert.alert('Подтвердите согласия', 'Необходимо принять пользовательское соглашение и политику конфиденциальности.');
      return;
    }
    updateLoginForm('code', '');
    setScreen('login-code');
  };

  const confirmLogin = async () => {
    if (loginForm.code !== TEST_CODE) {
      Alert.alert('Неверный код', 'Для теста используйте код 0000.');
      return;
    }

    const phone = phoneToApi(loginForm.phone);
    try {
      const result = await getJson(`/api/auth/profile?phone=${encodeURIComponent(phone)}`);
      const completeLogin = async (account) => {
        await rememberAuthenticatedUser({
          id: account.profile.id,
          phone: result.normalizedPhone || phone,
          role: account.role,
        });
        setScreen(account.role === 'client' ? authRedirectScreen || 'profile' : 'profile');
        setLoginForm(initialLoginForm);
      };

      if (result.accounts.length === 1) {
        await completeLogin(result.accounts[0]);
        return;
      }

      Alert.alert(
        'Выберите аккаунт',
        'На этот номер зарегистрировано несколько ролей.',
        [
          ...result.accounts.map((account) => ({
            text: account.role === 'salon' ? 'Салон' : account.role === 'master' ? 'Мастер' : 'Клиент',
            onPress: () => completeLogin(account),
          })),
          { text: 'Отмена', style: 'cancel' },
        ],
      );
    } catch (_error) {
      Alert.alert(
        'Профиль не найден',
        'Аккаунт с таким номером не зарегистрирован. Сначала пройдите регистрацию.',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Зарегистрироваться', onPress: () => startClientRegistration(authRedirectScreen) },
        ],
      );
    }
  };

  const continueMasterRegistration = async () => {
    Keyboard.dismiss();
    if (masterStep === 1) {
      if (!masterForm.fullName.trim() || !masterForm.city || digitsOnly(masterForm.phone).length < 10) {
        Alert.alert('Заполните ФИО, город и номер телефона');
        return;
      }
      setMasterStep(2);
      return;
    }

    if (masterStep === 2) {
      if (!masterForm.experience) {
        Alert.alert('Укажите опыт работы');
        return;
      }
      setMasterStep(3);
      return;
    }

    if (masterStep === 3) {
      if (!masterForm.documents.id || masterForm.documents.certificates.length === 0) {
        Alert.alert('Загрузите удостоверение личности и сертификаты');
        return;
      }
      setMasterStep(4);
      return;
    }

    if (masterStep === 4) {
      if (!masterForm.agreement || !masterForm.personalData) {
        Alert.alert('Подтвердите согласия');
        return;
      }
      if (masterSubmitting) return;

      setMasterSubmitting(true);
      try {
        const result = await submitMasterRegistration(masterForm);
        await rememberAuthenticatedUser({
          id: result.id,
          phone: result.registration?.phone || phoneToApi(masterForm.phone),
          role: 'master',
        });
        setScreen('master-success');
      } catch (error) {
        Alert.alert('Ошибка отправки', error.message);
      } finally {
        setMasterSubmitting(false);
      }
    }
  };

  const continueSalonRegistration = async () => {
    Keyboard.dismiss();
    if (salonStep === 1) {
      if (
        !salonForm.salonName.trim() ||
        !salonForm.ownerName.trim() ||
        digitsOnly(salonForm.phone).length < 10
      ) {
        Alert.alert('Заполните название, ответственное лицо и телефон');
        return;
      }
      setSalonStep(2);
      return;
    }

    if (salonStep === 2) {
      if (
        !salonForm.legalName.trim() ||
        !salonForm.city ||
        !salonForm.address.trim() ||
        !salonForm.workDays
      ) {
        Alert.alert('Заполните юридические данные, адрес и рабочее время');
        return;
      }
      setSalonStep(3);
      return;
    }

    if (salonStep === 3) {
      if (!salonForm.documents.ownerId) {
        Alert.alert('Загрузите удостоверение личности владельца');
        return;
      }
      setSalonStep(4);
      return;
    }

    if (salonStep === 4) {
      if (salonForm.photos.length === 0) {
        Alert.alert('Добавьте хотя бы одну фотографию салона');
        return;
      }
      if (salonSubmitting) return;

      setSalonSubmitting(true);
      try {
        const result = await submitSalonRegistration(salonForm);
        await rememberAuthenticatedUser({
          id: result.id,
          phone: result.registration?.phone || phoneToApi(salonForm.phone),
          role: 'salon',
        });
        setScreen('salon-success');
      } catch (error) {
        Alert.alert('Ошибка отправки', error.message);
      } finally {
        setSalonSubmitting(false);
      }
    }
  };

  const createMasterAppointment = async (master, booking) => {
    if (!isAuthenticated || userRole !== 'client') {
      if (isAuthenticated) {
        Alert.alert('Клиентская функция', 'Запись к мастеру доступна из аккаунта клиента.');
        return false;
      }
      setAuthOriginScreen('master-detail');
      setAuthRedirectScreen('master-detail');
      setLoginForm(initialLoginForm);
      setScreen('login-phone');
      return false;
    }

    const identity = await getStoredClientIdentity();
    const result = await postJson('/api/appointments/client', {
      ...identity,
      date: booking.date,
      duration: booking.duration,
      image: typeof master?.image === 'string' ? master.image : '',
      masterId: master?.id,
      masterName: master?.name || '',
      price: booking.price,
      salonId: master?.salonId,
      salonName: master?.salonName || master?.place || 'Частный мастер',
      serviceName: booking.serviceName,
      time: booking.time,
    });

    Alert.alert(
      'Запись подтверждена',
      `${result.appointment.service} • ${formatAppointmentDate(result.appointment.date)} в ${result.appointment.time}`,
      [
        { text: 'Остаться', style: 'cancel' },
        { text: 'Мои записи', onPress: () => switchMainScreen('appointments') },
      ],
    );
    return true;
  };

  const openRoleChoice = () => {
    setAuthOriginScreen(screen === 'loading' || screen === 'welcome' ? 'home' : screen);
    setRoleModalVisible(true);
  };
  const startMasterRegistration = () => {
    setRoleModalVisible(false);
    setMasterForm(initialMasterForm);
    setScreen('master-register');
    setMasterStep(1);
  };
  const startSalonRegistration = () => {
    setRoleModalVisible(false);
    setSalonForm(initialSalonForm);
    setScreen('salon-register');
    setSalonStep(1);
  };

  return (
    <SafeAreaProvider>
      <View style={styles.safeArea}>
        <StatusBar style="dark" />
        {screen === 'loading' ? (
          <LoadingScreen scale={scale} styles={styles} />
        ) : screen === 'welcome' ? (
          <WelcomeScreen
            onLogin={startClientLogin}
            onLegal={openLegalDocument}
            onPartnerPress={openRoleChoice}
            onRegister={startClientRegistration}
            styles={styles}
            scale={scale}
          />
        ) : screen === 'home' ? (
          <HomeScreen
            onOpenMaster={(item) => {
              openDetailScreen('master-detail', item);
            }}
            onOpenSalon={(item) => {
              openDetailScreen('salon-detail', item);
            }}
            onSearch={() => setScreen('search')}
            onTab={handleTabNavigation}
            scale={scale}
            styles={styles}
          />
        ) : screen === 'search' ? (
          <SearchScreen
            isAuthenticated={isAuthenticated && userRole === 'client'}
            onBack={goBack}
            onOpenMaster={(item) => {
              openDetailScreen('master-detail', item);
            }}
            onOpenSalon={(item) => {
              openDetailScreen('salon-detail', item);
            }}
            onRequireAuth={requireClientAuth}
            onTab={handleTabNavigation}
            scale={scale}
            styles={styles}
          />
        ) : screen === 'profile' ? (
          isAuthenticated ? (
            userRole === 'client' ? (
              <ClientProfileScreen
                onLegal={openLegalDocument}
                onLogout={logout}
                onOpenSalon={(item) => {
                  openDetailScreen('salon-detail', item);
                }}
                onSettings={openProfileSettings}
                onTab={handleTabNavigation}
                scale={scale}
                styles={styles}
              />
            ) : (
              <PartnerProfileScreen
                onLogout={logout}
                onOpenAppointments={() => switchMainScreen('partner-appointments')}
                onTab={handleTabNavigation}
                role={userRole}
                scale={scale}
                styles={styles}
              />
            )
          ) : (
            <GuestProfileScreen
              onLogin={() => startClientLogin('profile')}
              onPartnerPress={openRoleChoice}
              onRegister={() => startClientRegistration('profile')}
              onTab={handleTabNavigation}
              scale={scale}
              styles={styles}
            />
          )
        ) : screen === 'profile-settings' ? (
          <ProfileSettingsScreen
            onBack={goBack}
            onDeleteAccount={deleteClientAccount}
            onLegal={openLegalDocument}
            scale={scale}
            styles={styles}
          />
        ) : screen === 'appointments' ? (
          <ClientAppointmentsScreen
            onOpenSalon={(item) => {
              openDetailScreen('salon-detail', item);
            }}
            onTab={handleTabNavigation}
            scale={scale}
            styles={styles}
          />
        ) : screen === 'partner-appointments' ? (
          <PartnerAppointmentsScreen
            onTab={handleTabNavigation}
            role={userRole}
            scale={scale}
            styles={styles}
          />
        ) : screen === 'master-detail' ? (
          <MasterDetailScreen
            item={selectedProfile || popularMasters[0]}
            onBack={goBack}
            onBook={createMasterAppointment}
            scale={scale}
            styles={styles}
          />
        ) : screen === 'salon-detail' ? (
          <SalonDetailScreen
            item={selectedProfile || topSalons[0]}
            onBack={goBack}
            onOpenMaster={(item) => {
              openDetailScreen('master-detail', {
                ...item,
                salonId: selectedProfile?.id,
                salonName: selectedProfile?.name,
              });
            }}
            scale={scale}
            styles={styles}
          />
        ) : screen === 'login-phone' ? (
          <LoginPhoneScreen
            agreement={loginForm.agreement}
            onBack={goBack}
            onContinue={continueLogin}
            onLegal={openLegalDocument}
            personalData={loginForm.personalData}
            phone={loginForm.phone}
            scale={scale}
            styles={styles}
            updateForm={updateLoginForm}
          />
        ) : screen === 'login-code' ? (
          <CodeScreen
            code={loginForm.code}
            confirmLabel="Войти"
            onBack={goBack}
            onChangeCode={(value) => updateLoginForm('code', digitsOnly(value).slice(0, 4))}
            onConfirm={confirmLogin}
            phone={loginForm.phone}
            progressStep={2}
            progressTotal={2}
            scale={scale}
            styles={styles}
            subtitlePrefix="Мы отправили 4-значный код"
          />
        ) : screen === 'login-success' ? (
          <LoginSuccessScreen
            onHome={() => {
              setScreen('profile');
              setLoginForm(initialLoginForm);
            }}
            scale={scale}
            styles={styles}
          />
        ) : screen === 'code' ? (
          <CodeScreen
            code={form.code}
            onBack={goBack}
            onChangeCode={(value) => updateForm('code', digitsOnly(value).slice(0, 4))}
            onConfirm={() => {
              if (form.code === TEST_CODE) {
                setScreen('register');
                setStep(5);
                return;
              }
              Alert.alert('Неверный код', 'Для теста используйте код 0000.');
            }}
            phone={form.phone}
            scale={scale}
            styles={styles}
          />
        ) : screen === 'master-register' ? (
          <MasterRegistrationScreen
            form={masterForm}
            onBack={goBack}
            onContinue={continueMasterRegistration}
            onLegal={openLegalDocument}
            scale={scale}
            submitting={masterSubmitting}
            step={masterStep}
            styles={styles}
            updateForm={updateMasterForm}
          />
        ) : screen === 'master-success' ? (
          <MasterSuccessScreen
            onHome={() => {
              setScreen('profile');
              setMasterStep(1);
              setMasterForm(initialMasterForm);
            }}
            styles={styles}
            scale={scale}
          />
        ) : screen === 'salon-register' ? (
          <SalonRegistrationScreen
            form={salonForm}
            onBack={goBack}
            onContinue={continueSalonRegistration}
            onLegal={openLegalDocument}
            scale={scale}
            submitting={salonSubmitting}
            step={salonStep}
            styles={styles}
            updateForm={updateSalonForm}
          />
        ) : screen === 'salon-success' ? (
          <MasterSuccessScreen
            onHome={() => {
              setScreen('home');
              setSalonStep(1);
              setSalonForm(initialSalonForm);
            }}
            styles={styles}
            scale={scale}
          />
        ) : (
          <RegistrationScreen
            form={form}
            onBack={goBack}
            onContinue={step === 5 ? finishRegistration : continueRegistration}
            onLegal={openLegalDocument}
            onPartnerPress={openRoleChoice}
            scale={scale}
            submitting={clientSubmitting}
            step={step}
            styles={styles}
            updateForm={updateForm}
          />
        )}
        <RoleChoiceModal
          onClose={() => setRoleModalVisible(false)}
          onMaster={startMasterRegistration}
          onSalon={() => {
            startSalonRegistration();
          }}
          scale={scale}
          styles={styles}
          visible={roleModalVisible}
        />
      </View>
    </SafeAreaProvider>
  );
}

function WelcomeScreen({ onLegal, onLogin, onPartnerPress, onRegister, scale, styles }) {
  return (
    <View style={styles.screen}>
      <View style={styles.logoBlock}>
        <Image source={require('./assets/tap-partner-logo.png')} style={styles.welcomeLogoImage} />
      </View>

      <View style={styles.copyBlock}>
        <Text style={styles.welcomeTitle}>Добро пожаловать!</Text>
        <Text style={styles.welcomeSubtitle}>
          Международная платформа{'\n'}
          красоты, здоровья и коррекции фигуры
        </Text>
      </View>

      <View style={styles.welcomeActions}>
        <GradientButton label="Регистрация" onPress={onRegister} styles={styles} />

        <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={onLogin}>
          <Text style={styles.secondaryButtonText}>Вход</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>или</Text>
          <View style={styles.divider} />
        </View>

        <Pressable accessibilityRole="button" style={styles.partnerCard} onPress={onPartnerPress}>
          <View style={styles.partnerIcon}>
            <Ionicons color={brandPink} name="storefront-outline" size={40 * scale} />
          </View>
          <View style={styles.partnerText}>
            <Text style={styles.partnerTitle}>Вы салон или мастер?</Text>
            <Text numberOfLines={1} style={styles.partnerSubtitle}>
              Подайте заявку на модерацию
            </Text>
          </View>
          <Ionicons color={brandPink} name="chevron-forward" size={32 * scale} />
        </Pressable>

        <View style={styles.welcomeLegalLinks}>
          <Pressable onPress={() => onLegal('privacy')}>
            <Text style={styles.welcomeLegalText}>Политика конфиденциальности</Text>
          </Pressable>
          <Text style={styles.welcomeLegalDivider}>•</Text>
          <Pressable onPress={() => onLegal('terms')}>
            <Text style={styles.welcomeLegalText}>Пользовательское соглашение</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function LoadingScreen({ scale, styles }) {
  return (
    <View style={styles.loadingScreen}>
      <Image source={require('./assets/tap-partner-logo.png')} style={styles.loadingLogoImage} />
      <ActivityIndicator color={brandPink} size="small" style={styles.loadingSpinner} />
    </View>
  );
}

function ScreenLayout({ children, styles }) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.appScreen}>
      {children}
    </SafeAreaView>
  );
}

function HomeScreen({ onOpenMaster, onOpenSalon, onSearch, onTab, scale, styles }) {
  const { width } = useWindowDimensions();
  const [activeBanner, setActiveBanner] = useState(0);
  const [activeTab, setActiveTab] = useState('Главная');
  const [city, setCity] = useState('Алматы');
  const [favoriteItems, setFavoriteItems] = useState({});
  const [homeError, setHomeError] = useState('');
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeMasters, setHomeMasters] = useState([]);
  const [homeSalons, setHomeSalons] = useState([]);
  const [modal, setModal] = useState(null);
  const bannerRef = useRef(null);
  const bannerWidth = width - 48 * scale;
  const safeActiveBanner = activeBanner % heroSlides.length;
  const toggleFavorite = (key) =>
    setFavoriteItems((current) => ({ ...current, [key]: !current[key] }));
  const openStub = (title, description) => setModal({ description, title, type: 'stub' });
  const handleTab = (label) => {
    setActiveTab(label);
    if (label === 'Поиск') {
      onSearch();
      return;
    }
    if (label === 'Профиль') {
      onTab(label);
      return;
    }
    if (label === 'Записи') {
      onTab(label);
      return;
    }
    if (label !== 'Главная') {
      openStub(label, 'Раздел уже кликабельный, наполнение добавим следующим этапом.');
    }
  };
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((current) => {
        const next = (current + 1) % heroSlides.length;
        bannerRef.current?.scrollTo({ animated: true, x: next * bannerWidth });
        return next;
      });
    }, 4200);

    return () => clearInterval(timer);
  }, [bannerWidth]);

  const loadHomeData = async () => {
    setHomeError('');
    setHomeLoading(true);
    try {
      const data = await getJson('/api/home');
      setHomeMasters((data.masters || []).map(normalizeHomeMaster));
      setHomeSalons((data.salons || []).map(normalizeHomeSalon));
    } catch (error) {
      setHomeError(error.message || 'Не удалось загрузить данные');
      setHomeMasters([]);
      setHomeSalons([]);
    } finally {
      setHomeLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  return (
    <ScreenLayout styles={styles}>
      <ScrollView
        contentContainerStyle={styles.homeScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.homeHeader}>
          <View style={styles.homeBrandRow}>
            <Image source={require('./assets/tap-partner-logo.png')} style={styles.homeLogoImage} />
          </View>
          <Pressable style={styles.cityPill} onPress={() => setModal({ type: 'city' })}>
            <Text style={styles.cityPillText}>{city}</Text>
            <Ionicons color={brandPink} name="chevron-down" size={16 * scale} />
          </Pressable>
          <Pressable
            style={styles.notificationButton}
            onPress={() => openStub('Уведомления', 'Новых уведомлений пока нет.')}
          >
            <Ionicons color={darkText} name="notifications-outline" size={26 * scale} />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <Pressable
            style={styles.homeSearch}
            onPress={onSearch}
          >
            <Ionicons color="#9b9ca1" name="search-outline" size={24 * scale} />
            <Text style={styles.homeSearchText}>Поиск мастера, услуги, салона...</Text>
          </Pressable>
          <Pressable
            style={styles.filterButton}
            onPress={() => openStub('Фильтры', 'Скоро здесь будут фильтры по цене, рейтингу и услугам.')}
          >
            <Ionicons color="#fff" name="options-outline" size={27 * scale} />
          </Pressable>
        </View>

        <View style={styles.heroBanner}>
          <ScrollView
            horizontal
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / bannerWidth);
              setActiveBanner(index);
            }}
            pagingEnabled
            ref={bannerRef}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
          >
            {heroSlides.map((slide) => (
              <Pressable
                key={slide.title}
                onPress={() => setActiveBanner((current) => (current + 1) % heroSlides.length)}
                style={[styles.heroSlide, { backgroundColor: slide.background, width: bannerWidth }]}
              >
                <Image source={slide.image} style={styles.heroBannerImage} />
                <View style={styles.heroOverlay} />
                <View style={styles.heroBannerCopy}>
                  <Text style={styles.heroBadge}>АКЦИЯ</Text>
                  <Text style={styles.heroTitle}>{slide.title}</Text>
                  <Text style={styles.heroSubtitle}>{slide.subtitle}</Text>
                  <Pressable
                    style={styles.heroButton}
                    onPress={() => openStub('Выбор услуги', 'Список услуг по акции будет подключен следующим этапом.')}
                  >
                    <Text style={styles.heroButtonText}>Выбрать услугу</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.heroDots}>
            {heroSlides.map((_, item) => (
              <Pressable
                key={item}
                hitSlop={8}
                onPress={() => {
                  setActiveBanner(item);
                  bannerRef.current?.scrollTo({ animated: true, x: item * bannerWidth });
                }}
                style={[styles.heroDot, item === safeActiveBanner && styles.heroDotActive]}
              />
            ))}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.categoryList}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {homeCategories.map((item) => (
            <Pressable
              key={item.label}
              style={styles.categoryItem}
              onPress={() => openStub(item.label.replace('\n', ' '), 'Раздел услуг будет доступен после подключения каталога.')}
            >
              <View style={styles.categoryIconBox}>
                <Image source={item.image} style={styles.categoryIconImage} />
              </View>
              <Text style={styles.categoryText}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <HomeSection
          data={homeMasters}
          emptyText={homeLoading ? 'Загружаем мастеров...' : 'Пока нет активных мастеров'}
          onSeeAll={onSearch}
          renderItem={(item) => (
            <MasterHomeCard
              favorite={Boolean(favoriteItems[`master-${item.name}`])}
              item={item}
              onFavorite={() => toggleFavorite(`master-${item.name}`)}
              onPress={() => onOpenMaster(item)}
              scale={scale}
              styles={styles}
            />
          )}
          styles={styles}
          title="Популярные мастера"
        />

        <HomeSection
          data={homeSalons}
          emptyText={homeLoading ? 'Загружаем салоны...' : 'Пока нет активных салонов'}
          onSeeAll={onSearch}
          renderItem={(item) => (
            <SalonHomeCard
              favorite={Boolean(favoriteItems[`salon-${item.name}`])}
              item={item}
              onFavorite={() => toggleFavorite(`salon-${item.name}`)}
              onPress={() => onOpenSalon(item)}
              scale={scale}
              styles={styles}
            />
          )}
          styles={styles}
          title="Лучшие салоны"
        />

        {homeError ? (
          <Pressable style={styles.homeDataError} onPress={loadHomeData}>
            <Ionicons color={brandPink} name="refresh" size={18 * scale} />
            <Text style={styles.homeDataErrorText}>Не удалось загрузить данные. Повторить</Text>
          </Pressable>
        ) : null}

        <View style={styles.homePromoGrid}>
          <PromoTile
            image={require('./assets/home-banners/promo-packages.png')}
            styles={styles}
            subtitle="Комплексы процедур со скидкой"
            title="Пакеты процедур"
            onPress={() => openStub('Пакеты процедур', 'Пакеты процедур скоро появятся в каталоге.')}
          />
          <PromoTile
            image={require('./assets/home-banners/promo-products.png')}
            styles={styles}
            subtitle="Косметика и beauty-девайсы"
            title="Товары для красоты"
            onPress={() => openStub('Товары для красоты', 'Магазин будет подключен отдельным разделом.')}
          />
        </View>
      </ScrollView>

      <AppBottomTabs active={activeTab} onTab={handleTab} scale={scale} styles={styles} />

      <HomeModal
        city={city}
        modal={modal}
        onCity={setCity}
        onClose={() => setModal(null)}
        scale={scale}
        styles={styles}
      />
    </ScreenLayout>
  );
}

function HomeSection({ data, emptyText, onSeeAll, renderItem, styles, title }) {
  return (
    <View style={styles.homeSection}>
      <View style={styles.homeSectionHeader}>
        <Text style={styles.homeSectionTitle}>{title}</Text>
        <Pressable onPress={onSeeAll}>
          <Text style={styles.homeSectionLink}>Смотреть все</Text>
        </Pressable>
      </View>
      {data.length === 0 ? (
        <View style={styles.homeEmptyCard}>
          <Text style={styles.homeEmptyText}>{emptyText}</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.homeCardsRow}>
            {data.map((item) => React.cloneElement(renderItem(item), { key: item.id || item.name }))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function MasterHomeCard({ favorite, item, onFavorite, onPress, scale, selected = false, styles }) {
  return (
    <Pressable style={[styles.masterHomeCard, selected && styles.masterHomeCardSelected]} onPress={onPress}>
      <View>
        <Image source={mediaSource(item.image)} style={styles.masterHomeImage} />
        <RatingBadge rating={item.rating} scale={scale} styles={styles} />
        <Pressable hitSlop={8} onPress={onFavorite} style={styles.homeHeartButton}>
          <Ionicons color="#fff" name={favorite ? 'heart' : 'heart-outline'} size={25 * scale} />
        </Pressable>
      </View>
      <View style={styles.homeCardBody}>
        <Text numberOfLines={1} style={styles.homeCardTitle}>{item.name}</Text>
        <Text numberOfLines={1} style={styles.homeCardSubtitle}>{item.specialty}</Text>
        <Text style={styles.homeCardPrice}>{item.price}</Text>
      </View>
    </Pressable>
  );
}

function SalonHomeCard({ favorite, item, onFavorite, onPress, scale, styles }) {
  return (
    <Pressable style={styles.salonHomeCard} onPress={onPress}>
      <View>
        <Image source={mediaSource(item.image)} style={styles.salonHomeImage} />
        <RatingBadge rating={item.rating} scale={scale} styles={styles} />
        <Pressable hitSlop={8} onPress={onFavorite} style={styles.homeHeartButton}>
          <Ionicons color="#fff" name={favorite ? 'heart' : 'heart-outline'} size={25 * scale} />
        </Pressable>
      </View>
      <View style={styles.homeCardBody}>
        <Text numberOfLines={1} style={styles.homeCardTitle}>{item.name}</Text>
        <Text numberOfLines={1} style={styles.homeCardSubtitle}>{item.address}</Text>
        <Text numberOfLines={1} style={styles.homeCardSubtitle}>{item.tags}</Text>
      </View>
    </Pressable>
  );
}

function RatingBadge({ rating, scale, styles }) {
  return (
    <View style={styles.ratingBadge}>
      <Ionicons color={brandPink} name="star" size={12 * scale} />
      <Text style={styles.ratingText}>{rating}</Text>
    </View>
  );
}

function PromoTile({ image, onPress, styles, subtitle, title }) {
  return (
    <Pressable style={styles.promoTile} onPress={onPress}>
      <Image source={image} style={styles.promoImage} />
      <View style={styles.promoOverlay} />
      <View style={styles.promoTileCopy}>
        <Text numberOfLines={2} style={styles.promoTitle}>{title}</Text>
        <Text numberOfLines={2} style={styles.promoSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

function HomeModal({ city, modal, onCity, onClose, scale, styles }) {
  if (!modal) return null;

  return (
    <Modal animationType="fade" transparent visible>
      <Pressable style={styles.homeModalOverlay} onPress={onClose}>
        <Pressable style={styles.homeModalSheet}>
          {modal.type === 'city' ? (
            <>
              <Text style={styles.homeModalTitle}>Выберите город</Text>
              {['Алматы', 'Астана', 'Шымкент', 'Актау', 'Актобе', 'Караганда'].map((item) => (
                <Pressable
                  key={item}
                  style={styles.homeModalOption}
                  onPress={() => {
                    onCity(item);
                    onClose();
                  }}
                >
                  <Text style={styles.homeModalOptionText}>{item}</Text>
                  {city === item ? <Ionicons color={brandPink} name="checkmark" size={22 * scale} /> : null}
                </Pressable>
              ))}
            </>
          ) : (
            <>
              <Text style={styles.homeModalTitle}>{modal.title}</Text>
              <Text style={styles.homeModalText}>{modal.description}</Text>
              <Pressable style={styles.homeModalButton} onPress={onClose}>
                <Text style={styles.homeModalButtonText}>Понятно</Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function GuestProfileScreen({ onLogin, onPartnerPress, onRegister, onTab, scale, styles }) {
  return (
    <ScreenLayout styles={styles}>
      <View style={styles.guestProfileContent}>
        <Text style={styles.profileTitle}>Профиль</Text>

        <View style={styles.guestProfileBody}>
          <View style={styles.guestProfileIcon}>
            <Ionicons color={brandPink} name="person-outline" size={54 * scale} />
          </View>
          <Text style={styles.guestProfileTitle}>Войдите или зарегистрируйтесь</Text>
          <Text style={styles.guestProfileSubtitle}>
            Сохраняйте избранное, записывайтесь на услуги и управляйте своими записями.
          </Text>

          <View style={styles.guestProfileActions}>
            <GradientButton label="Зарегистрироваться" onPress={onRegister} styles={styles} />
            <Pressable
              accessibilityRole="button"
              style={styles.secondaryButton}
              onPress={onLogin}
            >
              <Text style={styles.secondaryButtonText}>Войти</Text>
            </Pressable>
            <RegistrationPartnerCard onPress={onPartnerPress} scale={scale} styles={styles} />
          </View>
        </View>
      </View>

      <AppBottomTabs active="Профиль" onTab={onTab} scale={scale} styles={styles} />
    </ScreenLayout>
  );
}

function ClientProfileScreen({ onLogout, onOpenSalon, onSettings, onTab, scale, styles }) {
  const [modal, setModal] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const openStub = (title, description = 'Раздел будет подключен следующим этапом.') =>
    setModal({ description, title, type: 'stub' });
  const profile = profileData?.profile;
  const notificationsCount = profileData?.counters?.notifications || 0;
  const profileInitials = getInitials(profile?.fullName);

  const loadProfile = async () => {
    setProfileLoading(true);
    setProfileError('');

    try {
      const query = await getStoredClientQuery();
      const data = await getJson(`/api/profile/client${query}`);
      setProfileData(data);
      if (data.profile?.id) await AsyncStorage.setItem(CLIENT_ID_STORAGE_KEY, data.profile.id);
      if (data.profile?.phone) await AsyncStorage.setItem(CLIENT_PHONE_STORAGE_KEY, data.profile.phone);
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const menuItems = [
    ['calendar-outline', 'История посещений', null],
    ['notifications-outline', 'Уведомления', notificationsCount ? String(notificationsCount) : null],
    ['help-circle-outline', 'Вопросы и ответы', null],
    ['headset-outline', 'Поддержка', null],
  ];

  return (
    <ScreenLayout styles={styles}>
      <ScrollView
        contentContainerStyle={styles.profileContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <Text style={styles.profileTitle}>Личный кабинет</Text>
          <View style={styles.profileHeaderActions}>
            <Pressable onPress={() => openStub('Уведомления', notificationsCount ? `У вас ${notificationsCount} новых уведомления.` : 'Новых уведомлений нет.')}>
              <Ionicons color={darkText} name="notifications-outline" size={26 * scale} />
              {notificationsCount ? (
                <View style={styles.profileHeaderBadge}>
                  <Text style={styles.profileHeaderBadgeText}>{notificationsCount}</Text>
                </View>
              ) : null}
            </Pressable>
            <Pressable onPress={onSettings}>
              <Ionicons color={darkText} name="settings-outline" size={27 * scale} />
            </Pressable>
          </View>
        </View>

        {profileLoading ? (
          <View style={styles.profileStateCard}>
            <ActivityIndicator color={brandPink} size="small" />
            <Text style={styles.profileStateText}>Загружаем профиль...</Text>
          </View>
        ) : profileError ? (
          <View style={styles.profileStateCard}>
            <Text style={styles.profileStateTitle}>Профиль не загрузился</Text>
            <Text style={styles.profileStateText}>{profileError}</Text>
            <Pressable style={styles.profileRetryButton} onPress={loadProfile}>
              <Text style={styles.profileRetryButtonText}>Повторить</Text>
            </Pressable>
          </View>
        ) : null}

        {profile ? <View style={styles.profileIdentity}>
          <View>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.profileAvatar} />
            ) : (
              <View style={styles.profileAvatarFallback}>
                <Text style={styles.profileAvatarInitials}>{profileInitials}</Text>
              </View>
            )}
            <Pressable style={styles.profileCamera} onPress={() => openStub('Фото профиля', 'Загрузка фото будет подключена позже.')}>
              <Ionicons color="#fff" name="camera" size={16 * scale} />
            </Pressable>
          </View>
          <View style={styles.profileIdentityText}>
            <Text style={styles.profileName}>{profile.fullName}</Text>
            <Text style={styles.profilePhone}>{formatDisplayPhone(profile.phone)}</Text>
            <Text style={styles.profileRole}>{profile.role}</Text>
            <Text style={styles.profileMeta}>{profile.city || 'Город не указан'}</Text>
          </View>
        </View> : null}

        {profile ? <View style={styles.premiumCard}>
          <View style={styles.premiumIcon}>
            <Ionicons color={brandPink} name="person-circle-outline" size={34 * scale} />
          </View>
          <View style={styles.premiumText}>
            <Text style={styles.premiumTitle}>Статус аккаунта</Text>
            <Text style={styles.premiumSubtitle}>{getAccountStatusLabel(profile.accountStatus)}</Text>
            <Text style={styles.premiumSubtitle}>{profile.createdAt ? `В XSIZE с ${formatDateShort(profile.createdAt)}` : 'Дата регистрации не указана'}</Text>
          </View>
          <Pressable style={styles.premiumButton} onPress={() => openStub('Статус аккаунта', getAccountStatusLabel(profile.accountStatus))}>
            <Text style={styles.premiumButtonText}>Подробнее</Text>
          </Pressable>
        </View> : null}

        <View style={styles.profilePanel}>
          <View style={styles.profileSectionHeader}>
            <Text style={styles.profileSectionTitle}>Мои записи</Text>
            <Pressable style={styles.profileSeeAll} onPress={() => openStub('Мои записи')}>
              <Text style={styles.profileSeeAllText}>Смотреть все</Text>
              <Ionicons color="#777982" name="chevron-forward" size={18 * scale} />
            </Pressable>
          </View>
          <View style={styles.profileEmptyBlock}>
            <Ionicons color={brandPink} name="calendar-outline" size={27 * scale} />
            <Text style={styles.profileEmptyTitle}>Активных записей пока нет</Text>
            <Text style={styles.profileEmptyText}>Когда запись будет создана в базе, она появится здесь.</Text>
          </View>
        </View>

        <View style={styles.profileMenu}>
          {menuItems.map(([icon, title, badge]) => (
            <Pressable
              key={title}
              style={styles.profileMenuItem}
              onPress={() => openStub(title)}
            >
              <Ionicons color={brandPink} name={icon} size={23 * scale} />
              <Text style={styles.profileMenuText}>{title}</Text>
              {badge ? (
                <View style={styles.profileMenuBadge}>
                  <Text style={styles.profileMenuBadgeText}>{badge}</Text>
                </View>
              ) : null}
              <Ionicons color="#8a8b91" name="chevron-forward" size={20 * scale} />
            </Pressable>
          ))}
        </View>

        <View style={styles.inviteCard}>
          <Ionicons color={brandPink} name="gift-outline" size={30 * scale} />
          <View style={styles.inviteText}>
            <Text style={styles.inviteTitle}>Пригласите подругу</Text>
            <Text style={styles.inviteSubtitle}>Дарим вам 500 бонусов за каждого друга</Text>
          </View>
          <Pressable style={styles.inviteButton} onPress={() => openStub('Пригласить')}>
            <Text style={styles.inviteButtonText}>Пригласить</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={() =>
            Alert.alert('Выйти из аккаунта?', 'После выхода нужно будет снова авторизоваться.', [
              { text: 'Отмена', style: 'cancel' },
              { text: 'Выйти', onPress: onLogout, style: 'destructive' },
            ])
          }
        >
          <Ionicons color={brandPink} name="log-out-outline" size={22 * scale} />
          <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
        </Pressable>
      </ScrollView>

      <AppBottomTabs active="Профиль" onTab={onTab} scale={scale} styles={styles} />
      <HomeModal
        city="Алматы"
        modal={modal}
        onCity={() => null}
        onClose={() => setModal(null)}
        scale={scale}
        styles={styles}
      />
    </ScreenLayout>
  );
}

function ProfileSettingsScreen({ onBack, onDeleteAccount, onLegal, scale, styles }) {
  const [deleting, setDeleting] = useState(false);

  const confirmDeleteAccount = () => {
    Alert.alert('Вы уверены?', 'Все ваши записи будут удалены.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        onPress: async () => {
          if (deleting) return;
          setDeleting(true);
          try {
            await onDeleteAccount();
          } catch (error) {
            Alert.alert('Не удалось удалить аккаунт', error.message);
            setDeleting(false);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <ScreenLayout styles={styles}>
      <View style={styles.settingsHeader}>
        <Pressable style={styles.legalBackButton} onPress={onBack}>
          <Ionicons color={darkText} name="chevron-back" size={25 * scale} />
        </Pressable>
        <View style={styles.settingsHeaderText}>
          <Text style={styles.settingsBreadcrumb}>Профиль</Text>
          <Text style={styles.settingsTitle}>Настройки</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.settingsContent} showsVerticalScrollIndicator={false}>
        <View style={styles.settingsPanel}>
          <Pressable style={styles.settingsRow} onPress={() => onLegal('privacy')}>
            <View style={styles.settingsIconCircle}>
              <Ionicons color={brandPink} name="shield-checkmark-outline" size={22 * scale} />
            </View>
            <Text style={styles.settingsRowText}>Политика конфиденциальности</Text>
            <Ionicons color="#8a8b91" name="chevron-forward" size={20 * scale} />
          </Pressable>
          <View style={styles.settingsDivider} />
          <Pressable style={styles.settingsRow} onPress={() => onLegal('terms')}>
            <View style={styles.settingsIconCircle}>
              <Ionicons color={brandPink} name="document-text-outline" size={22 * scale} />
            </View>
            <Text style={styles.settingsRowText}>Пользовательское соглашение</Text>
            <Ionicons color="#8a8b91" name="chevron-forward" size={20 * scale} />
          </Pressable>
        </View>

        <View style={styles.dangerPanel}>
          <Text style={styles.dangerTitle}>Аккаунт</Text>
          <Text style={styles.dangerText}>
            При удалении аккаунта профиль, избранное и все записи клиента будут удалены из базы.
          </Text>
          <Pressable
            disabled={deleting}
            style={[styles.deleteAccountButton, deleting && styles.deleteAccountButtonDisabled]}
            onPress={confirmDeleteAccount}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons color="#fff" name="trash-outline" size={20 * scale} />
                <Text style={styles.deleteAccountButtonText}>Удалить аккаунт</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

function PartnerProfileScreen({ onLogout, onOpenAppointments, onTab, role, scale, styles }) {
  const [addingMaster, setAddingMaster] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [masterPhone, setMasterPhone] = useState('');
  const [salonMasters, setSalonMasters] = useState([]);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const query = await getStoredPartnerQuery(role);
      setData(await getJson(`/api/profile/partner${query}`));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [role]);

  const profile = data?.profile;
  const counters = data?.counters || { activeAppointments: 0, todayAppointments: 0 };

  useEffect(() => {
    if (role !== 'salon' || !profile?.id) {
      setSalonMasters([]);
      return;
    }
    getJson(`/api/salons/masters?salonId=${encodeURIComponent(profile.id)}`)
      .then((result) => setSalonMasters(result.masters || []))
      .catch(() => setSalonMasters([]));
  }, [profile?.id, role]);

  const addSalonMaster = async () => {
    Keyboard.dismiss();
    if (nationalPhoneDigits(masterPhone).length !== 10) {
      Alert.alert('Введите номер мастера');
      return;
    }
    setAddingMaster(true);
    try {
      const result = await postJson('/api/salons/masters', {
        masterPhone: phoneToApi(masterPhone),
        salonId: profile.id,
      });
      setSalonMasters((current) => [
        result.master,
        ...current.filter((item) => item.id !== result.master.id),
      ]);
      setMasterPhone('');
      Alert.alert('Мастер добавлен', `${result.master.name} теперь прикреплён к салону.`);
    } catch (addError) {
      Alert.alert('Не удалось добавить', addError.message);
    } finally {
      setAddingMaster(false);
    }
  };

  return (
    <ScreenLayout styles={styles}>
      <ScrollView contentContainerStyle={styles.profileContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View>
            <Text style={styles.profileTitle}>Личный кабинет</Text>
            <Text style={styles.appointmentsSubtitle}>{role === 'salon' ? 'Салон' : 'Мастер'}</Text>
          </View>
          <View style={[styles.appointmentFullStatus, styles.appointmentStatusgold]}>
            <Text style={[styles.appointmentFullStatusText, styles.appointmentStatusTextgold]}>
              {profile?.status === 'approved' ? 'Активен' : 'На модерации'}
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.profileStateCard}>
            <ActivityIndicator color={brandPink} size="small" />
            <Text style={styles.profileStateText}>Загружаем профиль...</Text>
          </View>
        ) : error ? (
          <View style={styles.profileStateCard}>
            <Text style={styles.profileStateTitle}>Профиль не загрузился</Text>
            <Text style={styles.profileStateText}>{error}</Text>
            <Pressable style={styles.profileRetryButton} onPress={loadProfile}>
              <Text style={styles.profileRetryButtonText}>Повторить</Text>
            </Pressable>
          </View>
        ) : null}

        {profile ? (
          <>
            <View style={styles.profileIdentity}>
              <View style={styles.profileAvatarFallback}>
                <Text style={styles.profileAvatarInitials}>{getInitials(profile.name)}</Text>
              </View>
              <View style={styles.profileIdentityText}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.profilePhone}>{formatDisplayPhone(profile.phone)}</Text>
                <Text style={styles.profileRole}>{profile.roleLabel}</Text>
                <Text style={styles.profileMeta}>{profile.city || 'Город не указан'}</Text>
              </View>
            </View>

            {profile.status !== 'approved' ? (
              <View style={styles.partnerModerationCard}>
                <Ionicons color="#c27800" name="time-outline" size={25 * scale} />
                <View style={styles.partnerModerationText}>
                  <Text style={styles.partnerModerationTitle}>Заявка проверяется</Text>
                  <Text style={styles.partnerModerationSubtitle}>
                    Кабинет уже доступен. После одобрения профиль появится в поиске.
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.appointmentStatsRow}>
              <View style={styles.appointmentStatCard}>
                <Text style={styles.appointmentStatValue}>{counters.todayAppointments}</Text>
                <Text style={styles.appointmentStatLabel}>на сегодня</Text>
              </View>
              <View style={styles.appointmentStatCard}>
                <Text style={styles.appointmentStatValue}>{counters.activeAppointments}</Text>
                <Text style={styles.appointmentStatLabel}>активные</Text>
              </View>
            </View>

            {role === 'salon' ? (
              <View style={styles.salonTeamPanel}>
                <Text style={styles.salonTeamTitle}>Мастера салона</Text>
                <Text style={styles.salonTeamSubtitle}>
                  Добавьте зарегистрированного мастера по номеру. Он прикрепится сразу.
                </Text>
                <MaskedPhoneField
                  phone={masterPhone}
                  scale={scale}
                  styles={styles}
                  updatePhone={setMasterPhone}
                />
                <Pressable
                  disabled={addingMaster}
                  style={[styles.salonTeamAddButton, addingMaster && styles.salonTeamAddButtonDisabled]}
                  onPress={addSalonMaster}
                >
                  {addingMaster ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons color="#fff" name="person-add-outline" size={20 * scale} />
                      <Text style={styles.salonTeamAddButtonText}>Добавить мастера</Text>
                    </>
                  )}
                </Pressable>
                <View style={styles.salonTeamList}>
                  {salonMasters.length ? salonMasters.map((master) => (
                    <View key={master.id} style={styles.salonTeamRow}>
                      <View style={styles.salonTeamAvatar}>
                        <Text style={styles.salonTeamAvatarText}>{getInitials(master.name)}</Text>
                      </View>
                      <View style={styles.salonTeamInfo}>
                        <Text style={styles.salonTeamName}>{master.name}</Text>
                        <Text style={styles.salonTeamPhone}>{formatDisplayPhone(master.phone)}</Text>
                      </View>
                      <Ionicons color="#24a45a" name="checkmark-circle" size={23 * scale} />
                    </View>
                  )) : (
                    <Text style={styles.salonTeamEmpty}>Прикреплённых мастеров пока нет</Text>
                  )}
                </View>
              </View>
            ) : null}

            <Pressable style={styles.partnerScheduleButton} onPress={onOpenAppointments}>
              <View style={styles.partnerScheduleIcon}>
                <Ionicons color="#fff" name="calendar-outline" size={24 * scale} />
              </View>
              <View style={styles.partnerScheduleCopy}>
                <Text style={styles.partnerScheduleTitle}>Журнал записей</Text>
                <Text style={styles.partnerScheduleSubtitle}>Клиенты, даты и точное время</Text>
              </View>
              <Ionicons color="#fff" name="chevron-forward" size={22 * scale} />
            </Pressable>

            <Pressable style={styles.profileLogoutButton} onPress={onLogout}>
              <Ionicons color="#d52d5f" name="log-out-outline" size={20 * scale} />
              <Text style={styles.profileLogoutText}>Выйти</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
      <AppBottomTabs active="Профиль" onTab={onTab} scale={scale} styles={styles} />
    </ScreenLayout>
  );
}

function PartnerAppointmentsScreen({ onTab, role, scale, styles }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('Ближайшие');
  const [loading, setLoading] = useState(true);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(() => formatLocalDateKey(new Date()));

  const loadAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const query = await getStoredPartnerQuery(role);
      setData(await getJson(`/api/appointments/partner${query}`));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [role]);

  const appointments = data?.appointments || [];
  const visibleAppointments = appointments.filter((item) =>
    filter === 'Ближайшие' ? item.group === 'active' : item.group === 'history',
  );
  const groupedAppointments = groupAppointmentsByDate(visibleAppointments);
  const stats = data?.stats || { active: 0, today: 0 };

  return (
    <ScreenLayout styles={styles}>
      <ScrollView contentContainerStyle={styles.appointmentsContent} showsVerticalScrollIndicator={false}>
        <View style={styles.appointmentsHeader}>
          <View>
            <Text style={styles.appointmentsTitle}>Журнал записей</Text>
            <Text style={styles.appointmentsSubtitle}>
              {role === 'salon' ? 'Записи салона' : 'Ваши клиенты'}
            </Text>
          </View>
          <View style={styles.appointmentsHeaderButton}>
            <Ionicons color={brandPink} name="calendar-outline" size={24 * scale} />
          </View>
        </View>

        <View style={styles.appointmentStatsRow}>
          <View style={styles.appointmentStatCard}>
            <Text style={styles.appointmentStatValue}>{stats.today}</Text>
            <Text style={styles.appointmentStatLabel}>сегодня</Text>
          </View>
          <View style={styles.appointmentStatCard}>
            <Text style={styles.appointmentStatValue}>{stats.active}</Text>
            <Text style={styles.appointmentStatLabel}>ближайшие</Text>
          </View>
        </View>

        {role === 'salon' ? (
          <SalonScheduleGrid
            appointments={appointments}
            error={error}
            loading={loading}
            masters={data?.masters || []}
            onRetry={loadAppointments}
            onSelectDate={setSelectedScheduleDate}
            partner={data?.partner}
            scale={scale}
            selectedDate={selectedScheduleDate}
            styles={styles}
          />
        ) : (
          <>
            <View style={styles.appointmentFilterRow}>
              {['Ближайшие', 'История'].map((item) => (
                <Pressable
                  key={item}
                  style={[styles.appointmentFilterChip, filter === item && styles.appointmentFilterChipActive]}
                  onPress={() => setFilter(item)}
                >
                  <Text style={[styles.appointmentFilterText, filter === item && styles.appointmentFilterTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </View>

            <AppointmentTimeline
              emptyText={filter === 'Ближайшие' ? 'Ближайших записей пока нет' : 'История пока пуста'}
              error={error}
              groupedAppointments={groupedAppointments}
              loading={loading}
              onRetry={loadAppointments}
              perspective="partner"
              scale={scale}
              styles={styles}
            />
          </>
        )}
      </ScrollView>
      <AppBottomTabs active="Записи" onTab={onTab} scale={scale} styles={styles} />
    </ScreenLayout>
  );
}

function SalonScheduleGrid({
  appointments,
  error,
  loading,
  masters,
  onRetry,
  onSelectDate,
  partner,
  scale,
  selectedDate,
  styles,
}) {
  if (loading) {
    return (
      <View style={styles.appointmentStateCard}>
        <ActivityIndicator color={brandPink} size="small" />
        <Text style={styles.appointmentStateText}>Загружаем расписание...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.appointmentStateCard}>
        <Text style={styles.appointmentStateTitle}>Журнал не загрузился</Text>
        <Text style={styles.appointmentStateText}>{error}</Text>
        <Pressable style={styles.profileRetryButton} onPress={onRetry}>
          <Text style={styles.profileRetryButtonText}>Повторить</Text>
        </Pressable>
      </View>
    );
  }

  const inferredMasters = appointments.reduce((result, appointment) => {
    if (!appointment.masterId || masters.some((master) => master.id === appointment.masterId)) return result;
    if (!result.some((master) => master.id === appointment.masterId)) {
      result.push({ id: appointment.masterId, name: appointment.master || 'Мастер' });
    }
    return result;
  }, []);
  const displayMasters = [...masters, ...inferredMasters];

  if (!displayMasters.length) {
    return (
      <View style={styles.appointmentStateCard}>
        <Ionicons color={brandPink} name="people-outline" size={34 * scale} />
        <Text style={styles.appointmentStateTitle}>Сначала добавьте мастеров</Text>
        <Text style={styles.appointmentStateText}>
          Колонки журнала появятся после привязки мастера к салону.
        </Text>
      </View>
    );
  }

  const dateOptions = buildScheduleDateOptions(appointments);
  const openMinutes = clockToMinutes(partner?.openTime || '09:00');
  const requestedClose = clockToMinutes(partner?.closeTime || '19:00');
  const closeMinutes = requestedClose > openMinutes ? requestedClose : openMinutes + 10 * 60;
  const slots = buildScheduleTimeSlots(openMinutes, closeMinutes);
  const rowHeight = 48 * scale;
  const columnWidth = 156 * scale;
  const headerHeight = 76 * scale;
  const gridHeight = slots.length * rowHeight;
  const gridWidth = displayMasters.length * columnWidth;
  const dayAppointments = appointments.filter((appointment) => appointment.date === selectedDate);

  const positionedAppointments = dayAppointments
    .map((appointment) => {
      const masterIndex = displayMasters.findIndex(
        (master) => master.id === appointment.masterId || master.name === appointment.master,
      );
      const start = clockToMinutes(appointment.time);
      const duration = parseAppointmentDuration(appointment.duration);
      if (masterIndex < 0 || start < openMinutes || start >= closeMinutes) return null;
      const top = ((start - openMinutes) / 30) * rowHeight + 3 * scale;
      const availableHeight = gridHeight - top;
      const height = Math.min(
        Math.max((duration / 30) * rowHeight - 6 * scale, 40 * scale),
        availableHeight,
      );
      return { appointment, duration, height, masterIndex, start, top };
    })
    .filter(Boolean);

  const slotIsOccupied = (masterIndex, slotMinute) =>
    positionedAppointments.some(
      (entry) =>
        entry.masterIndex === masterIndex &&
        slotMinute >= entry.start &&
        slotMinute < entry.start + entry.duration,
    );

  return (
    <View style={styles.salonScheduleSection}>
      <View style={styles.salonScheduleToolbar}>
        <View>
          <Text style={styles.salonScheduleTitle}>{formatScheduleDateTitle(selectedDate)}</Text>
          <Text style={styles.salonScheduleSubtitle}>
            {dayAppointments.length ? `${dayAppointments.length} ${pluralizeRecords(dayAppointments.length)}` : 'Записей нет'}
          </Text>
        </View>
        <View style={styles.salonScheduleLegend}>
          <View style={styles.salonScheduleLegendDot} />
          <Text style={styles.salonScheduleLegendText}>запись</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.salonScheduleDateRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {dateOptions.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.salonScheduleDateChip,
              selectedDate === option.value && styles.salonScheduleDateChipActive,
            ]}
            onPress={() => onSelectDate(option.value)}
          >
            <Text style={[
              styles.salonScheduleDateWeekday,
              selectedDate === option.value && styles.salonScheduleDateTextActive,
            ]}>
              {option.weekday}
            </Text>
            <Text style={[
              styles.salonScheduleDateNumber,
              selectedDate === option.value && styles.salonScheduleDateTextActive,
            ]}>
              {option.day}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.salonScheduleBoard}>
        <View style={styles.salonScheduleTimeRail}>
          <View style={[styles.salonScheduleTimeHeader, { height: headerHeight }]}>
            <Ionicons color="#9698a0" name="time-outline" size={16 * scale} />
            <Text style={styles.salonScheduleTimeHeaderText}>Время</Text>
          </View>
          {slots.map((slot) => (
            <View key={slot.label} style={[styles.salonScheduleTimeCell, { height: rowHeight }]}>
              <Text allowFontScaling={false} style={styles.salonScheduleTimeLabel}>{slot.label}</Text>
            </View>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator persistentScrollbar>
          <View style={{ width: gridWidth }}>
            <View style={[styles.salonScheduleMasterHeader, { height: headerHeight }] }>
              {displayMasters.map((master) => (
                <View key={master.id} style={[styles.salonScheduleMasterCell, { width: columnWidth }] }>
                  <View style={styles.salonScheduleMasterAvatar}>
                    <Text style={styles.salonScheduleMasterAvatarText}>{getInitials(master.name)}</Text>
                  </View>
                  <Text numberOfLines={1} style={styles.salonScheduleMasterName}>{master.name}</Text>
                  <Text style={styles.salonScheduleMasterRole}>Мастер</Text>
                </View>
              ))}
            </View>

            <View style={[styles.salonScheduleCanvas, { height: gridHeight, width: gridWidth }] }>
              {displayMasters.flatMap((master, masterIndex) =>
                slots.map((slot, slotIndex) => {
                  const occupied = slotIsOccupied(masterIndex, slot.minutes);
                  return (
                    <View
                      key={`${master.id}-${slot.label}`}
                      style={[
                        styles.salonScheduleFreeCell,
                        {
                          height: rowHeight,
                          left: masterIndex * columnWidth,
                          top: slotIndex * rowHeight,
                          width: columnWidth,
                        },
                      ]}
                    >
                      {!occupied ? (
                        <Text style={styles.salonScheduleFreeText}>
                          {slotIndex % 2 === 0 ? 'свободно' : '+'}
                        </Text>
                      ) : null}
                    </View>
                  );
                }),
              )}

              {positionedAppointments.map(({ appointment, duration, height, masterIndex, start, top }) => (
                <Pressable
                  key={appointment.id}
                  style={[
                    styles.salonScheduleEvent,
                    styles[`salonScheduleEvent${appointment.statusTone}`],
                    {
                      height,
                      left: masterIndex * columnWidth + 4 * scale,
                      top,
                      width: columnWidth - 8 * scale,
                    },
                  ]}
                  onPress={() => Alert.alert(
                    appointment.client?.name || 'Клиент',
                    `${appointment.time}–${minutesToClock(start + duration)} • ${appointment.service}`,
                  )}
                >
                  <Text allowFontScaling={false} numberOfLines={1} style={styles.salonScheduleEventTime}>
                    {appointment.time}–{minutesToClock(start + duration)}
                  </Text>
                  <Text numberOfLines={1} style={styles.salonScheduleEventClient}>
                    {appointment.client?.name || 'Клиент'}
                  </Text>
                  {height >= 65 * scale ? (
                    <Text numberOfLines={2} style={styles.salonScheduleEventService}>
                      {appointment.service}
                    </Text>
                  ) : null}
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function AppointmentTimeline({
  emptyText,
  error,
  groupedAppointments,
  loading,
  onOpenSalon,
  onRetry,
  perspective = 'client',
  scale,
  styles,
}) {
  if (loading) {
    return (
      <View style={styles.appointmentStateCard}>
        <ActivityIndicator color={brandPink} size="small" />
        <Text style={styles.appointmentStateText}>Загружаем записи...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.appointmentStateCard}>
        <Text style={styles.appointmentStateTitle}>Записи не загрузились</Text>
        <Text style={styles.appointmentStateText}>{error}</Text>
        <Pressable style={styles.profileRetryButton} onPress={onRetry}>
          <Text style={styles.profileRetryButtonText}>Повторить</Text>
        </Pressable>
      </View>
    );
  }

  if (!groupedAppointments.length) {
    return (
      <View style={styles.appointmentStateCard}>
        <Ionicons color={brandPink} name="calendar-outline" size={34 * scale} />
        <Text style={styles.appointmentStateTitle}>{emptyText}</Text>
        <Text style={styles.appointmentStateText}>
          Новые записи появятся здесь с точной датой и временем.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.appointmentTimeline}>
      {groupedAppointments.map((group) => (
        <View key={group.date} style={styles.appointmentDayGroup}>
          <View style={styles.appointmentDayHeader}>
            <View>
              <Text style={styles.appointmentDayTitle}>{formatAppointmentDayHeading(group.date)}</Text>
              <Text style={styles.appointmentDaySubtitle}>Расписание по времени</Text>
            </View>
            <View style={styles.appointmentDayCountBadge}>
              <Ionicons color={brandPink} name="calendar-outline" size={14 * scale} />
              <Text style={styles.appointmentDayCount}>{group.items.length}</Text>
            </View>
          </View>
          <View style={styles.calendarColumnHeader}>
            <Text style={styles.calendarColumnTime}>Время</Text>
            <View style={styles.calendarColumnAxisSpace} />
            <Text style={styles.calendarColumnEvents}>Записи</Text>
          </View>
          {group.items.map((item, index) => (
            <View key={item.id} style={styles.calendarEventRow}>
              <View style={styles.calendarTimeGutter}>
                <Text allowFontScaling={false} numberOfLines={1} style={styles.calendarTimeText}>
                  {item.time}
                </Text>
                <Text allowFontScaling={false} numberOfLines={1} style={styles.calendarDurationText}>
                  {item.duration || '—'}
                </Text>
              </View>
              <View style={styles.calendarAxis}>
                <View style={[styles.calendarAxisDot, styles[`calendarAxisDot${item.statusTone}`]]} />
                {index < group.items.length - 1 ? <View style={styles.calendarAxisLine} /> : null}
              </View>
              <Pressable
                style={[styles.calendarEventCard, styles[`calendarEvent${item.statusTone}`]]}
                onPress={() => {
                  if (perspective === 'client' && item.salon && onOpenSalon) onOpenSalon(item.salon);
                }}
              >
                <View style={styles.calendarEventTop}>
                  <Text numberOfLines={2} style={styles.calendarEventService}>{item.service}</Text>
                  <View style={[styles.calendarStatusPill, styles[`appointmentStatus${item.statusTone}`]]}>
                    <Text
                      adjustsFontSizeToFit
                      allowFontScaling={false}
                      minimumFontScale={0.72}
                      numberOfLines={1}
                      style={[styles.calendarStatusText, styles[`appointmentStatusText${item.statusTone}`]]}
                    >
                      {item.statusLabel}
                    </Text>
                  </View>
                </View>
                <Text numberOfLines={1} style={styles.calendarEventPlace}>
                  {perspective === 'partner'
                    ? item.client?.name || 'Клиент'
                    : item.place || 'Частный мастер'}
                </Text>
                <View style={styles.calendarEventMetaRow}>
                  <Ionicons color="#777982" name={perspective === 'partner' ? 'call-outline' : 'person-outline'} size={14 * scale} />
                  <Text numberOfLines={1} style={styles.calendarEventMeta}>
                    {perspective === 'partner'
                      ? formatDisplayPhone(item.client?.phone)
                      : item.master || 'Мастер не указан'}
                  </Text>
                </View>
                <View style={styles.calendarEventFooter}>
                  <Text numberOfLines={1} style={styles.calendarEventPrice}>
                    {item.price || 'Цена не указана'}
                  </Text>
                  <View style={styles.calendarReminderRow}>
                    <Ionicons color={brandPink} name="notifications-outline" size={13 * scale} />
                    <Text style={styles.calendarReminderText}>Напоминание включено</Text>
                  </View>
                </View>
              </Pressable>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function ClientAppointmentsScreen({ onOpenSalon, onTab, scale, styles }) {
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState('Активные');
  const [appointmentsData, setAppointmentsData] = useState(null);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState('');
  const openStub = (title, description = 'Раздел будет подключен следующим этапом.') =>
    setModal({ description, title, type: 'stub' });
  const appointments = appointmentsData?.appointments || [];
  const visibleAppointments = appointments.filter((item) =>
    filter === 'Активные' ? item.group === 'active' : item.group === 'history',
  );
  const groupedAppointments = groupAppointmentsByDate(visibleAppointments);
  const nextAppointment = appointmentsData?.nextAppointment;
  const stats = appointmentsData?.stats || { active: 0, confirmed: 0, history: 0, totalAmount: 0 };

  const loadAppointments = async () => {
    setAppointmentsLoading(true);
    setAppointmentsError('');

    try {
      const query = await getStoredClientQuery();
      const data = await getJson(`/api/appointments/client${query}`);
      setAppointmentsData(data);
      if (data.client?.id) await AsyncStorage.setItem(CLIENT_ID_STORAGE_KEY, data.client.id);
      if (data.client?.phone) await AsyncStorage.setItem(CLIENT_PHONE_STORAGE_KEY, data.client.phone);
    } catch (error) {
      setAppointmentsError(error.message);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  return (
    <ScreenLayout styles={styles}>
      <ScrollView
        contentContainerStyle={styles.appointmentsContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.appointmentsHeader}>
          <View>
            <Text style={styles.appointmentsTitle}>Записи</Text>
            <Text style={styles.appointmentsSubtitle}>Активные процедуры клиента</Text>
          </View>
          <Pressable style={styles.appointmentsHeaderButton} onPress={() => openStub('Календарь', 'Синхронизацию с календарем добавим позже.')}>
            <Ionicons color={brandPink} name="calendar-outline" size={24 * scale} />
          </Pressable>
        </View>

        <View style={styles.appointmentSummaryCard}>
          <View style={styles.appointmentSummaryIcon}>
            <Ionicons color={brandPink} name="sparkles-outline" size={28 * scale} />
          </View>
          <View style={styles.appointmentSummaryText}>
            <Text style={styles.appointmentSummaryTitle}>Следующая запись</Text>
            <Text style={styles.appointmentSummaryMeta}>
              {nextAppointment
                ? `${formatAppointmentDate(nextAppointment.date)}, ${nextAppointment.time} • ${nextAppointment.service}`
                : appointmentsLoading
                  ? 'Загружаем ближайшее посещение...'
                  : 'Активных записей пока нет'}
            </Text>
          </View>
        </View>

        <View style={styles.appointmentStatsRow}>
          <View style={styles.appointmentStatCard}>
            <Text style={styles.appointmentStatValue}>{stats.active}</Text>
            <Text style={styles.appointmentStatLabel}>активные</Text>
          </View>
          <View style={styles.appointmentStatCard}>
            <Text style={styles.appointmentStatValue}>{stats.confirmed}</Text>
            <Text style={styles.appointmentStatLabel}>подтверждены</Text>
          </View>
          <View style={styles.appointmentStatCard}>
            <Text numberOfLines={1} adjustsFontSizeToFit style={styles.appointmentStatValue}>{formatMoney(stats.totalAmount)}</Text>
            <Text style={styles.appointmentStatLabel}>по услугам</Text>
          </View>
        </View>

        <View style={styles.appointmentFilterRow}>
          {['Активные', 'История'].map((item) => (
            <Pressable
              key={item}
              style={[styles.appointmentFilterChip, filter === item && styles.appointmentFilterChipActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.appointmentFilterText, filter === item && styles.appointmentFilterTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <AppointmentTimeline
          emptyText={filter === 'Активные' ? 'Активных записей пока нет' : 'История посещений пока пуста'}
          error={appointmentsError}
          groupedAppointments={groupedAppointments}
          loading={appointmentsLoading}
          onOpenSalon={onOpenSalon}
          onRetry={loadAppointments}
          scale={scale}
          styles={styles}
        />
      </ScrollView>

      <AppBottomTabs active="Записи" onTab={onTab} scale={scale} styles={styles} />
      <HomeModal
        city="Алматы"
        modal={modal}
        onCity={() => null}
        onClose={() => setModal(null)}
        scale={scale}
        styles={styles}
      />
    </ScreenLayout>
  );
}

function AppBottomTabs({ active, onTab, scale, styles }) {
  const tabs = [
    ['home-outline', 'Главная'],
    ['search-outline', 'Поиск'],
    ['calendar-outline', 'Записи'],
    ['people-outline', 'Сообщество'],
    ['person-outline', 'Профиль'],
  ];

  return (
    <View style={styles.bottomTabs}>
      {tabs.map(([icon, label]) => {
        const isActive = active === label;
        return (
          <Pressable key={label} style={styles.bottomTab} onPress={() => onTab(label)}>
            <Ionicons color={isActive ? brandPink : '#666872'} name={icon} size={25 * scale} />
            <Text style={[styles.bottomTabText, isActive && styles.bottomTabTextActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SearchScreen({ isAuthenticated, onBack, onOpenMaster, onOpenSalon, onRequireAuth, onTab, scale, styles }) {
  const [mode, setMode] = useState('Список');
  const [favorites, setFavorites] = useState({});
  const [favoriteResults, setFavoriteResults] = useState([]);
  const [favoritesError, setFavoritesError] = useState('');
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [filterModal, setFilterModal] = useState(null);
  const [filters, setFilters] = useState(defaultSearchFilters);
  const [query, setQuery] = useState('');
  const openStub = (title) => Alert.alert(title, 'Раздел кликабельный, данные подключим следующим этапом.');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredResults = searchResults.filter((item) => {
    const matchesQuery = !normalizedQuery ||
      [item.name, item.specialty, item.serviceGroup, item.district]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    return matchesQuery && matchesSearchFilters(item, filters);
  });
  const filteredMapPoints = astanaMapPoints.filter((item) => {
    const matchesQuery = !normalizedQuery ||
      [item.label, item.item.specialty, item.item.tags, item.serviceGroup, item.district]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    return matchesQuery && matchesSearchFilters(item, filters);
  });
  const hasActiveFilters = JSON.stringify(filters) !== JSON.stringify(defaultSearchFilters) || Boolean(normalizedQuery);
  const filteredFavorites = favoriteResults.filter((item) => {
    const matchesQuery = !normalizedQuery ||
      [item.name, item.specialty, item.serviceGroup, item.district, item.address]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
    return matchesQuery && matchesSearchFilters(item, filters);
  });
  const setFilterValue = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setFilterModal(null);
  };
  const resetFilters = () => {
    setFilters(defaultSearchFilters);
    setQuery('');
    setFilterModal(null);
  };
  const openFavorites = () => {
    if (!isAuthenticated) {
      onRequireAuth('search');
      return;
    }
    setMode('Избранное');
  };
  const loadFavorites = async () => {
    if (!isAuthenticated) {
      setFavorites({});
      setFavoriteResults([]);
      setFavoritesLoading(false);
      setFavoritesError('');
      return;
    }

    setFavoritesLoading(true);
    setFavoritesError('');

    try {
      const queryString = await getStoredClientQuery();
      const data = await getJson(`/api/favorites/client${queryString}`);
      const nextFavorites = {};
      const nextResults = (data.favorites || [])
        .map((favorite) => normalizeFavoriteSearchItem(favorite))
        .filter(Boolean);
      nextResults.forEach((item) => {
        nextFavorites[getFavoriteKey(item)] = true;
      });
      setFavorites(nextFavorites);
      setFavoriteResults(nextResults);
    } catch (error) {
      setFavoritesError(error.message);
      setFavorites({});
      setFavoriteResults([]);
    } finally {
      setFavoritesLoading(false);
    }
  };
  const toggleFavorite = async (item) => {
    if (!isAuthenticated) {
      onRequireAuth('search');
      return;
    }

    const key = getFavoriteKey(item);
    const wasFavorite = Boolean(favorites[key]);

    setFavorites((current) => ({ ...current, [key]: !wasFavorite }));
    if (wasFavorite) {
      setFavoriteResults((current) => current.filter((favorite) => getFavoriteKey(favorite) !== key));
    } else {
      setFavoriteResults((current) => [item, ...current.filter((favorite) => getFavoriteKey(favorite) !== key)]);
    }

    try {
      const identity = await getStoredClientIdentity();
      const result = await patchJson('/api/favorites/client', {
        ...identity,
        snapshot: buildFavoriteSnapshot(item),
        targetId: getFavoriteTargetId(item),
        targetType: item.kind === 'salon' ? 'salon' : 'master',
      });

      setFavorites((current) => ({ ...current, [key]: result.isFavorite }));
      if (!result.isFavorite) {
        setFavoriteResults((current) => current.filter((favorite) => getFavoriteKey(favorite) !== key));
      } else if (result.favorite) {
        const normalized = normalizeFavoriteSearchItem(result.favorite);
        if (normalized) {
          setFavoriteResults((current) => [normalized, ...current.filter((favorite) => getFavoriteKey(favorite) !== key)]);
        }
      }
    } catch (error) {
      setFavorites((current) => ({ ...current, [key]: wasFavorite }));
      setFavoriteResults((current) => {
        const withoutItem = current.filter((favorite) => getFavoriteKey(favorite) !== key);
        return wasFavorite ? [item, ...withoutItem] : withoutItem;
      });
      Alert.alert('Избранное', error.message);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [isAuthenticated]);

  return (
    <ScreenLayout styles={styles}>
      <ScrollView contentContainerStyle={styles.searchContent} showsVerticalScrollIndicator={false}>
        <View style={styles.searchHeader}>
          <Text style={styles.searchTitle}>Поиск</Text>
          <Pressable style={styles.mapLink} onPress={openFavorites}>
            <Ionicons color={brandPink} name="heart" size={22 * scale} />
            <Text style={styles.mapLinkText}>Избранное</Text>
          </Pressable>
        </View>

        <View style={styles.searchInputWide}>
          <Ionicons color="#a2a3a8" name="search-outline" size={25 * scale} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Мастер, услуга, салон..."
            placeholderTextColor="#8f8f95"
            style={styles.searchTextInput}
          />
          <View style={styles.searchDivider} />
          <Pressable hitSlop={10} onPress={hasActiveFilters ? resetFilters : () => setFilterModal('service')}>
            <Ionicons color={brandPink} name={hasActiveFilters ? 'close-circle-outline' : 'options-outline'} size={25 * scale} />
          </Pressable>
        </View>

        <View style={styles.filterRows}>
          <View style={styles.filterRow}>
            <FilterChip active={filters.city !== defaultSearchFilters.city} icon="location-outline" label={filters.city} onPress={() => setFilterModal('city')} scale={scale} styles={styles} />
            <FilterChip active={filters.district !== defaultSearchFilters.district} icon="business-outline" label={filters.district} onPress={() => setFilterModal('district')} scale={scale} styles={styles} />
            <FilterChip active={filters.service !== defaultSearchFilters.service} icon="briefcase-outline" label={filters.service} onPress={() => setFilterModal('service')} scale={scale} styles={styles} />
            <FilterChip active={filters.price !== defaultSearchFilters.price} icon="cash-outline" label={filters.price} onPress={() => setFilterModal('price')} scale={scale} styles={styles} />
            <FilterChip active={filters.rating !== defaultSearchFilters.rating} icon="star-outline" label={filters.rating} onPress={() => setFilterModal('rating')} scale={scale} styles={styles} />
          </View>
        </View>

        <View style={styles.segmented}>
          {['Список', 'Избранное'].map((item) => (
            <Pressable
              key={item}
              style={[styles.segment, mode === item && styles.segmentActive]}
              onPress={() => (item === 'Избранное' ? openFavorites() : setMode(item))}
            >
              <Text style={[styles.segmentText, mode === item && styles.segmentTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        {mode === 'Избранное' ? (
          <View style={styles.resultsSheet}>
            {!isAuthenticated ? (
              <AuthRequiredState
                onLogin={() => onRequireAuth('search')}
                scale={scale}
                styles={styles}
                text="Войдите, чтобы сохранять мастеров и салоны."
                title="Избранное доступно после входа"
              />
            ) : favoritesLoading ? (
              <View style={styles.emptySearchState}>
                <ActivityIndicator color={brandPink} size="small" />
                <Text style={styles.emptySearchText}>Загружаем избранное...</Text>
              </View>
            ) : favoritesError ? (
              <View style={styles.emptySearchState}>
                <Text style={styles.emptySearchTitle}>Избранное не загрузилось</Text>
                <Text style={styles.emptySearchText}>{favoritesError}</Text>
                <Pressable style={styles.profileRetryButton} onPress={loadFavorites}>
                  <Text style={styles.profileRetryButtonText}>Повторить</Text>
                </Pressable>
              </View>
            ) : filteredFavorites.length === 0 ? (
              <EmptySearchState mode="Избранное" styles={styles} />
            ) : filteredFavorites.map((item) => (
              <SearchResultCard
                favorite={Boolean(favorites[getFavoriteKey(item)])}
                item={item}
                key={getFavoriteKey(item)}
                onFavorite={() => toggleFavorite(item)}
                onPress={() => (item.kind === 'salon' ? onOpenSalon(item) : onOpenMaster(item))}
                scale={scale}
                styles={styles}
              />
            ))}
          </View>
        ) : (
          <View style={styles.resultsSheet}>
            {filteredResults.length === 0 ? (
              <EmptySearchState mode="Список" styles={styles} />
            ) : filteredResults.map((item) => (
              <SearchResultCard
                favorite={Boolean(favorites[getFavoriteKey(item)])}
                item={item}
                key={getFavoriteKey(item)}
                onFavorite={() => toggleFavorite(item)}
                onPress={() => (item.kind === 'salon' ? onOpenSalon(item) : onOpenMaster(item))}
                scale={scale}
                styles={styles}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <AppBottomTabs
        active="Поиск"
        onTab={onTab}
        scale={scale}
        styles={styles}
      />
      <SearchFilterModal
        activeFilter={filterModal}
        filters={filters}
        onClose={() => setFilterModal(null)}
        onReset={resetFilters}
        onSelect={setFilterValue}
        scale={scale}
        styles={styles}
      />
    </ScreenLayout>
  );
}

function FilterChip({ active, icon, label, onPress, scale, styles }) {
  return (
    <Pressable style={[styles.filterChip, active && styles.filterChipActive]} onPress={onPress}>
      {icon ? <Ionicons color={active ? brandPink : '#666872'} name={icon} size={19 * scale} /> : null}
      <Text numberOfLines={1} style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
      <Ionicons color={active ? brandPink : '#666872'} name="chevron-down" size={15 * scale} />
    </Pressable>
  );
}

function EmptySearchState({ mode, styles }) {
  return (
    <View style={styles.emptySearchState}>
      <Text style={styles.emptySearchTitle}>{mode === 'Избранное' ? 'Избранное пустое' : 'Ничего не найдено'}</Text>
      <Text style={styles.emptySearchText}>
        {mode === 'Избранное' ? 'Добавляйте мастеров и салоны через кнопку на карточке.' : 'Попробуйте изменить фильтры или запрос.'}
      </Text>
    </View>
  );
}

function AuthRequiredState({ onLogin, styles, text, title }) {
  return (
    <View style={styles.emptySearchState}>
      <Text style={styles.emptySearchTitle}>{title}</Text>
      <Text style={styles.emptySearchText}>{text}</Text>
      <Pressable style={styles.profileRetryButton} onPress={onLogin}>
        <Text style={styles.profileRetryButtonText}>Войти или зарегистрироваться</Text>
      </Pressable>
    </View>
  );
}

function SearchFilterModal({ activeFilter, filters, onClose, onReset, onSelect, scale, styles }) {
  if (!activeFilter) return null;
  const options = searchFilterOptions[activeFilter] || [];

  return (
    <Modal animationType="fade" transparent visible>
      <Pressable style={styles.homeModalOverlay} onPress={onClose}>
        <Pressable style={styles.searchFilterSheet}>
          <View style={styles.searchFilterHeader}>
            <Text style={styles.homeModalTitle}>{searchFilterTitles[activeFilter]}</Text>
            <Pressable hitSlop={8} onPress={onReset}>
              <Text style={styles.searchFilterReset}>Сбросить</Text>
            </Pressable>
          </View>
          {options.map((item) => {
            const selected = filters[activeFilter] === item;
            return (
              <Pressable
                key={item}
                style={styles.homeModalOption}
                onPress={() => onSelect(activeFilter, item)}
              >
                <Text style={[styles.homeModalOptionText, selected && styles.searchFilterOptionActive]}>{item}</Text>
                {selected ? <Ionicons color={brandPink} name="checkmark" size={22 * scale} /> : null}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SearchResultCard({ favorite, item, onFavorite, onPress, scale, styles }) {
  const photos = item.photos || [searchSalonPhotos[0], searchSalonPhotos[1]];

  return (
    <Pressable style={styles.searchResultCard} onPress={onPress}>
      <View style={styles.searchPhotoSlider}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {photos.map((photo, index) => (
            <Image key={`${item.name}-photo-${index}`} source={mediaSource(photo)} style={styles.searchPlaceImage} />
          ))}
        </ScrollView>
        <Pressable style={styles.searchBookmark} onPress={onFavorite}>
          <Ionicons color="#fff" name={favorite ? 'heart' : 'heart-outline'} size={25 * scale} />
        </Pressable>
        <View style={styles.searchPhotoDots}>
          {photos.map((_, index) => (
            <View key={`${item.name}-dot-${index}`} style={[styles.searchPhotoDot, index === 0 && styles.searchPhotoDotActive]} />
          ))}
        </View>
      </View>

      <View style={styles.searchPlaceInfo}>
        <Text numberOfLines={1} style={styles.searchPlaceName}>{item.name}</Text>
        <View style={styles.searchPlaceMetaRow}>
          <Text style={styles.searchPlaceRating}>{item.rating}</Text>
          <Ionicons color={brandPink} name="star" size={15 * scale} />
          <Ionicons color="#a1a1a8" name="location" size={16 * scale} />
          <Text numberOfLines={1} style={styles.searchPlaceAddress}>{item.address || item.district}</Text>
          <Text style={styles.searchPlaceDistance}>{item.distance}</Text>
        </View>
      </View>

      <View style={styles.scheduleBlock}>
        <Text numberOfLines={1} style={styles.scheduleTitle}>{item.scheduleTitle || item.serviceGroup}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scheduleSlots}>
          {(item.slots || ['11:00', '13:00', '15:00']).map((slot) => (
            <Pressable key={`${item.name}-${slot}`} style={styles.scheduleSlot} onPress={onPress}>
              <Text style={styles.scheduleSlotText}>{slot}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable style={styles.scheduleLink} onPress={onPress}>
          <Text style={styles.scheduleLinkText}>Расписание</Text>
          <Ionicons color={brandPink} name="chevron-forward" size={18 * scale} />
        </Pressable>
      </View>
    </Pressable>
  );
}

function MasterDetailScreen({ item, onBack, onBook, scale, styles }) {
  const heroImage = item.photos?.[0] || item.image;
  const bookingDates = buildBookingDates();
  const services = [
    { duration: '60 мин', name: 'LPG массаж тела', price: '3 000 ₸' },
    { duration: '45 мин', name: 'RF-лифтинг', price: '2 500 ₸' },
  ];
  const times = item.slots?.length ? item.slots : ['09:00', '10:00', '11:00', '12:00', '13:00'];
  const [bookedTimes, setBookedTimes] = useState([]);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(bookingDates[0].value);
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState(item.slots?.[0] || '10:00');
  const selectedService = services[selectedServiceIndex];
  const serviceImages = [
    'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=500&q=80',
  ];

  useEffect(() => {
    setSelectedServiceIndex(0);
    setSelectedTime(times[0]);
  }, [item.id]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      date: selectedDate,
      masterName: item.name || '',
    });
    if (item.id) params.set('masterId', item.id);

    getJson(`/api/appointments/availability?${params.toString()}`)
      .then((result) => {
        if (!active) return;
        const nextBookedTimes = result.bookedTimes || [];
        setBookedTimes(nextBookedTimes);
        setSelectedTime((current) =>
          nextBookedTimes.includes(current)
            ? times.find((time) => !nextBookedTimes.includes(time)) || current
            : current,
        );
      })
      .catch(() => {
        if (active) setBookedTimes([]);
      });

    return () => {
      active = false;
    };
  }, [item.id, item.name, selectedDate]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.detailShell}>
      <ScrollView contentContainerStyle={styles.detailScrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.masterHero}>
          <Image source={mediaSource(heroImage)} style={styles.masterHeroImage} />
          <View style={styles.detailHeroScrim} />
          <TopFloatingActions onBack={onBack} scale={scale} styles={styles} />
          <View style={styles.masterHeroInfo}>
            <View style={styles.verifiedBadge}>
              <Ionicons color={brandPink} name="shield-checkmark" size={15 * scale} />
              <Text style={styles.verifiedText}>Проверенный мастер</Text>
            </View>
            <Text numberOfLines={1} style={styles.detailName}>{item.name}</Text>
            <Text style={styles.detailSub}>{item.specialty || item.serviceGroup} • {item.address || 'Астана'}</Text>
            <View style={styles.inlineRating}>
              <Ionicons color={brandPink} name="star" size={17 * scale} />
              <Text style={styles.inlineRatingText}>{item.rating || '4.9'} (128 отзывов)</Text>
            </View>
            <Text style={styles.experienceText}>Ближайшее время: {item.slots?.[0] || '10:00'} • {item.price || 'от 2 500 ₽'}</Text>
          </View>
        </View>

        <StatsRow
          items={[
            ['cash-outline', item.price, 'Стоимость'],
            ['star-outline', item.rating || '4.9', 'Рейтинг'],
            ['people-outline', '320+', 'Клиентов'],
            ['location-outline', item.district || 'Есиль', 'Район'],
          ]}
          scale={scale}
          styles={styles}
        />
        <MediaStrip styles={styles} scale={scale} />
        <DetailSection title="О себе" link="Читать далее" styles={styles}>
          <Text style={styles.detailParagraph}>
            Сертифицированный специалист по коррекции фигуры и аппаратным методикам. Помогаю клиентам достигать желаемых результатов безопасно и эффективно.
          </Text>
        </DetailSection>
        <CertificatesRow styles={styles} />
        <ReviewBlock styles={styles} scale={scale} />
        <DetailSection title="Услуги и цены" link="Смотреть все" styles={styles}>
          {services.map((service, index) => (
            <Pressable
              key={service.name}
              style={[styles.serviceRow, selectedServiceIndex === index && styles.serviceRowSelected]}
              onPress={() => setSelectedServiceIndex(index)}
            >
              <Image source={{ uri: serviceImages[index] }} style={styles.serviceThumb} />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDuration}>◷ {service.duration}</Text>
              </View>
              <Text style={styles.servicePrice}>{service.price}</Text>
              <View style={[styles.servicePlus, selectedServiceIndex === index && styles.servicePlusSelected]}>
                <Ionicons
                  color="#fff"
                  name={selectedServiceIndex === index ? 'checkmark' : 'add'}
                  size={19 * scale}
                />
              </View>
            </Pressable>
          ))}
        </DetailSection>
      </ScrollView>
      <BookingBar
        bookedTimes={bookedTimes}
        dates={bookingDates}
        duration={selectedService.duration}
        loading={bookingSubmitting}
        onBook={async () => {
          if (bookingSubmitting) return;
          setBookingSubmitting(true);
          try {
            await onBook(item, {
              date: selectedDate,
              duration: selectedService.duration,
              price: selectedService.price,
              serviceName: selectedService.name,
              time: selectedTime,
            });
          } catch (error) {
            Alert.alert('Не удалось записаться', error.message);
          } finally {
            setBookingSubmitting(false);
          }
        }}
        onSelectDate={setSelectedDate}
        onSelectTime={setSelectedTime}
        price={selectedService.price}
        scale={scale}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        styles={styles}
        times={times}
      />
    </SafeAreaView>
  );
}

function SalonDetailScreen({ item, onBack, onOpenMaster, scale, styles }) {
  const salonPhotos = item.photos || searchSalonPhotos;
  const firstPhoto = salonPhotos[0] || item.image;
  const salonMasters = item.masters || [];
  const [selectedMasterId, setSelectedMasterId] = useState(null);
  const selectedMaster = salonMasters.find((master) => master.id === selectedMasterId) || null;

  useEffect(() => {
    setSelectedMasterId(null);
  }, [item.id]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.detailShell}>
      <ScrollView contentContainerStyle={styles.salonDetailScrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.salonHero}>
          <Image source={mediaSource(firstPhoto)} style={styles.salonHeroImage} />
          <View style={styles.detailHeroScrim} />
          <TopFloatingActions onBack={onBack} scale={scale} styles={styles} />
        </View>

        <View style={styles.salonInfoCard}>
          <View style={styles.salonLogoCircle}>
            <Text style={styles.salonLogoText}>XSIZE</Text>
            <Text style={styles.salonLogoMini}>PREMIUM</Text>
          </View>
          <View style={styles.salonInfoCopy}>
            <View style={styles.nameWithBadge}>
              <Text numberOfLines={1} style={styles.detailName}>{item.name}</Text>
              <Ionicons color={brandPink} name="shield-checkmark" size={18 * scale} />
            </View>
            <Text style={styles.detailSub}>{item.tags || 'Салон красоты • SPA'}</Text>
            <View style={styles.inlineRating}>
              <Ionicons color={brandPink} name="star" size={17 * scale} />
              <Text style={styles.inlineRatingText}>{item.rating || '4.9'} (256 отзывов)</Text>
            </View>
          </View>
        </View>

        <StatsRow
          items={[
            ['location-outline', item.address || 'Адрес не указан', item.city || 'Город'],
            ['time-outline', item.workDays || 'Ежедневно', `${item.openTime || '10:00'} - ${item.closeTime || '22:00'}`],
            ['call-outline', formatDisplayPhone(item.phone) || 'Номер не указан', 'Позвонить'],
            ['navigate-outline', item.distance || '1,2 км', 'От вас'],
          ]}
          scale={scale}
          styles={styles}
        />
        <DetailSection title="Рабочее время" styles={styles}>
          <View style={styles.salonWorkingHoursCard}>
            <View style={styles.salonWorkingHoursIcon}>
              <Ionicons color={brandPink} name="time-outline" size={23 * scale} />
            </View>
            <View style={styles.salonWorkingHoursCopy}>
              <Text style={styles.salonWorkingHoursTitle}>
                {item.workDays || 'Ежедневно'} • {item.openTime || '10:00'}–{item.closeTime || '22:00'}
              </Text>
              <Text style={styles.salonWorkingHoursHint}>
                Точную дату и время вы выерете один раз после выбора мастера.
              </Text>
            </View>
          </View>
        </DetailSection>
        <MediaStrip images={salonPhotos} styles={styles} scale={scale} />
        <DetailSection title="О салоне" link="Читать подробнее" styles={styles}>
          <Text style={styles.detailParagraph}>
            {item.description || `${item.name} — пространство красоты и ухода в городе ${item.city || 'Алматы'}.`}
          </Text>
        </DetailSection>
        <DetailSection title="Услуги и цены" link="Все услуги" styles={styles}>
          <View style={styles.serviceGrid}>
            {['Чистка лица', 'LPG массаж', 'Массаж тела', 'RF-лифтинг тела'].map((name, index) => (
              <View key={name} style={styles.salonServiceCard}>
                <Image source={heroSlides[index % heroSlides.length].image} style={styles.salonServiceImage} />
                <Text numberOfLines={1} style={styles.serviceName}>{name}</Text>
                <Text style={styles.serviceDuration}>◷ {index === 3 ? '45' : '60'} мин</Text>
                <Text style={styles.servicePrice}>{['3 500 ₸', '3 000 ₸', '2 800 ₸', '4 500 ₸'][index]}</Text>
              </View>
            ))}
          </View>
        </DetailSection>
        <DetailSection title="Мастера салона" link="Все мастера" styles={styles}>
          {salonMasters.length ? (
            <>
              <Text style={styles.salonMasterInstruction}>Выберите мастера для записи</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.homeCardsRow}>
                  {salonMasters.map((master) => (
                    <MasterHomeCard
                      favorite={false}
                      item={master}
                      key={master.id}
                      onFavorite={() => Alert.alert('Избранное', 'Мастер добавлен в избранное.')}
                      onPress={() => setSelectedMasterId(master.id)}
                      scale={scale}
                      selected={selectedMasterId === master.id}
                      styles={styles}
                    />
                  ))}
                </View>
              </ScrollView>
              {selectedMaster ? (
                <View style={styles.salonSelectedMaster}>
                  <Ionicons color="#24a45a" name="checkmark-circle" size={21 * scale} />
                  <Text style={styles.salonSelectedMasterText}>Выбран: {selectedMaster.name}</Text>
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.salonNoMastersCard}>
              <Ionicons color="#a3a4ab" name="people-outline" size={28 * scale} />
              <Text style={styles.salonNoMastersText}>Салон ещё не добавил мастеров</Text>
            </View>
          )}
        </DetailSection>
        <ReviewBlock styles={styles} scale={scale} />
      </ScrollView>
      <View style={styles.salonBottomBar}>
        <Pressable
          disabled={!selectedMaster}
          style={[styles.salonBookButton, !selectedMaster && styles.salonBookButtonDisabled]}
          onPress={() => selectedMaster && onOpenMaster(selectedMaster)}
        >
          <LinearGradient
            colors={[softPink, brandPink]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.salonBookGradient}
          >
            <Text style={styles.salonBookButtonText}>
              {selectedMaster ? `Записаться к ${selectedMaster.name}` : 'Сначала выберите мастера'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function TopFloatingActions({ onBack, scale, styles }) {
  return (
    <View style={styles.detailActionsTop}>
      <Pressable style={styles.roundAction} onPress={onBack}>
        <Ionicons color={darkText} name="arrow-back" size={24 * scale} />
      </Pressable>
      <View style={styles.detailActionsRight}>
        <Pressable style={styles.roundAction} onPress={() => Alert.alert('Поделиться', 'Ссылка будет сформирована позже.')}>
          <Ionicons color={darkText} name="share-outline" size={23 * scale} />
        </Pressable>
        <Pressable style={styles.roundAction} onPress={() => Alert.alert('Избранное', 'Добавлено в избранное.')}>
          <Ionicons color={darkText} name="heart-outline" size={25 * scale} />
        </Pressable>
      </View>
    </View>
  );
}

function StatsRow({ items, scale, styles }) {
  return (
    <View style={styles.statsRow}>
      {items.map(([icon, value, label]) => (
        <Pressable key={`${value}-${label}`} style={styles.statItem} onPress={() => Alert.alert(value, label)}>
          <View style={styles.statIcon}>
            <Ionicons color={brandPink} name={icon} size={22 * scale} />
          </View>
          <Text numberOfLines={1} style={styles.statValue}>{value}</Text>
          <Text numberOfLines={1} style={styles.statLabel}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function MediaStrip({ images: providedImages, scale, styles }) {
  const images = providedImages || [
    popularMasters[0].image,
    'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=500&q=80',
    topSalons[0].image,
  ];
  return (
    <ScrollView contentContainerStyle={styles.mediaStrip} horizontal showsHorizontalScrollIndicator={false}>
      <Pressable style={styles.videoTile} onPress={() => Alert.alert('Видео', 'Видео будет открываться здесь.')}>
        <Image source={mediaSource(images[0])} style={styles.mediaImage} />
        <View style={styles.videoOverlay} />
        <Ionicons color="#fff" name="play" size={28 * scale} />
        <Text style={styles.videoText}>Смотреть видео</Text>
      </Pressable>
      {images.slice(1).map((image, index) => (
        <Pressable key={`media-${index}`} style={styles.mediaTile} onPress={() => Alert.alert('Галерея', `Фото ${index + 1}`)}>
          <Image source={mediaSource(image)} style={styles.mediaImage} />
        </Pressable>
      ))}
      <Pressable style={styles.moreMediaTile} onPress={() => Alert.alert('Галерея', 'Открыть все фото.')}>
        <Image source={mediaSource(images[2] || images[0])} style={styles.mediaImage} />
        <View style={styles.videoOverlay} />
        <Text style={styles.moreMediaText}>+8</Text>
      </Pressable>
    </ScrollView>
  );
}

function DetailSection({ children, link, styles, title }) {
  return (
    <View style={styles.detailSection}>
      <View style={styles.detailSectionHeader}>
        <Text style={styles.detailSectionTitle}>{title}</Text>
        {link ? (
          <Pressable onPress={() => Alert.alert(link, 'Раздел откроется после подключения данных.')}>
            <Text style={styles.detailSectionLink}>{link}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function CertificatesRow({ styles }) {
  return (
    <DetailSection title="Сертификаты" link="Смотреть все" styles={styles}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.certificatesRow}>
          {['#ffe3ea', '#fff0d9', '#f6eadb', '#ebe5ff'].map((color, index) => (
            <Pressable key={color} style={[styles.certificateCard, { backgroundColor: color }]} onPress={() => Alert.alert('Сертификат', `Сертификат ${index + 1}`)}>
              <Text style={styles.certificateText}>СЕРТИФИКАТ</Text>
              <Text style={styles.certificateName}>Анна Смирнова</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </DetailSection>
  );
}

function ReviewBlock({ scale, styles }) {
  return (
    <DetailSection title="Отзывы" link="Смотреть все" styles={styles}>
      <Pressable style={styles.reviewCard} onPress={() => Alert.alert('Отзыв', 'Полный отзыв откроется позже.')}>
        <View style={styles.reviewHeader}>
          <Image source={{ uri: popularMasters[2].image }} style={styles.reviewAvatar} />
          <View style={styles.reviewNameBlock}>
            <Text style={styles.reviewName}>Мария Иванова</Text>
            <Text style={styles.reviewStars}>★★★★★ 5.0</Text>
          </View>
          <Text style={styles.reviewDate}>12 мая 2024</Text>
        </View>
        <Text style={styles.reviewText}>
          Анна настоящий профессионал! После курса LPG массажа фигура стала заметно подтянутой, кожа более упругой.
        </Text>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=500&q=80' }} style={styles.reviewImage} />
      </Pressable>
    </DetailSection>
  );
}

function BookingBar({
  bookedTimes = [],
  dates,
  duration,
  loading,
  onBook,
  onSelectDate,
  onSelectTime,
  price,
  scale,
  selectedDate,
  selectedTime,
  styles,
  times,
}) {
  return (
    <View style={styles.bookingBar}>
      <Text style={styles.bookingTitle}>Выберите дату и время</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.dateRow}>
          {dates.map((day) => (
            <Pressable
              key={day.value}
              style={[styles.dateChip, selectedDate === day.value && styles.dateChipActive]}
              onPress={() => onSelectDate(day.value)}
            >
              <Text style={styles.dateChipText}>{day.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.timeRow}>
          {times.map((time) => (
            <Pressable
              disabled={bookedTimes.includes(time)}
              key={time}
              style={[
                styles.timeChip,
                selectedTime === time && styles.timeChipActive,
                bookedTimes.includes(time) && styles.timeChipDisabled,
              ]}
              onPress={() => onSelectTime(time)}
            >
              <Text
                style={[
                  styles.timeChipText,
                  selectedTime === time && styles.timeChipTextActive,
                  bookedTimes.includes(time) && styles.timeChipTextDisabled,
                ]}
              >
                {time}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <View style={styles.bookingBottomRow}>
        <View>
          <Text style={styles.bookingTotal}>Итого: {price}</Text>
          <Text style={styles.bookingSub}>1 услуга • {duration}</Text>
        </View>
        <Pressable
          disabled={loading || bookedTimes.includes(selectedTime)}
          style={[
            styles.bookingButton,
            (loading || bookedTimes.includes(selectedTime)) && styles.primaryButtonDisabled,
          ]}
          onPress={onBook}
        >
          {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.bookingButtonText}>Записаться</Text>}
        </Pressable>
      </View>
    </View>
  );
}

function buildBookingDates() {
  const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + index);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return {
      label: `${weekdays[date.getDay()]}\n${date.getDate()}\n${months[date.getMonth()]}`,
      value: `${year}-${month}-${day}`,
    };
  });
}

function LoginPhoneScreen({ agreement, onBack, onContinue, onLegal, personalData, phone, scale, styles, updateForm }) {
  return (
    <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.registrationScreen}
    >
      <ProgressHeader step={1} styles={styles} total={2} />
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>Вход</Text>
        <Text style={styles.stepSubtitle}>
          Укажите номер телефона,{'\n'}чтобы получить код
        </Text>

        <Text style={styles.fieldLabel}>Номер телефона</Text>
        <MaskedPhoneField
          phone={phone}
          scale={scale}
          styles={styles}
          updatePhone={(value) => updateForm('phone', value)}
        />
        <View style={styles.securityRow}>
          <Ionicons color="#9a9aa0" name="lock-closed" size={16 * scale} />
          <Text style={styles.securityText}>Для теста используйте код 0000</Text>
        </View>
        <LegalConsentBlock
          agreement={agreement}
          onLegal={onLegal}
          personalData={personalData}
          scale={scale}
          styles={styles}
          updateConsent={updateForm}
        />
      </View>

      <View style={styles.registrationActions}>
        <GradientButton
          disabled={!agreement || !personalData}
          label="Получить код"
          onPress={() => {
            Keyboard.dismiss();
            onContinue();
          }}
          styles={styles}
        />
        <BackButton
          onPress={() => {
            Keyboard.dismiss();
            onBack();
          }}
          scale={scale}
          styles={styles}
        />
      </View>
    </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

function RegistrationScreen({
  form,
  onBack,
  onContinue,
  onLegal,
  scale,
  submitting,
  step,
  styles,
  updateForm,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo?.({ y: 0, animated: false });
  }, [step]);

  const content = (
    <>
      {step === 1 ? (
        <NameStep fullName={form.fullName} styles={styles} updateForm={updateForm} />
      ) : null}
      {step === 2 ? (
        <CityStep city={form.city} styles={styles} updateForm={updateForm} />
      ) : null}
      {step === 3 ? (
        <BirthGenderStep form={form} scale={scale} styles={styles} updateForm={updateForm} />
      ) : null}
      {step === 4 ? (
        <PhoneStep
          agreement={form.agreement}
          onLegal={onLegal}
          personalData={form.personalData}
          phone={form.phone}
          scale={scale}
          styles={styles}
          updateForm={updateForm}
        />
      ) : null}
      {step === 5 ? (
        <PhotosStep form={form} scale={scale} styles={styles} updateForm={updateForm} />
      ) : null}
    </>
  );

  const actions = (
    <View style={step === 5 ? styles.registrationActionsInline : styles.registrationActions}>
      <GradientButton
        disabled={submitting || (step === 4 && (!form.agreement || !form.personalData))}
        label={step === 5 ? 'Завершить регистрацию' : 'Продолжить'}
        loading={step === 5 && submitting}
        onPress={onContinue}
        styles={styles}
      />
      <BackButton onPress={onBack} scale={scale} styles={styles} />
    </View>
  );

  return (
    <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.registrationScreen}
    >
      <ProgressHeader step={step} styles={styles} />
      {step === 5 ? (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.clientPhotoScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {content}
          {actions}
        </ScrollView>
      ) : (
        <>
          {content}
          {actions}
        </>
      )}
    </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

function ProgressHeader({ step, styles, total = 5, variant }) {
  return (
    <View style={styles.progressHeader}>
      <View style={styles.progressBars}>
        {Array.from({ length: total }, (_, index) => index + 1).map((bar) => (
          <View
            key={bar}
            style={[
              styles.progressBar,
              variant === 'salon' && styles.salonProgressBar,
              bar <= Math.min(step, total) && styles.progressBarActive,
            ]}
          />
        ))}
      </View>
      <Text style={styles.stepText}>Шаг {step} из {total}</Text>
    </View>
  );
}

function NameStep({ fullName, styles, updateForm }) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Как вас зовут?</Text>
      <Text style={styles.stepSubtitle}>Укажите ваше имя и фамилию</Text>
      <TextInput
        autoCapitalize="words"
        onChangeText={(value) => updateForm('fullName', value)}
        placeholder="Введите ваше имя и фамилию"
        placeholderTextColor="#adadb2"
        style={styles.textInput}
        value={fullName}
      />
    </View>
  );
}

function CityStep({ city, styles, updateForm }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>В каком городе вы находитесь?</Text>
      <Text style={styles.stepSubtitle}>Укажите ваш город</Text>
      <Pressable style={styles.selectInput} onPress={() => setModalVisible(true)}>
        <Text style={[styles.selectText, city && styles.selectTextActive]}>
          {city || 'Выберите город'}
        </Text>
        <Ionicons color={darkText} name="chevron-down" size={24} />
      </Pressable>

      <Modal animationType="fade" transparent visible={modalVisible}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.citySheet}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {cities.map((item) => (
                <Pressable
                  key={item}
                  style={styles.cityOption}
                  onPress={() => {
                    updateForm('city', item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.cityOptionText}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function BirthGenderStep({ form, scale, styles, updateForm }) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Дата рождения и пол</Text>
      <Text style={styles.stepSubtitle}>Укажите вашу дату рождения и пол</Text>

      <Text style={styles.fieldLabel}>Дата рождения</Text>
      <DatePickerField
        onChange={(value) => updateForm('birthDate', value)}
        placeholder="Выберите дату"
        scale={scale}
        styles={styles}
        value={form.birthDate}
      />

      <Text style={[styles.fieldLabel, styles.genderLabel]}>Пол</Text>
      <GenderRow
        active={form.gender === 'female'}
        color={brandPink}
        label="Женский"
        onPress={() => updateForm('gender', 'female')}
        scale={scale}
        styles={styles}
      />
      <GenderRow
        active={form.gender === 'male'}
        color="#2467ce"
        label="Мужской"
        onPress={() => updateForm('gender', 'male')}
        scale={scale}
        styles={styles}
      />
    </View>
  );
}

function PhoneStep({ agreement, onLegal, personalData, phone, scale, styles, updateForm }) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Номер телефона</Text>
      <Text style={styles.stepSubtitle}>
        Укажите ваш номер телефона для{'\n'}подтверждения
      </Text>

      <Text style={styles.fieldLabel}>Номер телефона</Text>
      <MaskedPhoneField phone={phone} scale={scale} styles={styles} updatePhone={(value) => updateForm('phone', value)} />
      <View style={styles.securityRow}>
        <Ionicons color="#9a9aa0" name="lock-closed" size={16 * scale} />
        <Text style={styles.securityText}>Мы не передаем ваш номер третьим лицам</Text>
      </View>
      <LegalConsentBlock
        agreement={agreement}
        onLegal={onLegal}
        personalData={personalData}
        scale={scale}
        styles={styles}
        updateConsent={updateForm}
      />
    </View>
  );
}

function LegalConsentBlock({ agreement, onLegal, personalData, scale, styles, updateConsent }) {
  return (
    <View style={styles.legalConsentBlock}>
      <Text style={styles.legalConsentIntro}>Продолжая, вы соглашаетесь:</Text>
      <Pressable
        accessible
        accessibilityLabel="Согласие с пользовательским соглашением"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: agreement }}
        style={styles.legalConsentRow}
        onPress={() => updateConsent('agreement', !agreement)}
      >
        <View style={[styles.legalConsentCheck, agreement && styles.legalConsentCheckActive]}>
          {agreement ? <Ionicons color="#fff" name="checkmark" size={13 * scale} /> : null}
        </View>
        <Text style={styles.legalConsentText}>
          с{' '}
          <Text style={styles.legalConsentLink}>
            Пользовательским соглашением
          </Text>
        </Text>
      </Pressable>
      <Pressable
        accessible
        accessibilityLabel="Согласие с политикой конфиденциальности"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: personalData }}
        style={styles.legalConsentRow}
        onPress={() => updateConsent('personalData', !personalData)}
      >
        <View style={[styles.legalConsentCheck, personalData && styles.legalConsentCheckActive]}>
          {personalData ? <Ionicons color="#fff" name="checkmark" size={13 * scale} /> : null}
        </View>
        <Text style={styles.legalConsentText}>
          с{' '}
          <Text style={styles.legalConsentLink}>
            Политикой конфиденциальности
          </Text>
        </Text>
      </Pressable>
    </View>
  );
}

function MaskedPhoneField({ phone, scale, styles, updatePhone }) {
  return (
    <View style={styles.phoneInput}>
      <View style={styles.flagBox}>
        <Text style={styles.flagText}>🇰🇿</Text>
      </View>
      <Ionicons color={darkText} name="chevron-down" size={18 * scale} />
      <Text style={styles.phonePrefix}>+7</Text>
      <TextInput
        blurOnSubmit
        keyboardType="phone-pad"
        onChangeText={(value) => updatePhone(nationalPhoneDigits(value))}
        onSubmitEditing={Keyboard.dismiss}
        placeholder="(7__) ___-__-__"
        placeholderTextColor="#8f8f95"
        style={styles.phoneTextInput}
        value={formatPhone(phone)}
      />
    </View>
  );
}

function CodeScreen({
  code,
  confirmLabel = 'Подтвердить',
  onBack,
  onChangeCode,
  onConfirm,
  phone,
  progressStep = 4,
  progressTotal = 5,
  scale,
  styles,
  subtitlePrefix = 'Мы отправили 4-значный код',
  title = 'Введите код из WhatsApp',
}) {
  const inputRef = useRef(null);
  const displayPhone = phone ? `+7 ${formatPhone(phone)}` : '+7 701 123 45 67';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.registrationScreen}
    >
      <ProgressHeader step={progressStep} styles={styles} total={progressTotal} />
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepSubtitle}>
          {subtitlePrefix}
          {'\n'}на номер {displayPhone}
        </Text>

        <Pressable style={styles.codeRow} onPress={() => inputRef.current?.focus()}>
          {[0, 1, 2, 3].map((index) => (
            <View key={index} style={styles.codeBox}>
              <Text style={[styles.codeDigit, code[index] && styles.codeDigitFilled]}>
                {code[index] || ''}
              </Text>
            </View>
          ))}
          <TextInput
            ref={inputRef}
            autoFocus
            blurOnSubmit
            caretHidden
            keyboardType="number-pad"
            maxLength={4}
            onChangeText={(value) => {
              onChangeCode(value);
              if (digitsOnly(value).length === 4) Keyboard.dismiss();
            }}
            onSubmitEditing={Keyboard.dismiss}
            style={styles.hiddenCodeInput}
            value={code}
          />
        </Pressable>

        <Text style={styles.codeHint}>Код отправлен в WhatsApp на указанный номер</Text>
        <Text style={styles.retryMuted}>Не получили код?</Text>
        <Text style={styles.retryPink}>Отправить код повторно через 00:45</Text>
      </View>

      <View style={styles.registrationActions}>
        <GradientButton
          label={confirmLabel}
          onPress={() => {
            Keyboard.dismiss();
            onConfirm();
          }}
          styles={styles}
        />
        <BackButton
          onPress={() => {
            Keyboard.dismiss();
            onBack();
          }}
          scale={scale}
          styles={styles}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function PhotosStep({ form, scale, styles, updateForm }) {
  const pickImage = async (slot) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Нужен доступ к фото', 'Разрешите доступ к галерее, чтобы прикрепить фото.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 0.9,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    if (slot === 'main') {
      updateForm('mainPhoto', result.assets[0].uri);
      return;
    }

    const nextPhotos = [...form.extraPhotos];
    nextPhotos[slot] = result.assets[0].uri;
    updateForm('extraPhotos', nextPhotos);
  };

  return (
    <View style={styles.photosContent}>
      <Text style={styles.stepTitle}>Добавьте ваши фото</Text>
      <Text style={styles.stepSubtitle}>
        Загрузите ваши фотографии.{'\n'}
        Это поможет другим пользователям{'\n'}
        узнать вас лучше.
      </Text>

      <Pressable style={styles.mainPhotoWrap} onPress={() => pickImage('main')}>
        {form.mainPhoto ? (
          <Image source={{ uri: form.mainPhoto }} style={styles.mainPhoto} />
        ) : (
          <Ionicons color="#99999e" name="person-outline" size={72 * scale} />
        )}
        <View style={styles.photoPlus}>
          <Ionicons color={brandPink} name="add" size={31 * scale} />
        </View>
      </Pressable>
      <Text style={styles.mainPhotoTitle}>Основное фото</Text>
      <Text style={styles.mainPhotoSubtitle}>Добавьте фото профиля</Text>

      <View style={styles.photoDivider} />
      <Text style={styles.extraTitle}>
        Дополнительные фото <Text style={styles.extraOptional}>(необязательно)</Text>
      </Text>
      <View style={styles.extraPhotosRow}>
        {form.extraPhotos.map((uri, index) => (
          <Pressable key={index} style={styles.extraPhotoSlot} onPress={() => pickImage(index)}>
            {uri ? (
              <Image source={{ uri }} style={styles.extraPhotoImage} />
            ) : (
              <Ionicons color="#9a9aa0" name="add" size={30 * scale} />
            )}
          </Pressable>
        ))}
      </View>
      <Text style={styles.photoLimit}>Добавьте до 4 фотографий</Text>
    </View>
  );
}

function DatePickerField({ inputStyle, onChange, placeholder, scale, styles, value }) {
  const [visible, setVisible] = useState(false);
  const [draftDate, setDraftDate] = useState(parseDate(value) || new Date(1995, 0, 1));
  const selectedDate = parseDate(value) || draftDate;

  const handleChange = (_event, nextDate) => {
    if (!nextDate) {
      if (Platform.OS === 'android') setVisible(false);
      return;
    }

    setDraftDate(nextDate);
    if (Platform.OS === 'android') {
      setVisible(false);
      onChange(formatBirthDate(nextDate));
    }
  };

  return (
    <>
      <Pressable style={inputStyle || styles.iconInput} onPress={() => setVisible(true)}>
        <Ionicons color="#59595f" name="calendar-outline" size={22 * scale} />
        <Text style={[styles.datePickerText, value && styles.datePickerTextActive]}>
          {value || placeholder}
        </Text>
      </Pressable>

      {visible && Platform.OS === 'android' ? (
        <DateTimePicker
          display="calendar"
          maximumDate={new Date()}
          mode="date"
          onChange={handleChange}
          value={selectedDate}
        />
      ) : null}

      <Modal animationType="fade" transparent visible={visible && Platform.OS === 'ios'}>
        <Pressable style={styles.datePickerOverlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.datePickerSheet}>
            <DateTimePicker
              display="spinner"
              maximumDate={new Date()}
              mode="date"
              onChange={handleChange}
              value={draftDate}
            />
            <Pressable
              style={styles.datePickerDone}
              onPress={() => {
                onChange(formatBirthDate(draftDate));
                setVisible(false);
              }}
            >
              <Text style={styles.datePickerDoneText}>Готово</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function GenderRow({ active, color, label, onPress, scale, styles }) {
  return (
    <Pressable style={styles.genderRow} onPress={onPress}>
      <Ionicons color={color} name="person-outline" size={29 * scale} />
      <Text style={styles.genderText}>{label}</Text>
      <View style={[styles.radio, active && { borderColor: color }]}>
        {active ? <View style={[styles.radioDot, { backgroundColor: color }]} /> : null}
      </View>
    </Pressable>
  );
}

function SalonRegistrationScreen({ form, onBack, onContinue, scale, step, styles, submitting, updateForm }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step]);

  return (
    <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.registrationScreen}
    >
      <BackIcon compact onPress={onBack} scale={scale} styles={styles} />
      <ProgressHeader step={step} styles={styles} total={4} variant="salon" />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.salonRegistrationScrollContent}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? (
          <SalonBasicStep
            form={form}
            scale={scale}
            styles={styles}
            updateForm={updateForm}
          />
        ) : null}
        {step === 2 ? (
          <SalonLegalStep form={form} scale={scale} styles={styles} updateForm={updateForm} />
        ) : null}
        {step === 3 ? (
          <SalonDocumentsStep form={form} scale={scale} styles={styles} updateForm={updateForm} />
        ) : null}
        {step === 4 ? (
          <SalonPhotosStep form={form} scale={scale} styles={styles} updateForm={updateForm} />
        ) : null}

        <View style={styles.salonActionsInline}>
          <GradientButton
            compact
            disabled={submitting}
            label={step === 4 ? 'Завершить регистрацию' : 'Продолжить'}
            loading={submitting}
            onPress={onContinue}
            styles={styles}
          />
          <BackButton compact onPress={onBack} scale={scale} styles={styles} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

function SalonBasicStep({ form, scale, styles, updateForm }) {
  return (
    <View style={styles.salonStepContent}>
      <Text style={[styles.stepTitle, styles.salonStepTitle]}>Регистрация салона</Text>
      <Text style={[styles.stepSubtitle, styles.salonStepSubtitle]}>
        Заполните основную информацию{'\n'}о вашем салоне
      </Text>

      <RequiredLabel compact label="Название салона" styles={styles} />
      <IconTextField
        compact
        icon="storefront-outline"
        onChangeText={(value) => updateForm('salonName', value)}
        placeholder="Введите название салона"
        scale={scale}
        styles={styles}
        value={form.salonName}
      />

      <RequiredLabel compact label="Ответственное лицо" styles={styles} />
      <IconTextField
        compact
        icon="person-outline"
        onChangeText={(value) => updateForm('ownerName', value)}
        placeholder="Введите ФИО ответственного лица"
        scale={scale}
        styles={styles}
        value={form.ownerName}
      />

      <RequiredLabel compact label="Телефон" styles={styles} />
      <MaskedPhoneField
        phone={form.phone}
        scale={scale}
        styles={styles}
        updatePhone={(value) => updateForm('phone', value)}
      />

      <Text style={[styles.masterFieldLabel, styles.salonFieldLabel]}>
        Сайт/Instagram <Text style={styles.extraOptional}>(необязательно)</Text>
      </Text>
      <IconTextField
        compact
        autoCapitalize="none"
        icon="link-outline"
        onChangeText={(value) => updateForm('website', value)}
        placeholder="Введите сайт или ссылку на Instagram"
        scale={scale}
        styles={styles}
        value={form.website}
      />
      <Text style={[styles.helperText, styles.salonHelperText]}>
        Укажите ссылку на ваш сайт или Instagram аккаунт
      </Text>
    </View>
  );
}

function SalonLegalStep({ form, scale, styles, updateForm }) {
  return (
    <View style={styles.salonStepContent}>
      <Text style={[styles.stepTitle, styles.salonStepTitle]}>Регистрация салона</Text>
      <Text style={[styles.stepSubtitle, styles.salonStepSubtitle]}>
        Укажите юридическую информацию{'\n'}и адрес вашего салона
      </Text>

      <RequiredLabel compact label="Юридическое название" styles={styles} />
      <IconTextField
        compact
        icon="briefcase-outline"
        onChangeText={(value) => updateForm('legalName', value)}
        placeholder="Введите юридическое название"
        scale={scale}
        styles={styles}
        value={form.legalName}
      />
      <Text style={[styles.helperText, styles.salonHelperText]}>Как указано в документах</Text>

      <RequiredLabel compact label="Город" styles={styles} />
      <CitySelect
        compact
        icon="location-outline"
        onChange={(value) => updateForm('city', value)}
        placeholder="Выберите город"
        scale={scale}
        styles={styles}
        value={form.city}
      />

      <RequiredLabel compact label="Адрес" styles={styles} />
      <IconTextField
        compact
        icon="map-outline"
        onChangeText={(value) => updateForm('address', value)}
        placeholder="Введите адрес салона"
        scale={scale}
        styles={styles}
        value={form.address}
      />
      <Text style={[styles.helperText, styles.salonHelperText]}>
        Укажите точный адрес вашего салона
      </Text>

      <RequiredLabel compact label="Рабочее время" styles={styles} />
      <View style={styles.workingHoursBox}>
        <SalonSelectRow
          icon="time-outline"
          label="Дни работы"
          onChange={(value) => updateForm('workDays', value)}
          options={['Пн-Пт', 'Пн-Сб', 'Ежедневно', 'По записи']}
          placeholder="Выберите дни"
          scale={scale}
          styles={styles}
          value={form.workDays}
        />
        <SalonSelectRow
          icon="time-outline"
          label="Время открытия"
          onChange={(value) => updateForm('openTime', value)}
          options={['08:00', '09:00', '10:00', '11:00']}
          boxedValue
          scale={scale}
          styles={styles}
          value={form.openTime}
        />
        <SalonSelectRow
          icon="time-outline"
          label="Время закрытия"
          onChange={(value) => updateForm('closeTime', value)}
          options={['18:00', '19:00', '20:00', '21:00', '22:00']}
          boxedValue
          last
          scale={scale}
          styles={styles}
          value={form.closeTime}
        />
      </View>
      <Text style={[styles.helperText, styles.salonHelperText]}>
        Укажите дни и часы работы вашего салона
      </Text>
    </View>
  );
}

function SalonDocumentsStep({ form, scale, styles, updateForm }) {
  const pickSalonDocument = async (key, multiple = false) => {
    const uri = await pickImageUri();
    if (!uri) return;

    if (!multiple) {
      updateForm('documents', { ...form.documents, [key]: uri });
      return;
    }

    updateForm('documents', {
      ...form.documents,
      [key]: [...form.documents[key], uri],
    });
  };

  return (
    <View style={styles.salonStepContent}>
      <Text style={[styles.stepTitle, styles.salonStepTitle]}>Регистрация салона</Text>
      <Text style={[styles.stepSubtitle, styles.salonStepSubtitle]}>
        Загрузите необходимые документы{'\n'}для подтверждения вашего салона
      </Text>

      <UploadSection
        caption="Загрузите четкое фото или скан документа"
        icon="id-card-outline"
        label="Удостоверение личности владельца"
        required
        compact
        scale={scale}
        selected={Boolean(form.documents.ownerId)}
        styles={styles}
        subtitle="Паспорт или удостоверение личности владельца"
        title="Загрузите фото или скан"
        onPress={() => pickSalonDocument('ownerId')}
      />
      <UploadSection
        caption={`Если у вашего салона несколько лицензий, вы можете загрузить несколько файлов${
          form.documents.licenses.length ? ` • ${form.documents.licenses.length}` : ''
        }`}
        icon="document-text-outline"
        label="Лицензии"
        compact
        scale={scale}
        selected={form.documents.licenses.length > 0}
        styles={styles}
        subtitle="Разрешения на осуществление деятельности"
        title="Загрузите лицензии"
        onPress={() => pickSalonDocument('licenses', true)}
      />
      <UploadSection
        caption={`Можно загрузить несколько файлов${
          form.documents.certificates.length ? ` • ${form.documents.certificates.length}` : ''
        }`}
        icon="ribbon-outline"
        label="Сертификаты"
        compact
        scale={scale}
        selected={form.documents.certificates.length > 0}
        styles={styles}
        subtitle="Сертификаты на услуги, оборудование, обучение и т.д."
        title="Загрузите сертификаты"
        onPress={() => pickSalonDocument('certificates', true)}
      />
    </View>
  );
}

function SalonPhotosStep({ form, scale, styles, updateForm }) {
  const pickSalonPhoto = async () => {
    if (form.photos.length >= 10) {
      Alert.alert('Лимит фотографий', 'Можно загрузить до 10 фотографий.');
      return;
    }
    const uri = await pickImageUri();
    if (!uri) return;
    updateForm('photos', [...form.photos, uri].slice(0, 10));
  };

  const removePhoto = (index) => {
    updateForm(
      'photos',
      form.photos.filter((_, photoIndex) => photoIndex !== index),
    );
  };

  return (
    <View style={styles.salonStepContent}>
      <Text style={[styles.stepTitle, styles.salonStepTitle]}>Регистрация салона</Text>
      <Text style={[styles.stepSubtitle, styles.salonStepSubtitle]}>
        Добавьте фотографии вашего салона.{'\n'}
        Это поможет клиентам лучше узнать вас
      </Text>

      <RequiredLabel compact label="Фотографии салона" styles={styles} />
      <Text style={styles.salonPhotoDescription}>
        Добавьте фотографии интерьера, фасада, рабочих зон и атмосферы вашего салона
      </Text>
      <Pressable style={styles.salonDropZone} onPress={pickSalonPhoto}>
        <View style={[styles.uploadIconCircle, styles.salonCenteredIcon]}>
          <Ionicons color={brandPink} name="camera-outline" size={34 * scale} />
        </View>
        <Text style={styles.salonDropTitle}>Добавить фото</Text>
        <Text style={styles.salonDropSubtitle}>Нажмите или перетащите файл</Text>
      </Pressable>
      <Text style={styles.helperText}>
        Вы можете загрузить до 10 фотографий. Форматы: JPG, PNG. Размер не более 10 MB.
      </Text>
      <View style={styles.salonPhotosGrid}>
        {form.photos.map((uri, index) => (
          <View key={`${uri}-${index}`} style={styles.salonPhotoThumb}>
            <Image source={{ uri }} style={styles.salonPhotoImage} />
            <Pressable style={styles.removePhotoButton} onPress={() => removePhoto(index)}>
              <Ionicons color="#7f8086" name="close" size={18 * scale} />
            </Pressable>
          </View>
        ))}
      </View>
      <Text style={styles.salonPhotoCount}>{form.photos.length} из 10 фотографий</Text>
      <View style={styles.salonTip}>
        <View style={[styles.uploadIconCircle, styles.salonCenteredIcon]}>
          <Ionicons color={brandPink} name="bulb-outline" size={31 * scale} />
        </View>
        <View style={styles.partnerText}>
          <Text style={styles.uploadTitle}>Совет</Text>
          <Text style={styles.uploadSubtitle}>
            Качественные и актуальные фотографии помогут клиентам больше доверять вашему салону.
          </Text>
        </View>
      </View>
    </View>
  );
}

function MasterRegistrationScreen({ form, onBack, onContinue, onLegal, scale, step, styles, submitting, updateForm }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step]);

  return (
    <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.registrationScreen}
    >
      <ProgressHeader step={step} styles={styles} total={4} />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.masterScrollContent}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? (
          <MasterInfoStep form={form} scale={scale} styles={styles} updateForm={updateForm} />
        ) : null}
        {step === 2 ? (
          <MasterExperienceStep
            form={form}
            scale={scale}
            styles={styles}
            updateForm={updateForm}
          />
        ) : null}
        {step === 3 ? (
          <MasterDocumentsStep
            form={form}
            scale={scale}
            styles={styles}
            updateForm={updateForm}
          />
        ) : null}
        {step === 4 ? (
          <MasterFinishStep
            form={form}
            onLegal={onLegal}
            scale={scale}
            styles={styles}
            updateForm={updateForm}
          />
        ) : null}
        <View style={styles.masterActionsInline}>
          <GradientButton
            disabled={submitting || (step === 4 && (!form.agreement || !form.personalData))}
            iconName={step === 4 ? 'paper-plane-outline' : undefined}
            label={step === 4 ? 'Отправить на проверку' : 'Продолжить'}
            loading={submitting}
            onPress={onContinue}
            styles={styles}
          />
          <BackButton onPress={onBack} scale={scale} styles={styles} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

function MasterInfoStep({ form, scale, styles, updateForm }) {
  return (
    <View style={styles.masterContent}>
      <Text style={styles.stepTitle}>Информация о себе</Text>
      <Text style={styles.stepSubtitle}>
        Заполните ваши данные для{'\n'}создания профиля
      </Text>

      <RequiredLabel label="ФИО" styles={styles} />
      <TextInput
        autoCapitalize="words"
        onChangeText={(value) => updateForm('fullName', value)}
        placeholder="Введите ваше ФИО"
        placeholderTextColor="#adadb2"
        style={styles.masterTextInput}
        value={form.fullName}
      />

      <RequiredLabel label="Город" styles={styles} />
      <CitySelect value={form.city} styles={styles} onChange={(value) => updateForm('city', value)} />

      <RequiredLabel label="Телефон" styles={styles} />
      <MaskedPhoneField
        phone={form.phone}
        scale={scale}
        styles={styles}
        updatePhone={(value) => updateForm('phone', value)}
      />

      <Text style={styles.masterFieldLabel}>Дата рождения</Text>
      <DatePickerField
        inputStyle={styles.masterIconInput}
        onChange={(value) => updateForm('birthDate', value)}
        placeholder="Выберите дату рождения"
        scale={scale}
        styles={styles}
        value={form.birthDate}
      />

      <Text style={styles.masterFieldLabel}>Пол</Text>
      <View style={styles.masterGenderGrid}>
        <MasterGenderPill
          active={form.gender === 'male'}
          label="Мужской"
          onPress={() => updateForm('gender', 'male')}
          scale={scale}
          styles={styles}
        />
        <MasterGenderPill
          active={form.gender === 'female'}
          label="Женский"
          onPress={() => updateForm('gender', 'female')}
          scale={scale}
          styles={styles}
        />
      </View>
    </View>
  );
}

function MasterExperienceStep({ form, styles, updateForm }) {
  return (
    <View style={styles.masterContentCompact}>
      <Text style={styles.stepTitle}>Опыт работы</Text>
      <Text style={styles.stepSubtitle}>
        Расскажите о вашем опыте{'\n'}и профессиональных навыках
      </Text>

      <Text style={styles.masterFieldLabel}>Опыт работы</Text>
      <View style={styles.radioGroupBox}>
        {['До 1 года', '1-3 года', '3-5 лет', 'Более 5 лет'].map((item) => (
          <SimpleRadio
            key={item}
            active={form.experience === item}
            label={item}
            onPress={() => updateForm('experience', item)}
            styles={styles}
          />
        ))}
      </View>

      <Text style={styles.masterFieldLabel}>Краткое описание о себе</Text>
      <View style={styles.textAreaWrap}>
        <TextInput
          maxLength={500}
          multiline
          onChangeText={(value) => updateForm('about', value)}
          placeholder="Расскажите о себе, своих навыках, специализации и достижениях"
          placeholderTextColor="#8f8f95"
          style={styles.textArea}
          textAlignVertical="top"
          value={form.about}
        />
        <Text style={styles.counterText}>{form.about.length}/500</Text>
      </View>
      <Text style={styles.helperText}>До 500 символов</Text>
    </View>
  );
}

function MasterDocumentsStep({ form, scale, styles, updateForm }) {
  const pickDocumentImage = async (key, multiple = false) => {
    const uri = await pickImageUri();
    if (!uri) return;

    if (!multiple) {
      updateForm('documents', { ...form.documents, [key]: uri });
      return;
    }

    updateForm('documents', {
      ...form.documents,
      [key]: [...form.documents[key], uri],
    });
  };

  return (
    <View style={styles.masterContentCompact}>
      <Text style={styles.stepTitle}>Документы</Text>
      <Text style={styles.stepSubtitle}>
        Загрузите документы для подтверждения{'\n'}вашей квалификации и личности
      </Text>

      <UploadSection
        caption="Загрузите четкое фото или скан документа"
        icon="id-card-outline"
        label="Удостоверение личности"
        required
        scale={scale}
        selected={Boolean(form.documents.id)}
        styles={styles}
        subtitle="Паспорт или удостоверение личности"
        title="Загрузите фото или скан"
        onPress={() => pickDocumentImage('id')}
      />
      <UploadSection
        caption={`Можно загрузить несколько файлов${
          form.documents.certificates.length ? ` • ${form.documents.certificates.length}` : ''
        }`}
        icon="ribbon-outline"
        label="Сертификаты"
        required
        scale={scale}
        selected={form.documents.certificates.length > 0}
        styles={styles}
        subtitle="Подтверждающие ваши навыки и квалификацию"
        title="Загрузите ваши сертификаты"
        onPress={() => pickDocumentImage('certificates', true)}
      />
      <UploadSection
        caption="При наличии"
        icon="school-outline"
        label="Дипломы"
        optional="(необязательно)"
        scale={scale}
        selected={form.documents.diplomas.length > 0}
        styles={styles}
        subtitle="Образование и повышение квалификации"
        title="Загрузите ваши дипломы"
        onPress={() => pickDocumentImage('diplomas', true)}
      />
      <UploadSection
        caption="При наличии"
        icon="document-text-outline"
        label="Лицензии"
        optional="(если имеются)"
        scale={scale}
        selected={form.documents.licenses.length > 0}
        styles={styles}
        subtitle="Профессиональные лицензии и разрешения"
        title="Загрузите лицензии"
        onPress={() => pickDocumentImage('licenses', true)}
      />
    </View>
  );
}

function MasterFinishStep({ form, onLegal, scale, styles, updateForm }) {
  return (
    <View style={styles.masterContent}>
      <Text style={styles.stepTitle}>Завершение регистрации</Text>
      <Text style={styles.stepSubtitle}>
        Почти готово! Добавьте ссылку{'\n'}на портфолио и подтвердите согласие
      </Text>

      <Text style={styles.masterFieldLabel}>
        Ссылка на портфолио <Text style={styles.extraOptional}>(необязательно)</Text>
      </Text>
      <View style={styles.portfolioInput}>
        <Ionicons color="#8f8f95" name="link-outline" size={23 * scale} />
        <TextInput
          autoCapitalize="none"
          keyboardType="url"
          onChangeText={(value) => updateForm('portfolio', value)}
          placeholder="https://example.com или @username"
          placeholderTextColor="#8f8f95"
          style={styles.iconTextInput}
          value={form.portfolio}
        />
      </View>
      <Text style={styles.helperText}>
        Укажите ссылку на ваш сайт, Instagram, Behance и т.д.
      </Text>

      <AgreementRow
        checked={form.agreement}
        description="Я ознакомлен(а) и согласен(а) с условиями использования"
        label="Принимаю пользовательское соглашение"
        onOpenDocument={() => onLegal('terms')}
        onPress={() => updateForm('agreement', !form.agreement)}
        scale={scale}
        styles={styles}
      />
      <View style={styles.agreementDivider} />
      <AgreementRow
        checked={form.personalData}
        description="Я согласен(а) на обработку моих персональных данных в соответствии с политикой конфиденциальности"
        label="Даю согласие на обработку персональных данных"
        onOpenDocument={() => onLegal('privacy')}
        onPress={() => updateForm('personalData', !form.personalData)}
        scale={scale}
        styles={styles}
      />
    </View>
  );
}

function MasterSuccessScreen({ onHome, scale, styles }) {
  return (
    <ScrollView
      contentContainerStyle={styles.successScrollContent}
      showsVerticalScrollIndicator={false}
      style={styles.successScreen}
    >
      <View style={styles.successHero}>
        <View style={styles.successCelebration}>
          <Text style={[styles.successSparkle, styles.successSparklePinkLeft]}>✦</Text>
          <Text style={[styles.successSparkle, styles.successSparkleGreenLeft]}>✦</Text>
          <Text style={[styles.successSparkle, styles.successSparkleGreenRight]}>✦</Text>
          <Text style={[styles.successSparkle, styles.successSparklePinkRight]}>✦</Text>
          <Text style={[styles.successSparkle, styles.successSparklePinkBottom]}>✦</Text>
          <Text style={[styles.successSparkle, styles.successSparkleSandBottom]}>✦</Text>
          <View style={styles.successHalo}>
            <Ionicons color="#11a753" name="checkmark" size={76 * scale} />
          </View>
        </View>
        <Text style={styles.successTitle}>Ваша заявка отправлена!</Text>
        <Text style={styles.successSubtitle}>
          Спасибо! Мы получили вашу заявку{'\n'}и уже начали её проверку.
        </Text>
      </View>

      <View style={styles.successInfoCard}>
        <View style={styles.successIconCircle}>
          <Ionicons color="#12b762" name="time-outline" size={34 * scale} />
        </View>
        <View style={styles.successInfoText}>
          <Text style={styles.successInfoTitle}>Ожидайте в течение 24 часов</Text>
          <Text style={styles.successInfoSubtitle}>
            Мы рассмотрим вашу заявку и свяжемся{'\n'}с вами в ближайшее время.
          </Text>
        </View>
      </View>

      <View style={styles.successMailRow}>
        <View style={styles.mailIconCircle}>
          <Ionicons color={brandPink} name="mail-outline" size={28 * scale} />
        </View>
        <Text style={styles.successMailText}>
          Статус заявки вы можете отслеживать{'\n'}в личном кабинете приложения.
        </Text>
      </View>

      <View style={styles.successActionsInline}>
        <GradientButton label="Перейти в личный кабинет" onPress={onHome} styles={styles} />
        <Pressable style={styles.homeButton} onPress={onHome}>
          <Ionicons color={brandPink} name="home-outline" size={26 * scale} />
          <Text style={styles.homeButtonText}>На главную</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function LoginSuccessScreen({ onHome, scale, styles }) {
  return (
    <ScrollView
      contentContainerStyle={styles.successScrollContent}
      showsVerticalScrollIndicator={false}
      style={styles.successScreen}
    >
      <View style={styles.successHero}>
        <View style={styles.successHalo}>
          <Ionicons color="#11a753" name="checkmark" size={76 * scale} />
        </View>
        <Text style={styles.successTitle}>Вы вошли!</Text>
        <Text style={styles.successSubtitle}>
          Авторизация прошла успешно.{'\n'}Добро пожаловать в TAP Partner.
        </Text>
      </View>

      <View style={styles.successInfoCard}>
        <View style={styles.successIconCircle}>
          <Ionicons color="#12b762" name="shield-checkmark-outline" size={34 * scale} />
        </View>
        <View style={styles.successInfoText}>
          <Text style={styles.successInfoTitle}>Доступ подтвержден</Text>
          <Text style={styles.successInfoSubtitle}>
            Сейчас можно переходить{'\n'}в личный кабинет приложения.
          </Text>
        </View>
      </View>

      <View style={styles.successActionsInline}>
        <GradientButton label="Перейти в личный кабинет" onPress={onHome} styles={styles} />
        <Pressable style={styles.homeButton} onPress={onHome}>
          <Ionicons color={brandPink} name="home-outline" size={26 * scale} />
          <Text style={styles.homeButtonText}>На главную</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function RoleChoiceModal({ onClose, onMaster, onSalon, scale, styles, visible }) {
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.roleOverlay}>
        <Pressable
          accessibilityLabel="Закрыть выбор роли"
          accessibilityRole="button"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View onStartShouldSetResponder={() => true} style={styles.roleSheet}>
          <View style={styles.roleHandle} />
          <Text style={styles.roleTitle}>Выберите тип партнера</Text>
          <Text style={styles.roleSubtitle}>Кого регистрируем в TAP Partner?</Text>
          <RoleOption
            icon="storefront-outline"
            label="Салон"
            onPress={onSalon}
            scale={scale}
            styles={styles}
            subtitle="Заявка для компании, студии или клиники"
          />
          <RoleOption
            icon="person-outline"
            label="Мастер"
            onPress={onMaster}
            scale={scale}
            styles={styles}
            subtitle="Анкета специалиста для прохождения модерации"
          />
        </View>
      </View>
    </Modal>
  );
}

function RoleOption({ icon, label, onPress, scale, styles, subtitle }) {
  return (
    <Pressable
      accessibilityLabel={`${label}. ${subtitle}`}
      accessibilityRole="button"
      style={styles.roleOption}
      onPress={onPress}
    >
      <View style={styles.roleIconCircle}>
        <Ionicons color={brandPink} name={icon} size={30 * scale} />
      </View>
      <View style={styles.roleOptionText}>
        <Text style={styles.roleOptionTitle}>{label}</Text>
        <Text style={styles.roleOptionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons color={darkText} name="chevron-forward" size={24 * scale} />
    </Pressable>
  );
}

function CitySelect({ compact = false, icon, onChange, placeholder = 'Выберите ваш город', scale = 1, styles, value }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Pressable
        style={[styles.masterSelectInput, compact && styles.salonSelectInput]}
        onPress={() => setModalVisible(true)}
      >
        {icon ? <Ionicons color="#77777d" name={icon} size={21 * scale} /> : null}
        <Text
          style={[
            styles.masterSelectText,
            compact && styles.salonSelectText,
            icon && styles.masterSelectTextWithIcon,
            value && styles.selectTextActive,
          ]}
        >
          {value || placeholder}
        </Text>
        <Ionicons color={darkText} name="chevron-down" size={24} />
      </Pressable>
      <Modal animationType="fade" transparent visible={modalVisible}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.citySheet}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {cities.map((item) => (
                <Pressable
                  key={item}
                  style={styles.cityOption}
                  onPress={() => {
                    onChange(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.cityOptionText}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function IconTextField({
  autoCapitalize,
  compact = false,
  icon,
  keyboardType,
  onChangeText,
  placeholder,
  scale,
  styles,
  value,
}) {
  return (
    <View style={[styles.masterIconInput, compact && styles.salonIconInput]}>
      <Ionicons color="#77777d" name={icon} size={21 * scale} />
      <TextInput
        autoCapitalize={autoCapitalize}
        blurOnSubmit
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        onSubmitEditing={Keyboard.dismiss}
        placeholder={placeholder}
        placeholderTextColor="#8f8f95"
        style={[styles.iconTextInput, compact && styles.salonInputText]}
        value={value}
      />
    </View>
  );
}

function SalonSelectRow({ boxedValue = false, icon, label, last = false, onChange, options, placeholder, scale, styles, value }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Pressable
        style={[styles.workingHourRow, last && styles.workingHourRowLast]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.workingHourIcon}>
          <Ionicons color={brandPink} name={icon} size={20 * scale} />
        </View>
        <Text style={styles.workingHourLabel}>{label}</Text>
        <View style={boxedValue ? styles.workingHourValueBox : styles.workingHourValuePlain}>
          <Text style={[styles.workingHourValue, value && styles.selectTextActive]}>
            {value || placeholder}
          </Text>
          <Ionicons color="#8f8f95" name="chevron-down" size={18 * scale} />
        </View>
      </Pressable>
      <Modal animationType="fade" transparent visible={modalVisible}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.citySheet}>
            {options.map((item) => (
              <Pressable
                key={item}
                style={styles.cityOption}
                onPress={() => {
                  onChange(item);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.cityOptionText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function RequiredLabel({ compact = false, label, styles }) {
  return (
    <Text style={[styles.masterFieldLabel, compact && styles.salonFieldLabel]}>
      {label} <Text style={styles.requiredStar}>*</Text>
    </Text>
  );
}

function MasterGenderPill({ active, label, onPress, scale, styles }) {
  return (
    <Pressable style={styles.masterGenderPill} onPress={onPress}>
      <View style={[styles.radio, active && { borderColor: brandPink }]}>
        {active ? <View style={[styles.radioDot, { backgroundColor: brandPink }]} /> : null}
      </View>
      <Text style={styles.masterGenderText}>{label}</Text>
    </Pressable>
  );
}

function SimpleRadio({ active, label, onPress, styles }) {
  return (
    <Pressable style={styles.simpleRadioRow} onPress={onPress}>
      <View style={[styles.simpleRadio, active && { borderColor: brandPink }]}>
        {active ? <View style={styles.simpleRadioDot} /> : null}
      </View>
      <Text style={styles.simpleRadioText}>{label}</Text>
    </Pressable>
  );
}

function UploadSection({
  caption,
  compact = false,
  icon,
  label,
  optional,
  onPress,
  required,
  scale,
  selected,
  styles,
  subtitle,
  title,
}) {
  return (
    <View style={styles.uploadSection}>
      <Text style={[styles.masterFieldLabel, compact && styles.salonFieldLabel]}>
        {label} {required ? <Text style={styles.requiredStar}>*</Text> : null}
        {optional ? <Text style={styles.extraOptional}> {optional}</Text> : null}
      </Text>
      <Pressable style={[styles.uploadCard, compact && styles.salonUploadCard]} onPress={onPress}>
        <View style={[styles.uploadIconCircle, compact && styles.salonUploadIconCircle]}>
          <Ionicons
            color={brandPink}
            name={selected ? 'checkmark-circle-outline' : icon}
            size={(compact ? 29 : 33) * scale}
          />
        </View>
        <View style={styles.uploadText}>
          <Text style={[styles.uploadTitle, compact && styles.salonUploadTitle]}>
            {selected ? 'Файл прикреплен' : title}
          </Text>
          <Text style={[styles.uploadSubtitle, compact && styles.salonUploadSubtitle]}>
            {subtitle}
          </Text>
        </View>
        <Ionicons color={darkText} name="chevron-forward" size={25 * scale} />
      </Pressable>
      <Text style={[styles.uploadCaption, compact && styles.salonUploadCaption]}>{caption}</Text>
    </View>
  );
}

function AgreementRow({ checked, description, label, onOpenDocument, onPress, scale, styles }) {
  const firstPinkIndex = label.indexOf('пользовательское');
  const personalIndex = label.indexOf('персональных');

  return (
    <View style={styles.agreementRow}>
      <Pressable style={[styles.checkBox, checked && styles.checkBoxActive]} onPress={onPress}>
        {checked ? <Ionicons color="#fff" name="checkmark" size={18 * scale} /> : null}
      </Pressable>
      <Pressable style={styles.agreementTextWrap} onPress={onPress}>
        {firstPinkIndex > -1 ? (
          <Text style={styles.agreementTitle}>
            Принимаю <Text style={styles.pinkText}>пользовательское соглашение</Text>
          </Text>
        ) : personalIndex > -1 ? (
          <Text style={styles.agreementTitle}>
            Даю согласие на обработку{'\n'}
            <Text style={styles.pinkText}>персональных данных</Text>
          </Text>
        ) : (
          <Text style={styles.agreementTitle}>{label}</Text>
        )}
        <Text style={styles.agreementDescription}>{description}</Text>
      </Pressable>
      <Pressable hitSlop={10} onPress={onOpenDocument || onPress}>
        <Ionicons color={darkText} name="chevron-forward" size={22 * scale} />
      </Pressable>
    </View>
  );
}

function GradientButton({ compact = false, disabled = false, iconName, label, loading = false, onPress, styles }) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessible
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={isDisabled}
      style={[
        styles.primaryButton,
        compact && styles.salonPrimaryButton,
        isDisabled && styles.primaryButtonDisabled,
      ]}
      onPress={onPress}
    >
      <LinearGradient
        pointerEvents="none"
        colors={isDisabled ? ['#d7d7dc', '#c7c7cd'] : [softPink, brandPink]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.gradientButton}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" style={styles.buttonIcon} />
        ) : iconName ? (
          <Ionicons color="#fff" name={iconName} size={24} style={styles.buttonIcon} />
        ) : null}
        <Text style={[styles.primaryButtonText, compact && styles.salonPrimaryButtonText]}>
          {loading ? 'Загрузка...' : label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

function BackButton({ compact = false, onPress, scale, styles }) {
  return (
    <Pressable
      accessibilityRole="button"
      style={[styles.backButton, compact && styles.salonBackButton]}
      onPress={onPress}
    >
      <Ionicons color={brandPink} name="arrow-back" size={26 * scale} />
      <Text style={[styles.backButtonText, compact && styles.salonBackButtonText]}>Назад</Text>
    </Pressable>
  );
}

function RegistrationPartnerCard({ onPress, scale, styles }) {
  return (
    <Pressable accessibilityRole="button" style={styles.registerPartnerCard} onPress={onPress}>
      <Ionicons color={brandPink} name="person-outline" size={31 * scale} />
      <Text style={styles.registerPartnerText}>Вы салон или мастер?</Text>
      <Ionicons color={darkText} name="chevron-forward" size={25 * scale} />
    </Pressable>
  );
}

function BackIcon({ compact = false, onPress, scale, styles }) {
  return (
    <Pressable hitSlop={14} style={styles.backIcon} onPress={onPress}>
      <Ionicons color="#111114" name="chevron-back" size={(compact ? 30 : 36) * scale} />
    </Pressable>
  );
}

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

function nationalPhoneDigits(value) {
  const digits = digitsOnly(value);
  if (digits.length > 10 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return digits.slice(-10);
  }
  return digits.slice(0, 10);
}

function phoneToApi(value) {
  return `+7${nationalPhoneDigits(value)}`;
}

function formatPhone(value) {
  const digits = digitsOnly(value).slice(0, 10);
  const a = digits.slice(0, 3);
  const b = digits.slice(3, 6);
  const c = digits.slice(6, 8);
  const d = digits.slice(8, 10);

  if (digits.length <= 3) return a;
  if (digits.length <= 6) return `(${a}) ${b}`;
  if (digits.length <= 8) return `(${a}) ${b}-${c}`;
  return `(${a}) ${b}-${c}-${d}`;
}

function formatDisplayPhone(value = '') {
  const digits = digitsOnly(value);
  const lastTen = digits.slice(-10);

  if (lastTen.length !== 10) return value || '';

  return `+7 ${lastTen.slice(0, 3)} ${lastTen.slice(3, 6)} ${lastTen.slice(6, 8)} ${lastTen.slice(8)}`;
}

function getInitials(value = '') {
  const initials = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return initials || 'XS';
}

function getAccountStatusLabel(value) {
  if (value === 'disabled') return 'Аккаунт отключён';
  if (value === 'active') return 'Аккаунт активен';
  return 'Статус аккаунта не указан';
}

function formatDateShort(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatAppointmentDate(value) {
  const date = new Date(value?.includes?.('T') ? value : `${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value || '';

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  }).format(date);
}

function formatAppointmentDayHeading(value) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value || '';

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const dateKey = formatLocalDateKey(date);

  if (dateKey === formatLocalDateKey(today)) return `Сегодня, ${formatAppointmentDate(value)}`;
  if (dateKey === formatLocalDateKey(tomorrow)) return `Завтра, ${formatAppointmentDate(value)}`;
  return formatAppointmentDate(value);
}

function formatLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function groupAppointmentsByDate(appointments) {
  const groups = [];
  const byDate = new Map();

  appointments.forEach((appointment) => {
    if (!byDate.has(appointment.date)) {
      const group = { date: appointment.date, items: [] };
      byDate.set(appointment.date, group);
      groups.push(group);
    }
    byDate.get(appointment.date).items.push(appointment);
  });

  return groups;
}

function buildScheduleDateOptions(appointments = []) {
  const dates = new Set();
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  for (let offset = -2; offset <= 8; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    dates.add(formatLocalDateKey(date));
  }
  appointments.forEach((appointment) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(appointment.date || '')) dates.add(appointment.date);
  });

  return [...dates]
    .sort()
    .map((value) => {
      const date = new Date(`${value}T12:00:00`);
      return {
        day: date.getDate(),
        value,
        weekday: new Intl.DateTimeFormat('ru-RU', { weekday: 'short' })
          .format(date)
          .replace('.', '')
          .slice(0, 2)
          .toUpperCase(),
      };
    });
}

function clockToMinutes(value = '00:00') {
  const [hours, minutes] = String(value).split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
  return hours * 60 + minutes;
}

function minutesToClock(value) {
  const normalized = Math.max(0, Math.min(24 * 60 - 1, Math.round(value)));
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`;
}

function buildScheduleTimeSlots(startMinutes, endMinutes) {
  const slots = [];
  for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
    slots.push({ label: minutesToClock(minutes), minutes });
  }
  return slots;
}

function parseAppointmentDuration(value = '') {
  const amount = Number(String(value).match(/\d+/)?.[0]);
  return Number.isFinite(amount) && amount > 0 ? amount : 60;
}

function formatScheduleDateTitle(value) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  const todayKey = formatLocalDateKey(new Date());
  const formatted = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(date);
  return value === todayKey ? `Сегодня, ${formatted}` : formatted;
}

function pluralizeRecords(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'запись';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'записи';
  return 'записей';
}

function formatMoney(value) {
  const amount = Number(value || 0);
  if (!amount) return '0 ₸';

  return `${new Intl.NumberFormat('ru-RU').format(amount)} ₸`;
}

function getFavoriteTargetId(item) {
  return String(item.id || `${item.kind || 'item'}:${item.name || ''}:${item.address || ''}`);
}

function getFavoriteKey(item) {
  return `${item.kind === 'salon' ? 'salon' : 'master'}:${getFavoriteTargetId(item)}`;
}

function buildFavoriteSnapshot(item) {
  const photos = (item.photos || [])
    .map((photo) => (typeof photo === 'string' ? photo : null))
    .filter(Boolean);

  return {
    address: item.address || '',
    city: item.city || '',
    distance: item.distance || '',
    district: item.district || '',
    image: typeof item.image === 'string' ? item.image : '',
    kind: item.kind === 'salon' ? 'salon' : 'master',
    name: item.name || '',
    photos,
    price: item.price || '',
    rating: item.rating || '',
    ratingNumber: item.ratingNumber || Number(item.rating) || 0,
    scheduleTitle: item.scheduleTitle || '',
    serviceGroup: item.serviceGroup || '',
    slots: item.slots || [],
    specialty: item.specialty || item.tags || '',
    status: item.status || '',
    tags: item.tags || '',
  };
}

function normalizeFavoriteSearchItem(favorite) {
  const item = favorite.item || {};
  if (!item.name) return null;

  return {
    ...item,
    id: favorite.targetId,
    kind: favorite.targetType,
    photos: item.photos?.length ? item.photos : undefined,
    rating: item.rating || '4.9',
    ratingNumber: item.ratingNumber || Number(item.rating) || 4.9,
    targetFavoriteId: favorite.id,
  };
}

function formatBirthDate(date) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function parseDate(value) {
  if (!value) return null;
  const [day, month, year] = value.split('.').map(Number);
  if (!day || !month || !year) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function pickImageUri() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Нужен доступ к фото', 'Разрешите доступ к галерее, чтобы прикрепить файл.');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: false,
    mediaTypes: ['images'],
    quality: 0.9,
  });

  if (result.canceled || !result.assets?.[0]?.uri) return null;
  return result.assets[0].uri;
}

async function submitClientRegistration(form) {
  return postJson('/api/client-registrations-json', {
    payload: {
      fullName: form.fullName,
      city: form.city,
      birthDate: form.birthDate,
      gender: form.gender,
      phone: phoneToApi(form.phone),
    },
    images: {
      mainPhoto: form.mainPhoto ? await prepareImageUpload(form.mainPhoto, 'main-photo.jpg') : null,
      extraPhotos: await Promise.all(
        form.extraPhotos
          .filter(Boolean)
          .map((uri, index) => prepareImageUpload(uri, `extra-photo-${index + 1}.jpg`)),
      ),
    },
  });
}

async function submitMasterRegistration(form) {
  return postJson('/api/master-registrations-json', {
    payload: {
      fullName: form.fullName,
      phone: phoneToApi(form.phone),
      city: form.city,
      birthDate: form.birthDate,
      gender: form.gender,
      experience: form.experience,
      about: form.about,
      portfolio: form.portfolio,
      agreement: form.agreement,
      personalData: form.personalData,
    },
    images: {
      idDocument: form.documents.id
        ? await prepareImageUpload(form.documents.id, 'id-document.jpg')
        : null,
      certificates: await Promise.all(
        form.documents.certificates.map((uri, index) =>
          prepareImageUpload(uri, `certificate-${index + 1}.jpg`),
        ),
      ),
      diplomas: await Promise.all(
        form.documents.diplomas.map((uri, index) =>
          prepareImageUpload(uri, `diploma-${index + 1}.jpg`),
        ),
      ),
      licenses: await Promise.all(
        form.documents.licenses.map((uri, index) =>
          prepareImageUpload(uri, `license-${index + 1}.jpg`),
        ),
      ),
    },
  });
}

async function submitSalonRegistration(form) {
  return postJson('/api/salon-registrations-json', {
    payload: {
      salonName: form.salonName,
      ownerName: form.ownerName,
      phone: phoneToApi(form.phone),
      website: form.website,
      legalName: form.legalName,
      city: form.city,
      address: form.address,
      workDays: form.workDays,
      openTime: form.openTime,
      closeTime: form.closeTime,
    },
    images: {
      ownerId: form.documents.ownerId
        ? await prepareImageUpload(form.documents.ownerId, 'owner-id.jpg')
        : null,
      licenses: await Promise.all(
        form.documents.licenses.map((uri, index) =>
          prepareImageUpload(uri, `salon-license-${index + 1}.jpg`),
        ),
      ),
      certificates: await Promise.all(
        form.documents.certificates.map((uri, index) =>
          prepareImageUpload(uri, `salon-certificate-${index + 1}.jpg`),
        ),
      ),
      photos: await Promise.all(
        form.photos.map((uri, index) => prepareImageUpload(uri, `salon-photo-${index + 1}.jpg`)),
      ),
    },
  });
}

async function prepareImageUpload(uri, name) {
  const compressed = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1400 } }],
    {
      base64: true,
      compress: 0.72,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );

  const size = await getLocalFileSize(compressed.uri);
  const sizeMb = size / 1024 / 1024;

  if (sizeMb > MAX_COMPRESSED_IMAGE_MB) {
    throw new Error(`Фото ${name} больше ${MAX_COMPRESSED_IMAGE_MB} MB после сжатия.`);
  }

  return {
    base64: compressed.base64,
    name,
    type: 'image/jpeg',
  };
}

async function getLocalFileSize(uri) {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob.size;
}

async function postJson(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось сохранить данные на сервере');
  }

  return data;
}

async function getJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Не удалось загрузить данные');
  }

  return data;
}

async function getStoredClientQuery() {
  const [storedClientId, storedClientPhone] = await Promise.all([
    AsyncStorage.getItem(CLIENT_ID_STORAGE_KEY),
    AsyncStorage.getItem(CLIENT_PHONE_STORAGE_KEY),
  ]);
  const params = [];

  if (storedClientId) params.push(`id=${encodeURIComponent(storedClientId)}`);
  if (storedClientPhone) params.push(`phone=${encodeURIComponent(storedClientPhone)}`);

  return params.length ? `?${params.join('&')}` : '';
}

async function getStoredPartnerQuery(role) {
  const [storedId, storedPhone] = await Promise.all([
    AsyncStorage.getItem(CLIENT_ID_STORAGE_KEY),
    AsyncStorage.getItem(CLIENT_PHONE_STORAGE_KEY),
  ]);
  const params = [`role=${encodeURIComponent(role)}`];

  if (storedId) params.push(`id=${encodeURIComponent(storedId)}`);
  else if (storedPhone) params.push(`phone=${encodeURIComponent(storedPhone)}`);

  return `?${params.join('&')}`;
}

async function getStoredClientIdentity() {
  const [clientId, phone] = await Promise.all([
    AsyncStorage.getItem(CLIENT_ID_STORAGE_KEY),
    AsyncStorage.getItem(CLIENT_PHONE_STORAGE_KEY),
  ]);

  return { clientId, phone };
}

async function patchJson(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'PATCH',
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Не удалось обновить данные');
  }

  return data;
}

async function deleteJson(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'DELETE',
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Не удалось удалить данные');
  }

  return data;
}

function normalizeHomeMaster(item, index) {
  const fallback = popularMasters[index % popularMasters.length];

  return {
    id: item.id || `master-${index}`,
    image: item.image || fallback.image,
    name: item.name || fallback.name,
    price: item.price || fallback.price,
    rating: item.rating || fallback.rating,
    salonId: item.salonId || '',
    specialty: item.specialty || fallback.specialty,
    status: item.status,
    type: 'master',
  };
}

function normalizeHomeSalon(item, index) {
  const fallback = topSalons[index % topSalons.length];
  const image = item.image || fallback.image;

  return {
    address: item.address || fallback.address,
    city: item.city || '',
    closeTime: item.closeTime,
    description: item.description || '',
    id: item.id || `salon-${index}`,
    image,
    masters: (item.masters || []).map(normalizeHomeMaster),
    name: item.name || fallback.name,
    openTime: item.openTime,
    phone: item.phone,
    photos: item.photos?.length ? item.photos : [image],
    rating: item.rating || fallback.rating,
    tags: item.tags || fallback.tags,
    type: 'salon',
    workDays: item.workDays,
  };
}

const makeStyles = (scale, scaleY) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  appScreen: {
    backgroundColor: '#fff',
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 26 * scale,
  },
  logoBlock: {
    alignItems: 'center',
    marginTop: 116 * scaleY,
  },
  welcomeLogoImage: {
    height: 92 * scaleY,
    resizeMode: 'contain',
    width: 250 * scale,
  },
  logoMain: {
    color: brandPink,
    fontFamily: 'Bodoni 72',
    fontSize: 42 * scale,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 48 * scale,
  },
  logoSub: {
    color: '#75757a',
    fontSize: 16 * scale,
    fontWeight: '400',
    letterSpacing: 8.2 * scale,
    lineHeight: 21 * scale,
    marginLeft: 8 * scale,
    marginTop: -1 * scale,
  },
  copyBlock: {
    alignItems: 'center',
    marginTop: 30 * scaleY,
  },
  welcomeTitle: {
    color: darkText,
    fontSize: 27 * scale,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 34 * scale,
    marginBottom: 14 * scaleY,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    color: mutedText,
    fontSize: 15.2 * scale,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 22 * scale,
    paddingHorizontal: 2 * scale,
    textAlign: 'center',
  },
  welcomeActions: {
    bottom: 88 * scaleY,
    left: 26 * scale,
    position: 'absolute',
    right: 26 * scale,
  },
  welcomeLegalLinks: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7 * scale,
    justifyContent: 'center',
    marginTop: 16 * scaleY,
  },
  welcomeLegalText: {
    color: '#74747b',
    fontSize: 11.2 * scale,
    fontWeight: '600',
  },
  welcomeLegalDivider: {
    color: '#b9b9bf',
    fontSize: 12 * scale,
    fontWeight: '800',
  },
  primaryButton: {
    borderRadius: 10 * scale,
    height: 61 * scaleY,
    overflow: 'hidden',
  },
  primaryButtonDisabled: {
    opacity: 0.78,
  },
  gradientButton: {
    alignItems: 'center',
    borderRadius: 10 * scale,
    flex: 1,
    flexDirection: 'row',
    gap: 14 * scale,
    justifyContent: 'center',
  },
  buttonIcon: {
    marginTop: 1 * scaleY,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 20 * scale,
    fontWeight: '400',
    letterSpacing: 0,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: brandPink,
    borderRadius: 10 * scale,
    borderWidth: 1 * scale,
    height: 61 * scaleY,
    justifyContent: 'center',
    marginTop: 22 * scaleY,
  },
  secondaryButtonText: {
    color: brandPink,
    fontSize: 20 * scale,
    fontWeight: '700',
    letterSpacing: 0,
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 17 * scale,
    marginBottom: 35 * scaleY,
    marginTop: 51 * scaleY,
  },
  divider: {
    backgroundColor: '#e9e9ed',
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: mutedText,
    fontSize: 16 * scale,
    fontWeight: '600',
    letterSpacing: 0,
  },
  partnerCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#eeeef2',
    borderRadius: 8 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    height: 94 * scaleY,
    paddingHorizontal: 26 * scale,
    shadowColor: '#13131a',
    shadowOffset: { width: 0, height: 8 * scaleY },
    shadowOpacity: 0.055,
    shadowRadius: 18 * scale,
  },
  partnerIcon: {
    alignItems: 'center',
    height: 56 * scale,
    justifyContent: 'center',
    marginRight: 18 * scale,
    width: 56 * scale,
  },
  partnerText: {
    flex: 1,
  },
  partnerTitle: {
    color: darkText,
    fontSize: 16.5 * scale,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 24 * scale,
  },
  partnerSubtitle: {
    color: mutedText,
    fontSize: 13.2 * scale,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 22 * scale,
    marginTop: 7 * scaleY,
  },
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
  },
  loadingLogo: {
    color: brandPink,
    fontFamily: 'Bodoni 72',
    fontSize: 38 * scale,
    fontWeight: '500',
    lineHeight: 44 * scale,
  },
  loadingLogoImage: {
    height: 70 * scaleY,
    resizeMode: 'contain',
    width: 190 * scale,
  },
  loadingSpinner: {
    marginTop: 18 * scaleY,
  },
  homeShell: {
    backgroundColor: '#fff',
    flex: 1,
  },
  homeScrollContent: {
    paddingBottom: 112 * scaleY,
    paddingHorizontal: 24 * scale,
    paddingTop: 14 * scaleY,
  },
  homeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 62 * scaleY,
    justifyContent: 'space-between',
    position: 'relative',
  },
  homeBrandRow: {
    alignItems: 'flex-start',
    left: 0,
    position: 'absolute',
  },
  homeLogoImage: {
    height: 42 * scaleY,
    resizeMode: 'contain',
    width: 96 * scale,
  },
  homeLogo: {
    color: darkText,
    fontFamily: 'Bodoni 72',
    fontSize: 25 * scale,
    fontWeight: '500',
    lineHeight: 27 * scale,
  },
  homeLogoSub: {
    color: darkText,
    fontSize: 7.2 * scale,
    letterSpacing: 3.6 * scale,
    lineHeight: 9 * scale,
    marginLeft: 3 * scale,
    marginTop: -1 * scaleY,
  },
  cityPill: {
    alignItems: 'center',
    borderBottomColor: '#f2dce6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 7 * scale,
    alignSelf: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingBottom: 7 * scaleY,
    paddingHorizontal: 4 * scale,
  },
  cityPillText: {
    color: darkText,
    fontSize: 16 * scale,
    fontWeight: '500',
  },
  notificationButton: {
    alignItems: 'center',
    height: 42 * scale,
    justifyContent: 'center',
    marginRight: 2 * scale,
    position: 'absolute',
    right: 0,
    width: 42 * scale,
  },
  notificationDot: {
    backgroundColor: brandPink,
    borderRadius: 4 * scale,
    height: 8 * scale,
    position: 'absolute',
    right: 9 * scale,
    top: 7 * scaleY,
    width: 8 * scale,
  },
  searchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12 * scale,
    marginTop: 10 * scaleY,
  },
  homeSearch: {
    alignItems: 'center',
    borderColor,
    borderRadius: 17 * scale,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    height: 54 * scaleY,
    paddingHorizontal: 18 * scale,
  },
  homeSearchText: {
    color: '#8f8f95',
    fontSize: 14.8 * scale,
    marginLeft: 13 * scale,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: brandPink,
    borderRadius: 29 * scale,
    height: 54 * scale,
    justifyContent: 'center',
    shadowColor: brandPink,
    shadowOffset: { width: 0, height: 8 * scaleY },
    shadowOpacity: 0.24,
    shadowRadius: 13 * scale,
    width: 54 * scale,
  },
  heroBanner: {
    backgroundColor: '#fde3ea',
    borderRadius: 14 * scale,
    height: 156 * scaleY,
    marginTop: 16 * scaleY,
    overflow: 'hidden',
  },
  heroSlide: {
    height: '100%',
    overflow: 'hidden',
  },
  heroBannerImage: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  heroOverlay: {
    backgroundColor: 'rgba(255, 238, 244, 0.7)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: '55%',
  },
  heroBannerCopy: {
    left: 18 * scale,
    position: 'absolute',
    top: 16 * scaleY,
    width: '48%',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffd8de',
    borderRadius: 7 * scale,
    color: '#e25b6d',
    fontSize: 9.8 * scale,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 9 * scale,
    paddingVertical: 4 * scaleY,
  },
  heroTitle: {
    color: darkText,
    fontSize: 18 * scale,
    fontWeight: '600',
    lineHeight: 22 * scale,
    marginTop: 12 * scaleY,
  },
  heroSubtitle: {
    color: '#4c4248',
    fontSize: 10.8 * scale,
    lineHeight: 15 * scale,
    marginTop: 8 * scaleY,
  },
  heroButton: {
    alignItems: 'center',
    backgroundColor: brandPink,
    borderRadius: 7 * scale,
    height: 32 * scaleY,
    justifyContent: 'center',
    marginTop: 10 * scaleY,
    width: 116 * scale,
  },
  heroButtonText: {
    color: '#fff',
    fontSize: 11.5 * scale,
    fontWeight: '700',
  },
  heroDots: {
    bottom: 12 * scaleY,
    flexDirection: 'row',
    gap: 5 * scale,
    left: '43%',
    position: 'absolute',
    zIndex: 3,
  },
  heroDot: {
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderRadius: 4 * scale,
    height: 7 * scale,
    width: 7 * scale,
  },
  heroDotActive: {
    backgroundColor: '#fff',
    width: 15 * scale,
  },
  categoryList: {
    gap: 0,
    paddingRight: 6 * scale,
    paddingTop: 18 * scaleY,
  },
  categoryItem: {
    alignItems: 'center',
    width: 82 * scale,
  },
  categoryIconBox: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: 15 * scale,
    borderWidth: 0,
    height: 58 * scale,
    justifyContent: 'center',
    width: 58 * scale,
  },
  categoryIconImage: {
    height: 58 * scale,
    resizeMode: 'contain',
    width: 58 * scale,
  },
  categoryText: {
    color: darkText,
    fontSize: 10.8 * scale,
    lineHeight: 14 * scale,
    marginTop: 8 * scaleY,
    minHeight: 32 * scaleY,
    textAlign: 'center',
  },
  homeSection: {
    marginTop: 20 * scaleY,
  },
  homeSectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14 * scaleY,
  },
  homeSectionTitle: {
    color: darkText,
    fontSize: 18 * scale,
    fontWeight: '700',
  },
  homeSectionLink: {
    color: brandPink,
    fontSize: 14 * scale,
    fontWeight: '500',
  },
  homeCardsRow: {
    flexDirection: 'row',
    gap: 12 * scale,
    paddingRight: 24 * scale,
  },
  homeEmptyCard: {
    alignItems: 'center',
    backgroundColor: '#fff8fb',
    borderColor: '#f6e3eb',
    borderRadius: 14 * scale,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 94 * scaleY,
    paddingHorizontal: 18 * scale,
  },
  homeEmptyText: {
    color: '#8a8d96',
    fontSize: 13.5 * scale,
    textAlign: 'center',
  },
  homeDataError: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#fff3f7',
    borderColor: '#ffd6e4',
    borderRadius: 12 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8 * scale,
    justifyContent: 'center',
    marginTop: 16 * scaleY,
    minHeight: 42 * scaleY,
    paddingHorizontal: 14 * scale,
  },
  homeDataErrorText: {
    color: brandPink,
    fontSize: 12.5 * scale,
    fontWeight: '700',
  },
  masterHomeCard: {
    backgroundColor: '#fff',
    borderColor: '#eeeef2',
    borderRadius: 8 * scale,
    borderWidth: 1,
    overflow: 'hidden',
    width: 132 * scale,
  },
  masterHomeCardSelected: {
    borderColor: brandPink,
    borderWidth: 2,
  },
  masterHomeImage: {
    height: 93 * scaleY,
    width: '100%',
  },
  salonHomeCard: {
    backgroundColor: '#fff',
    borderColor: '#eeeef2',
    borderRadius: 8 * scale,
    borderWidth: 1,
    overflow: 'hidden',
    width: 168 * scale,
  },
  salonHomeImage: {
    height: 85 * scaleY,
    width: '100%',
  },
  ratingBadge: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5 * scale,
    bottom: 6 * scaleY,
    flexDirection: 'row',
    gap: 3 * scale,
    left: 6 * scale,
    paddingHorizontal: 6 * scale,
    paddingVertical: 3 * scaleY,
    position: 'absolute',
  },
  ratingText: {
    color: darkText,
    fontSize: 10.5 * scale,
    fontWeight: '700',
  },
  homeHeartButton: {
    position: 'absolute',
    right: 8 * scale,
    top: 8 * scaleY,
  },
  homeCardBody: {
    paddingHorizontal: 10 * scale,
    paddingVertical: 10 * scaleY,
  },
  homeCardTitle: {
    color: darkText,
    fontSize: 12.8 * scale,
    fontWeight: '700',
  },
  homeCardSubtitle: {
    color: '#77777d',
    fontSize: 11.2 * scale,
    lineHeight: 16 * scale,
    marginTop: 5 * scaleY,
  },
  homeCardPrice: {
    color: darkText,
    fontSize: 12 * scale,
    fontWeight: '700',
    marginTop: 8 * scaleY,
  },
  homePromoGrid: {
    flexDirection: 'row',
    gap: 10 * scale,
    marginTop: 27 * scaleY,
  },
  promoTile: {
    backgroundColor: '#ffe0e8',
    borderRadius: 12 * scale,
    flex: 1,
    height: 124 * scaleY,
    overflow: 'hidden',
  },
  promoTileCopy: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 12 * scale,
    paddingVertical: 12 * scaleY,
    position: 'relative',
    zIndex: 2,
    width: '72%',
  },
  promoTitle: {
    color: darkText,
    fontSize: 13.2 * scale,
    fontWeight: '700',
    lineHeight: 16.5 * scale,
  },
  promoSubtitle: {
    color: '#4c4248',
    fontSize: 10.2 * scale,
    lineHeight: 14 * scale,
    marginTop: 6 * scaleY,
  },
  promoImage: {
    bottom: 0,
    height: '100%',
    position: 'absolute',
    right: 0,
    width: '100%',
  },
  promoOverlay: {
    backgroundColor: 'rgba(255, 237, 243, 0.84)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: '76%',
  },
  bottomTabs: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopColor: '#eeeef2',
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    height: 88 * scaleY,
    justifyContent: 'space-around',
    left: 0,
    paddingBottom: 21 * scaleY,
    position: 'absolute',
    right: 0,
    shadowColor: '#13131a',
    shadowOffset: { width: 0, height: -8 * scaleY },
    shadowOpacity: 0.06,
    shadowRadius: 16 * scale,
  },
  bottomTab: {
    alignItems: 'center',
    gap: 4 * scaleY,
    minWidth: 58 * scale,
  },
  bottomTabText: {
    color: '#666872',
    fontSize: 11.5 * scale,
  },
  bottomTabTextActive: {
    color: brandPink,
  },
  homeModalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: 18 * scale,
  },
  homeModalSheet: {
    backgroundColor: '#fff',
    borderRadius: 16 * scale,
    padding: 20 * scale,
    width: '100%',
  },
  homeModalTitle: {
    color: darkText,
    fontSize: 21 * scale,
    fontWeight: '700',
    lineHeight: 28 * scale,
    textAlign: 'center',
  },
  homeModalText: {
    color: mutedText,
    fontSize: 15 * scale,
    lineHeight: 22 * scale,
    marginTop: 12 * scaleY,
    textAlign: 'center',
  },
  homeModalOption: {
    alignItems: 'center',
    borderBottomColor: '#eeeef2',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52 * scaleY,
  },
  homeModalOptionText: {
    color: darkText,
    fontSize: 16 * scale,
    fontWeight: '500',
  },
  homeModalButton: {
    alignItems: 'center',
    backgroundColor: brandPink,
    borderRadius: 10 * scale,
    height: 50 * scaleY,
    justifyContent: 'center',
    marginTop: 22 * scaleY,
  },
  homeModalButtonText: {
    color: '#fff',
    fontSize: 16 * scale,
    fontWeight: '700',
  },
  legalBackButton: {
    alignItems: 'center',
    backgroundColor: '#fff6f9',
    borderColor: '#ffe0ea',
    borderRadius: 18 * scale,
    borderWidth: 1,
    height: 42 * scale,
    justifyContent: 'center',
    width: 42 * scale,
  },
  profileShell: {
    backgroundColor: '#fff',
    flex: 1,
  },
  profileContent: {
    paddingBottom: 116 * scaleY,
    paddingHorizontal: 16 * scale,
    paddingTop: 14 * scaleY,
  },
  profileHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileTitle: {
    color: darkText,
    fontSize: 24 * scale,
    fontWeight: '800',
  },
  guestProfileContent: {
    flex: 1,
    paddingBottom: 108 * scaleY,
    paddingHorizontal: 24 * scale,
    paddingTop: 14 * scaleY,
  },
  guestProfileBody: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 22 * scaleY,
  },
  guestProfileIcon: {
    alignItems: 'center',
    backgroundColor: '#fff0f5',
    borderColor: '#ffd6e5',
    borderRadius: 58 * scale,
    borderWidth: 1,
    height: 116 * scale,
    justifyContent: 'center',
    width: 116 * scale,
  },
  guestProfileTitle: {
    color: darkText,
    fontSize: 24 * scale,
    fontWeight: '800',
    lineHeight: 31 * scale,
    marginTop: 30 * scaleY,
    textAlign: 'center',
  },
  guestProfileSubtitle: {
    color: mutedText,
    fontSize: 15 * scale,
    lineHeight: 22 * scale,
    marginTop: 13 * scaleY,
    maxWidth: 350 * scale,
    textAlign: 'center',
  },
  guestProfileActions: {
    marginTop: 38 * scaleY,
    width: '100%',
  },
  profileHeaderActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18 * scale,
  },
  profileHeaderBadge: {
    alignItems: 'center',
    backgroundColor: brandPink,
    borderRadius: 10 * scale,
    height: 19 * scale,
    justifyContent: 'center',
    position: 'absolute',
    right: -7 * scale,
    top: -9 * scaleY,
    width: 19 * scale,
  },
  profileHeaderBadgeText: {
    color: '#fff',
    fontSize: 10 * scale,
    fontWeight: '800',
  },
  profileIdentity: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18 * scale,
    marginTop: 26 * scaleY,
  },
  profileAvatar: {
    borderRadius: 36 * scale,
    height: 72 * scale,
    width: 72 * scale,
  },
  profileAvatarFallback: {
    alignItems: 'center',
    backgroundColor: '#fff0f5',
    borderColor: '#ffd6e5',
    borderRadius: 36 * scale,
    borderWidth: 1,
    height: 72 * scale,
    justifyContent: 'center',
    width: 72 * scale,
  },
  profileAvatarInitials: {
    color: brandPink,
    fontSize: 22 * scale,
    fontWeight: '800',
  },
  profileCamera: {
    alignItems: 'center',
    backgroundColor: brandPink,
    borderColor: '#fff',
    borderRadius: 16 * scale,
    borderWidth: 3,
    bottom: -2 * scaleY,
    height: 31 * scale,
    justifyContent: 'center',
    position: 'absolute',
    right: -3 * scale,
    width: 31 * scale,
  },
  profileIdentityText: {
    flex: 1,
  },
  profileName: {
    color: darkText,
    fontSize: 18 * scale,
    fontWeight: '800',
  },
  profilePhone: {
    color: '#6f727c',
    fontSize: 14 * scale,
    marginTop: 7 * scaleY,
  },
  profileRole: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffe7f0',
    borderRadius: 8 * scale,
    color: brandPink,
    fontSize: 12 * scale,
    fontWeight: '700',
    marginTop: 9 * scaleY,
    overflow: 'hidden',
    paddingHorizontal: 11 * scale,
    paddingVertical: 5 * scaleY,
  },
  profileMeta: {
    color: '#8a8b91',
    fontSize: 13 * scale,
    marginTop: 7 * scaleY,
  },
  profileStateCard: {
    alignItems: 'center',
    backgroundColor: '#fff8fb',
    borderColor: '#ffe0ea',
    borderRadius: 15 * scale,
    borderWidth: 1,
    gap: 8 * scaleY,
    marginTop: 18 * scaleY,
    padding: 18 * scale,
  },
  profileStateTitle: {
    color: darkText,
    fontSize: 16 * scale,
    fontWeight: '800',
  },
  profileStateText: {
    color: mutedText,
    fontSize: 13 * scale,
    lineHeight: 19 * scale,
    textAlign: 'center',
  },
  profileRetryButton: {
    alignItems: 'center',
    borderColor: brandPink,
    borderRadius: 11 * scale,
    borderWidth: 1,
    height: 38 * scaleY,
    justifyContent: 'center',
    marginTop: 4 * scaleY,
    paddingHorizontal: 18 * scale,
  },
  profileRetryButtonText: {
    color: brandPink,
    fontSize: 14 * scale,
    fontWeight: '800',
  },
  premiumCard: {
    alignItems: 'center',
    backgroundColor: '#fff0f5',
    borderColor: '#ffd6e5',
    borderRadius: 15 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14 * scale,
    marginTop: 26 * scaleY,
    minHeight: 102 * scaleY,
    padding: 14 * scale,
  },
  premiumIcon: {
    alignItems: 'center',
    backgroundColor: '#ffddea',
    borderRadius: 32 * scale,
    height: 64 * scale,
    justifyContent: 'center',
    width: 64 * scale,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    color: darkText,
    fontSize: 16 * scale,
    fontWeight: '800',
  },
  premiumSubtitle: {
    color: '#737681',
    fontSize: 12.5 * scale,
    lineHeight: 19 * scale,
    marginTop: 3 * scaleY,
  },
  premiumButton: {
    alignItems: 'center',
    borderColor: brandPink,
    borderRadius: 9 * scale,
    borderWidth: 1,
    height: 36 * scaleY,
    justifyContent: 'center',
    paddingHorizontal: 14 * scale,
  },
  premiumButtonText: {
    color: brandPink,
    fontSize: 13 * scale,
    fontWeight: '800',
  },
  profilePanel: {
    backgroundColor: '#fff',
    borderColor: '#eeeef2',
    borderRadius: 15 * scale,
    borderWidth: 1,
    marginTop: 18 * scaleY,
    padding: 14 * scale,
  },
  profileSectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14 * scaleY,
  },
  profileSectionTitle: {
    color: darkText,
    fontSize: 18 * scale,
    fontWeight: '800',
  },
  profileSeeAll: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4 * scale,
  },
  profileSeeAllText: {
    color: '#6f727c',
    fontSize: 12.5 * scale,
    fontWeight: '500',
  },
  profileEmptyBlock: {
    alignItems: 'center',
    backgroundColor: '#fff8fb',
    borderColor: '#ffe4ed',
    borderRadius: 13 * scale,
    borderWidth: 1,
    gap: 6 * scaleY,
    paddingHorizontal: 14 * scale,
    paddingVertical: 18 * scaleY,
  },
  profileEmptyTitle: {
    color: darkText,
    fontSize: 14.5 * scale,
    fontWeight: '800',
    textAlign: 'center',
  },
  profileEmptyText: {
    color: mutedText,
    fontSize: 12.5 * scale,
    lineHeight: 18 * scale,
    textAlign: 'center',
  },
  appointmentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12 * scale,
  },
  appointmentImage: {
    borderRadius: 7 * scale,
    height: 78 * scale,
    width: 78 * scale,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    color: darkText,
    fontSize: 15.5 * scale,
    fontWeight: '800',
  },
  appointmentMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6 * scale,
    marginTop: 9 * scaleY,
  },
  appointmentMeta: {
    color: '#737681',
    fontSize: 11.5 * scale,
  },
  appointmentPlace: {
    color: '#737681',
    fontSize: 12.5 * scale,
    marginTop: 8 * scaleY,
  },
  appointmentMaster: {
    color: '#8b8d95',
    fontSize: 12 * scale,
    marginTop: 3 * scaleY,
  },
  appointmentStatus: {
    backgroundColor: '#e8f8ee',
    borderRadius: 8 * scale,
    paddingHorizontal: 9 * scale,
    paddingVertical: 6 * scaleY,
  },
  appointmentStatusText: {
    color: '#41b66a',
    fontSize: 11 * scale,
    fontWeight: '800',
  },
  partnerModerationCard: {
    alignItems: 'flex-start',
    backgroundColor: '#fff8e8',
    borderColor: '#ffe4a8',
    borderRadius: 15 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 18 * scaleY,
    padding: 15 * scale,
  },
  partnerModerationText: {
    flex: 1,
    marginLeft: 12 * scale,
  },
  partnerModerationTitle: {
    color: '#754f00',
    fontSize: 15 * scale,
    fontWeight: '800',
  },
  partnerModerationSubtitle: {
    color: '#8b6a26',
    fontSize: 12.5 * scale,
    lineHeight: 18 * scale,
    marginTop: 5 * scaleY,
  },
  salonTeamPanel: {
    backgroundColor: '#fff',
    borderColor: '#eeeef2',
    borderRadius: 16 * scale,
    borderWidth: 1,
    marginTop: 18 * scaleY,
    padding: 15 * scale,
  },
  salonTeamTitle: {
    color: darkText,
    fontSize: 18 * scale,
    fontWeight: '800',
  },
  salonTeamSubtitle: {
    color: mutedText,
    fontSize: 12.5 * scale,
    lineHeight: 18 * scale,
    marginBottom: 14 * scaleY,
    marginTop: 6 * scaleY,
  },
  salonTeamAddButton: {
    alignItems: 'center',
    backgroundColor: brandPink,
    borderRadius: 13 * scale,
    flexDirection: 'row',
    gap: 8 * scale,
    justifyContent: 'center',
    marginTop: 10 * scaleY,
    minHeight: 48 * scaleY,
  },
  salonTeamAddButtonDisabled: {
    opacity: 0.55,
  },
  salonTeamAddButtonText: {
    color: '#fff',
    fontSize: 14.5 * scale,
    fontWeight: '800',
  },
  salonTeamList: {
    marginTop: 14 * scaleY,
  },
  salonTeamRow: {
    alignItems: 'center',
    borderTopColor: '#f0f0f3',
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingVertical: 11 * scaleY,
  },
  salonTeamAvatar: {
    alignItems: 'center',
    backgroundColor: '#fff0f5',
    borderRadius: 20 * scale,
    height: 40 * scale,
    justifyContent: 'center',
    width: 40 * scale,
  },
  salonTeamAvatarText: {
    color: brandPink,
    fontSize: 13 * scale,
    fontWeight: '800',
  },
  salonTeamInfo: {
    flex: 1,
    marginLeft: 11 * scale,
  },
  salonTeamName: {
    color: darkText,
    fontSize: 14 * scale,
    fontWeight: '700',
  },
  salonTeamPhone: {
    color: mutedText,
    fontSize: 12 * scale,
    marginTop: 3 * scaleY,
  },
  salonTeamEmpty: {
    color: mutedText,
    fontSize: 13 * scale,
    paddingVertical: 8 * scaleY,
    textAlign: 'center',
  },
  partnerScheduleButton: {
    alignItems: 'center',
    backgroundColor: brandPink,
    borderRadius: 16 * scale,
    flexDirection: 'row',
    marginTop: 18 * scaleY,
    padding: 15 * scale,
  },
  partnerScheduleIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 22 * scale,
    height: 44 * scale,
    justifyContent: 'center',
    width: 44 * scale,
  },
  partnerScheduleCopy: {
    flex: 1,
    marginLeft: 13 * scale,
  },
  partnerScheduleTitle: {
    color: '#fff',
    fontSize: 16 * scale,
    fontWeight: '800',
  },
  partnerScheduleSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12 * scale,
    marginTop: 4 * scaleY,
  },
  profileLogoutButton: {
    alignItems: 'center',
    borderColor: '#f1ccd8',
    borderRadius: 12 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20 * scaleY,
    minHeight: 50 * scaleY,
  },
  profileLogoutText: {
    color: '#d52d5f',
    fontSize: 15 * scale,
    fontWeight: '700',
    marginLeft: 8 * scale,
  },
  appointmentsContent: {
    paddingBottom: 112 * scaleY,
    paddingHorizontal: 24 * scale,
    paddingTop: 14 * scaleY,
  },
  appointmentsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18 * scaleY,
  },
  appointmentsTitle: {
    color: darkText,
    fontSize: 28 * scale,
    fontWeight: '800',
  },
  appointmentsSubtitle: {
    color: mutedText,
    fontSize: 14 * scale,
    marginTop: 6 * scaleY,
  },
  appointmentsHeaderButton: {
    alignItems: 'center',
    backgroundColor: '#fff6f9',
    borderRadius: 18 * scale,
    height: 44 * scale,
    justifyContent: 'center',
    width: 44 * scale,
  },
  appointmentSummaryCard: {
    alignItems: 'center',
    backgroundColor: '#fff3f7',
    borderColor: '#ffdce8',
    borderRadius: 16 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 16 * scale,
  },
  appointmentSummaryIcon: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25 * scale,
    height: 50 * scale,
    justifyContent: 'center',
    marginRight: 14 * scale,
    width: 50 * scale,
  },
  appointmentSummaryText: {
    flex: 1,
  },
  appointmentSummaryTitle: {
    color: darkText,
    fontSize: 16 * scale,
    fontWeight: '800',
  },
  appointmentSummaryMeta: {
    color: '#737681',
    fontSize: 13 * scale,
    lineHeight: 18 * scale,
    marginTop: 5 * scaleY,
  },
  appointmentStatsRow: {
    flexDirection: 'row',
    gap: 10 * scale,
    marginTop: 14 * scaleY,
  },
  appointmentStatCard: {
    backgroundColor: '#fff',
    borderColor: '#eeeef2',
    borderRadius: 14 * scale,
    borderWidth: 1,
    flex: 1,
    minHeight: 72 * scaleY,
    paddingHorizontal: 10 * scale,
    paddingVertical: 12 * scaleY,
  },
  appointmentStatValue: {
    color: darkText,
    fontSize: 17 * scale,
    fontWeight: '800',
  },
  appointmentStatLabel: {
    color: mutedText,
    fontSize: 11.5 * scale,
    marginTop: 6 * scaleY,
  },
  salonScheduleSection: {
    marginTop: 20 * scaleY,
  },
  salonScheduleToolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  salonScheduleTitle: {
    color: darkText,
    fontSize: 17 * scale,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  salonScheduleSubtitle: {
    color: mutedText,
    fontSize: 12 * scale,
    marginTop: 4 * scaleY,
  },
  salonScheduleLegend: {
    alignItems: 'center',
    backgroundColor: '#f2f8ff',
    borderRadius: 12 * scale,
    flexDirection: 'row',
    gap: 5 * scale,
    paddingHorizontal: 9 * scale,
    paddingVertical: 6 * scaleY,
  },
  salonScheduleLegendDot: {
    backgroundColor: '#2f80ed',
    borderRadius: 4 * scale,
    height: 8 * scale,
    width: 8 * scale,
  },
  salonScheduleLegendText: {
    color: '#4d6d95',
    fontSize: 10 * scale,
    fontWeight: '700',
  },
  salonScheduleDateRow: {
    gap: 8 * scale,
    paddingBottom: 14 * scaleY,
    paddingTop: 14 * scaleY,
  },
  salonScheduleDateChip: {
    alignItems: 'center',
    backgroundColor: '#f7f7f9',
    borderColor: '#ececf0',
    borderRadius: 16 * scale,
    borderWidth: 1,
    height: 58 * scaleY,
    justifyContent: 'center',
    width: 48 * scale,
  },
  salonScheduleDateChipActive: {
    backgroundColor: '#2f80ed',
    borderColor: '#2f80ed',
  },
  salonScheduleDateWeekday: {
    color: '#90929a',
    fontSize: 9.5 * scale,
    fontWeight: '700',
  },
  salonScheduleDateNumber: {
    color: darkText,
    fontSize: 17 * scale,
    fontWeight: '800',
    marginTop: 3 * scaleY,
  },
  salonScheduleDateTextActive: {
    color: '#fff',
  },
  salonScheduleBoard: {
    backgroundColor: '#fff',
    borderColor: '#e5e6ea',
    borderRadius: 14 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  salonScheduleTimeRail: {
    backgroundColor: '#fbfbfc',
    borderRightColor: '#dedfe4',
    borderRightWidth: 1,
    width: 62 * scale,
    zIndex: 2,
  },
  salonScheduleTimeHeader: {
    alignItems: 'center',
    borderBottomColor: '#dedfe4',
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  salonScheduleTimeHeaderText: {
    color: '#8c8e96',
    fontSize: 9.5 * scale,
    fontWeight: '700',
    marginTop: 3 * scaleY,
    textTransform: 'uppercase',
  },
  salonScheduleTimeCell: {
    alignItems: 'flex-end',
    borderBottomColor: '#e8e8ec',
    borderBottomWidth: 1,
    justifyContent: 'flex-start',
    paddingRight: 7 * scale,
    paddingTop: 5 * scaleY,
  },
  salonScheduleTimeLabel: {
    color: '#666871',
    fontSize: 11 * scale,
    fontWeight: '700',
  },
  salonScheduleMasterHeader: {
    backgroundColor: '#fff',
    borderBottomColor: '#dedfe4',
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  salonScheduleMasterCell: {
    alignItems: 'center',
    borderRightColor: '#e5e6ea',
    borderRightWidth: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 7 * scale,
  },
  salonScheduleMasterAvatar: {
    alignItems: 'center',
    backgroundColor: '#eaf3ff',
    borderRadius: 15 * scale,
    height: 30 * scale,
    justifyContent: 'center',
    width: 30 * scale,
  },
  salonScheduleMasterAvatarText: {
    color: '#2f80ed',
    fontSize: 10 * scale,
    fontWeight: '900',
  },
  salonScheduleMasterName: {
    color: darkText,
    fontSize: 11.5 * scale,
    fontWeight: '800',
    marginTop: 4 * scaleY,
    maxWidth: '100%',
  },
  salonScheduleMasterRole: {
    color: '#92949c',
    fontSize: 8.5 * scale,
    marginTop: 1 * scaleY,
  },
  salonScheduleCanvas: {
    backgroundColor: '#fff',
    position: 'relative',
  },
  salonScheduleFreeCell: {
    alignItems: 'center',
    borderBottomColor: '#e8e8ec',
    borderBottomWidth: 1,
    borderRightColor: '#e5e6ea',
    borderRightWidth: 1,
    justifyContent: 'center',
    position: 'absolute',
  },
  salonScheduleFreeText: {
    color: '#c4c6cc',
    fontSize: 9.5 * scale,
    fontWeight: '600',
  },
  salonScheduleEvent: {
    backgroundColor: '#dceeff',
    borderColor: '#9cccf8',
    borderLeftColor: '#2f80ed',
    borderLeftWidth: 4 * scale,
    borderRadius: 7 * scale,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 7 * scale,
    paddingVertical: 5 * scaleY,
    position: 'absolute',
    zIndex: 4,
  },
  salonScheduleEventgreen: {
    backgroundColor: '#dceeff',
    borderColor: '#9cccf8',
    borderLeftColor: '#2f80ed',
  },
  salonScheduleEventpink: {
    backgroundColor: '#ffe2ec',
    borderColor: '#f6abc4',
    borderLeftColor: brandPink,
  },
  salonScheduleEventgold: {
    backgroundColor: '#fff0cb',
    borderColor: '#f0cb70',
    borderLeftColor: '#e4a51d',
  },
  salonScheduleEventTime: {
    color: '#315c87',
    fontSize: 10 * scale,
    fontWeight: '800',
  },
  salonScheduleEventClient: {
    color: '#172b3f',
    fontSize: 12 * scale,
    fontWeight: '900',
    marginTop: 3 * scaleY,
  },
  salonScheduleEventService: {
    color: '#3d5c78',
    fontSize: 9.5 * scale,
    lineHeight: 12 * scale,
    marginTop: 3 * scaleY,
  },
  appointmentFilterRow: {
    backgroundColor: '#f6f6f8',
    borderRadius: 17 * scale,
    flexDirection: 'row',
    marginTop: 18 * scaleY,
    padding: 4 * scale,
  },
  appointmentFilterChip: {
    alignItems: 'center',
    borderRadius: 14 * scale,
    flex: 1,
    height: 38 * scaleY,
    justifyContent: 'center',
  },
  appointmentFilterChipActive: {
    backgroundColor: '#fff',
  },
  appointmentFilterText: {
    color: mutedText,
    fontSize: 14 * scale,
    fontWeight: '600',
  },
  appointmentFilterTextActive: {
    color: brandPink,
  },
  appointmentList: {
    gap: 14 * scaleY,
    marginTop: 16 * scaleY,
  },
  appointmentTimeline: {
    gap: 20 * scaleY,
    marginTop: 18 * scaleY,
  },
  appointmentDayGroup: {
    gap: 12 * scaleY,
  },
  appointmentDayHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  appointmentDayTitle: {
    color: darkText,
    fontSize: 17 * scale,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  appointmentDaySubtitle: {
    color: mutedText,
    fontSize: 11.5 * scale,
    marginTop: 3 * scaleY,
  },
  appointmentDayCountBadge: {
    alignItems: 'center',
    backgroundColor: '#fff0f5',
    borderRadius: 14 * scale,
    flexDirection: 'row',
    gap: 5 * scale,
    minHeight: 30 * scaleY,
    paddingHorizontal: 10 * scale,
  },
  appointmentDayCount: {
    color: brandPink,
    fontSize: 12 * scale,
    fontWeight: '800',
    textAlign: 'center',
  },
  calendarColumnHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 2 * scaleY,
  },
  calendarColumnTime: {
    color: '#a0a1a8',
    fontSize: 10 * scale,
    fontWeight: '700',
    paddingRight: 7 * scale,
    textAlign: 'right',
    textTransform: 'uppercase',
    width: 58 * scale,
  },
  calendarColumnAxisSpace: {
    width: 24 * scale,
  },
  calendarColumnEvents: {
    color: '#a0a1a8',
    flex: 1,
    fontSize: 10 * scale,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  calendarEventRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    minHeight: 142 * scaleY,
  },
  calendarTimeGutter: {
    alignItems: 'flex-end',
    paddingRight: 7 * scale,
    paddingTop: 3 * scaleY,
    width: 58 * scale,
  },
  calendarTimeText: {
    color: darkText,
    fontSize: 16 * scale,
    fontWeight: '900',
    width: '100%',
    textAlign: 'right',
  },
  calendarDurationText: {
    color: mutedText,
    fontSize: 9.5 * scale,
    marginTop: 3 * scaleY,
    textAlign: 'right',
  },
  calendarAxis: {
    alignItems: 'center',
    width: 24 * scale,
  },
  calendarAxisDot: {
    backgroundColor: brandPink,
    borderColor: '#fff',
    borderRadius: 8 * scale,
    borderWidth: 3,
    height: 16 * scale,
    marginTop: 4 * scaleY,
    shadowColor: brandPink,
    shadowOpacity: 0.25,
    shadowRadius: 5 * scale,
    width: 16 * scale,
    zIndex: 2,
  },
  calendarAxisDotgreen: {
    backgroundColor: '#36b96c',
  },
  calendarAxisDotpink: {
    backgroundColor: brandPink,
  },
  calendarAxisDotgold: {
    backgroundColor: '#e7a92b',
  },
  calendarAxisLine: {
    backgroundColor: '#e4e4e9',
    bottom: -12 * scaleY,
    position: 'absolute',
    top: 20 * scaleY,
    width: 2,
  },
  calendarEventCard: {
    backgroundColor: '#fff7fa',
    borderColor: '#f4dce5',
    borderLeftColor: brandPink,
    borderLeftWidth: 4 * scale,
    borderRadius: 14 * scale,
    borderWidth: 1,
    flex: 1,
    marginBottom: 12 * scaleY,
    padding: 13 * scale,
    shadowColor: '#202028',
    shadowOffset: { width: 0, height: 4 * scaleY },
    shadowOpacity: 0.045,
    shadowRadius: 9 * scale,
  },
  calendarEventgreen: {
    backgroundColor: '#f2fbf5',
    borderColor: '#d8f0e0',
    borderLeftColor: '#36b96c',
  },
  calendarEventpink: {
    backgroundColor: '#fff7fa',
    borderColor: '#f4dce5',
    borderLeftColor: brandPink,
  },
  calendarEventgold: {
    backgroundColor: '#fffbef',
    borderColor: '#f4e7bf',
    borderLeftColor: '#e7a92b',
  },
  calendarEventTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8 * scale,
  },
  calendarEventService: {
    color: darkText,
    flex: 1,
    fontSize: 15.5 * scale,
    fontWeight: '800',
    lineHeight: 20 * scale,
  },
  calendarStatusPill: {
    borderRadius: 9 * scale,
    maxWidth: 104 * scale,
    paddingHorizontal: 8 * scale,
    paddingVertical: 5 * scaleY,
  },
  calendarStatusText: {
    fontSize: 10.5 * scale,
    fontWeight: '800',
    textAlign: 'center',
  },
  calendarEventPlace: {
    color: '#4c4e56',
    fontSize: 13.5 * scale,
    fontWeight: '700',
    marginTop: 8 * scaleY,
  },
  calendarEventMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6 * scale,
    marginTop: 6 * scaleY,
  },
  calendarEventMeta: {
    color: mutedText,
    flex: 1,
    fontSize: 12 * scale,
  },
  calendarEventFooter: {
    alignItems: 'flex-end',
    borderTopColor: 'rgba(80,80,90,0.10)',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10 * scaleY,
    paddingTop: 9 * scaleY,
  },
  calendarEventPrice: {
    color: brandPink,
    flexShrink: 1,
    fontSize: 13.5 * scale,
    fontWeight: '800',
  },
  calendarReminderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4 * scale,
    marginLeft: 8 * scale,
  },
  calendarReminderText: {
    color: '#777982',
    fontSize: 9.5 * scale,
  },
  appointmentStateCard: {
    alignItems: 'center',
    backgroundColor: '#fff8fb',
    borderColor: '#ffe0ea',
    borderRadius: 16 * scale,
    borderWidth: 1,
    gap: 8 * scaleY,
    paddingHorizontal: 18 * scale,
    paddingVertical: 24 * scaleY,
  },
  appointmentStateTitle: {
    color: darkText,
    fontSize: 16 * scale,
    fontWeight: '800',
    textAlign: 'center',
  },
  appointmentStateText: {
    color: mutedText,
    fontSize: 13 * scale,
    lineHeight: 19 * scale,
    textAlign: 'center',
  },
  appointmentFullCard: {
    backgroundColor: '#fff',
    borderColor: '#eeeef2',
    borderRadius: 16 * scale,
    borderWidth: 1,
    padding: 13 * scale,
    shadowColor: '#121218',
    shadowOffset: { width: 0, height: 6 * scaleY },
    shadowOpacity: 0.04,
    shadowRadius: 12 * scale,
  },
  appointmentFullTop: {
    flexDirection: 'row',
  },
  appointmentFullImage: {
    borderRadius: 12 * scale,
    height: 92 * scale,
    marginRight: 13 * scale,
    width: 92 * scale,
  },
  appointmentFullInfo: {
    flex: 1,
  },
  appointmentFullTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8 * scale,
  },
  appointmentFullTitle: {
    color: darkText,
    flex: 1,
    fontSize: 16 * scale,
    fontWeight: '800',
  },
  appointmentFullStatus: {
    borderRadius: 9 * scale,
    paddingHorizontal: 9 * scale,
    paddingVertical: 5 * scaleY,
  },
  appointmentStatusgreen: {
    backgroundColor: '#e8f8ee',
  },
  appointmentStatuspink: {
    backgroundColor: '#fff0f6',
  },
  appointmentStatusgold: {
    backgroundColor: '#fff6df',
  },
  appointmentFullStatusText: {
    fontSize: 10.5 * scale,
    fontWeight: '800',
  },
  appointmentStatusTextgreen: {
    color: '#41b66a',
  },
  appointmentStatusTextpink: {
    color: brandPink,
  },
  appointmentStatusTextgold: {
    color: '#bf8b16',
  },
  appointmentFullPlace: {
    color: '#555861',
    fontSize: 13.5 * scale,
    fontWeight: '600',
    marginTop: 8 * scaleY,
  },
  appointmentFullMaster: {
    color: mutedText,
    fontSize: 12.5 * scale,
    marginTop: 4 * scaleY,
  },
  appointmentFullMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5 * scale,
    marginTop: 10 * scaleY,
  },
  appointmentFullMeta: {
    color: '#737681',
    fontSize: 11.5 * scale,
  },
  appointmentFullFooter: {
    alignItems: 'center',
    borderTopColor: '#f0f0f3',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 13 * scaleY,
    paddingTop: 12 * scaleY,
  },
  appointmentFullPrice: {
    color: darkText,
    fontSize: 15 * scale,
    fontWeight: '800',
  },
  appointmentFullDuration: {
    color: mutedText,
    fontSize: 11.5 * scale,
    marginTop: 3 * scaleY,
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 8 * scale,
  },
  appointmentGhostButton: {
    alignItems: 'center',
    borderColor: '#ffd0df',
    borderRadius: 12 * scale,
    borderWidth: 1,
    height: 36 * scaleY,
    justifyContent: 'center',
    paddingHorizontal: 12 * scale,
  },
  appointmentGhostButtonText: {
    color: brandPink,
    fontSize: 12 * scale,
    fontWeight: '700',
  },
  appointmentPrimaryButton: {
    alignItems: 'center',
    backgroundColor: brandPink,
    borderRadius: 12 * scale,
    height: 36 * scaleY,
    justifyContent: 'center',
    paddingHorizontal: 15 * scale,
  },
  appointmentPrimaryButtonText: {
    color: '#fff',
    fontSize: 12 * scale,
    fontWeight: '800',
  },
  profileFavoritesRow: {
    gap: 14 * scale,
    paddingRight: 14 * scale,
  },
  profileFavoriteCard: {
    width: 126 * scale,
  },
  profileFavoriteImage: {
    borderRadius: 9 * scale,
    height: 86 * scale,
    width: '100%',
  },
  profileFavoriteHeart: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 17 * scale,
    height: 32 * scale,
    justifyContent: 'center',
    position: 'absolute',
    right: 8 * scale,
    top: 8 * scaleY,
    width: 32 * scale,
  },
  profileFavoriteTitle: {
    color: darkText,
    fontSize: 12.7 * scale,
    fontWeight: '800',
    marginTop: 9 * scaleY,
  },
  profileFavoriteSubtitle: {
    color: '#737681',
    fontSize: 11.3 * scale,
    marginTop: 5 * scaleY,
  },
  profileRatingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4 * scale,
    marginTop: 7 * scaleY,
  },
  profileRatingText: {
    color: '#4e5058',
    fontSize: 11.5 * scale,
    fontWeight: '700',
  },
  profileMenu: {
    backgroundColor: '#fff',
    borderColor: '#eeeef2',
    borderRadius: 15 * scale,
    borderWidth: 1,
    marginTop: 18 * scaleY,
    paddingHorizontal: 14 * scale,
  },
  profileMenuItem: {
    alignItems: 'center',
    borderBottomColor: '#eeeef2',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 14 * scale,
    minHeight: 51 * scaleY,
  },
  profileMenuText: {
    color: darkText,
    flex: 1,
    fontSize: 14.2 * scale,
    fontWeight: '600',
  },
  profileMenuBadge: {
    alignItems: 'center',
    backgroundColor: brandPink,
    borderRadius: 13 * scale,
    height: 26 * scale,
    justifyContent: 'center',
    width: 26 * scale,
  },
  profileMenuBadgeText: {
    color: '#fff',
    fontSize: 12 * scale,
    fontWeight: '800',
  },
  inviteCard: {
    alignItems: 'center',
    backgroundColor: '#fff0f5',
    borderRadius: 13 * scale,
    flexDirection: 'row',
    gap: 13 * scale,
    marginTop: 18 * scaleY,
    padding: 15 * scale,
  },
  inviteText: {
    flex: 1,
  },
  inviteTitle: {
    color: '#6d717c',
    fontSize: 13.2 * scale,
    fontWeight: '800',
  },
  inviteSubtitle: {
    color: '#8a8d96',
    fontSize: 11.5 * scale,
    lineHeight: 17 * scale,
    marginTop: 5 * scaleY,
  },
  inviteButton: {
    alignItems: 'center',
    borderColor: brandPink,
    borderRadius: 8 * scale,
    borderWidth: 1,
    height: 35 * scaleY,
    justifyContent: 'center',
    paddingHorizontal: 14 * scale,
  },
  inviteButtonText: {
    color: brandPink,
    fontSize: 12.5 * scale,
    fontWeight: '800',
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#ffd6e5',
    borderRadius: 14 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10 * scale,
    height: 52 * scaleY,
    justifyContent: 'center',
    marginTop: 14 * scaleY,
  },
  logoutButtonText: {
    color: brandPink,
    fontSize: 15 * scale,
    fontWeight: '800',
  },
  settingsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14 * scale,
    paddingHorizontal: 18 * scale,
    paddingTop: 6 * scaleY,
  },
  settingsHeaderText: {
    flex: 1,
  },
  settingsBreadcrumb: {
    color: mutedText,
    fontSize: 12.5 * scale,
    fontWeight: '700',
  },
  settingsTitle: {
    color: darkText,
    fontSize: 25 * scale,
    fontWeight: '900',
    marginTop: 3 * scaleY,
  },
  settingsContent: {
    paddingBottom: 34 * scaleY,
    paddingHorizontal: 18 * scale,
    paddingTop: 18 * scaleY,
  },
  settingsPanel: {
    backgroundColor: '#fff',
    borderColor: '#eeeef2',
    borderRadius: 15 * scale,
    borderWidth: 1,
    paddingHorizontal: 14 * scale,
  },
  settingsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12 * scale,
    minHeight: 62 * scaleY,
  },
  settingsIconCircle: {
    alignItems: 'center',
    backgroundColor: '#fff0f5',
    borderRadius: 18 * scale,
    height: 36 * scale,
    justifyContent: 'center',
    width: 36 * scale,
  },
  settingsRowText: {
    color: darkText,
    flex: 1,
    fontSize: 14.5 * scale,
    fontWeight: '700',
    lineHeight: 19 * scale,
  },
  settingsDivider: {
    backgroundColor: '#eeeef2',
    height: 1,
    marginLeft: 48 * scale,
  },
  dangerPanel: {
    backgroundColor: '#fff8fb',
    borderColor: '#ffd7e5',
    borderRadius: 15 * scale,
    borderWidth: 1,
    marginTop: 18 * scaleY,
    padding: 16 * scale,
  },
  dangerTitle: {
    color: darkText,
    fontSize: 17 * scale,
    fontWeight: '900',
  },
  dangerText: {
    color: '#737681',
    fontSize: 12.8 * scale,
    lineHeight: 19 * scale,
    marginTop: 8 * scaleY,
  },
  deleteAccountButton: {
    alignItems: 'center',
    backgroundColor: brandPink,
    borderRadius: 12 * scale,
    flexDirection: 'row',
    gap: 9 * scale,
    height: 48 * scaleY,
    justifyContent: 'center',
    marginTop: 15 * scaleY,
  },
  deleteAccountButtonDisabled: {
    opacity: 0.72,
  },
  deleteAccountButtonText: {
    color: '#fff',
    fontSize: 14.5 * scale,
    fontWeight: '900',
  },
  searchScreen: {
    backgroundColor: '#fff',
    flex: 1,
  },
  searchContent: {
    paddingBottom: 112 * scaleY,
    paddingHorizontal: 24 * scale,
    paddingTop: 14 * scaleY,
  },
  searchHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchTitle: {
    color: darkText,
    fontSize: 27 * scale,
    fontWeight: '700',
  },
  mapLink: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7 * scale,
  },
  mapLinkText: {
    color: brandPink,
    fontSize: 16 * scale,
    fontWeight: '600',
  },
  searchInputWide: {
    alignItems: 'center',
    borderColor,
    borderRadius: 20 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    height: 55 * scaleY,
    marginTop: 22 * scaleY,
    paddingHorizontal: 14 * scale,
  },
  searchPlaceholder: {
    color: '#8f8f95',
    flex: 1,
    fontSize: 15 * scale,
    marginLeft: 12 * scale,
  },
  searchTextInput: {
    color: darkText,
    flex: 1,
    fontSize: 15 * scale,
    marginLeft: 12 * scale,
    paddingVertical: 0,
  },
  searchDivider: {
    backgroundColor: '#ececf0',
    height: 28 * scaleY,
    marginRight: 14 * scale,
    width: 1,
  },
  filterRows: {
    gap: 8 * scaleY,
    marginTop: 14 * scaleY,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7 * scale,
  },
  filterChip: {
    alignItems: 'center',
    borderColor: '#eeeef2',
    borderRadius: 15 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6 * scale,
    minHeight: 34 * scaleY,
    maxWidth: 160 * scale,
    paddingHorizontal: 10 * scale,
  },
  filterChipActive: {
    backgroundColor: '#fff2f7',
    borderColor: '#ffd3e2',
  },
  availabilityChip: {
    alignItems: 'center',
    borderColor: '#eeeef2',
    borderRadius: 15 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7 * scale,
    minHeight: 34 * scaleY,
    paddingHorizontal: 10 * scale,
  },
  filterChipText: {
    color: darkText,
    fontSize: 12 * scale,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: brandPink,
    fontWeight: '700',
  },
  toggleFake: {
    alignItems: 'center',
    backgroundColor: '#ededf0',
    borderRadius: 9 * scale,
    flexDirection: 'row',
    height: 18 * scale,
    paddingHorizontal: 2 * scale,
    width: 31 * scale,
  },
  toggleFakeActive: {
    backgroundColor: brandPink,
    justifyContent: 'flex-end',
  },
  toggleKnob: {
    backgroundColor: '#fff',
    borderRadius: 7 * scale,
    height: 14 * scale,
    width: 14 * scale,
  },
  toggleKnobActive: {
    backgroundColor: '#fff',
  },
  segmented: {
    backgroundColor: '#fff2f6',
    borderColor: '#f2eef1',
    borderRadius: 9 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    height: 42 * scaleY,
    marginTop: 14 * scaleY,
    overflow: 'hidden',
  },
  segment: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: '#fff',
  },
  segmentText: {
    color: mutedText,
    fontSize: 14 * scale,
  },
  segmentTextActive: {
    color: brandPink,
    fontWeight: '600',
  },
  mapPreview: {
    backgroundColor: '#eef1ec',
    height: 360 * scaleY,
    marginHorizontal: -24 * scale,
    marginTop: 12 * scaleY,
    overflow: 'hidden',
  },
  googleMap: {
    height: '100%',
    width: '100%',
  },
  mapControls: {
    position: 'absolute',
    right: 17 * scale,
    top: 170 * scaleY,
  },
  mapControlButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#eeeef2',
    borderWidth: 1,
    height: 48 * scale,
    justifyContent: 'center',
    width: 48 * scale,
  },
  resultsSheet: {
    backgroundColor: 'transparent',
    gap: 12 * scaleY,
    marginTop: 12 * scaleY,
  },
  mapPointSheet: {
    backgroundColor: '#fff',
    borderColor: '#eeeef2',
    borderRadius: 15 * scale,
    borderWidth: 1,
    marginTop: 14 * scaleY,
    paddingHorizontal: 14 * scale,
  },
  mapPointCard: {
    alignItems: 'center',
    borderBottomColor: '#eeeef2',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 11 * scale,
    minHeight: 58 * scaleY,
  },
  mapPointText: {
    flex: 1,
  },
  mapPointTitle: {
    color: darkText,
    fontSize: 14 * scale,
    fontWeight: '800',
  },
  mapPointMeta: {
    color: '#777982',
    fontSize: 12 * scale,
    marginTop: 4 * scaleY,
  },
  emptySearchState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 118 * scaleY,
    paddingHorizontal: 20 * scale,
  },
  emptySearchTitle: {
    color: darkText,
    fontSize: 16 * scale,
    fontWeight: '800',
  },
  emptySearchText: {
    color: mutedText,
    fontSize: 13 * scale,
    lineHeight: 18 * scale,
    marginTop: 7 * scaleY,
    textAlign: 'center',
  },
  searchFilterSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22 * scale,
    borderTopRightRadius: 22 * scale,
    paddingBottom: 28 * scaleY,
    paddingHorizontal: 20 * scale,
    paddingTop: 18 * scaleY,
    width: '100%',
  },
  searchFilterHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8 * scaleY,
  },
  searchFilterReset: {
    color: brandPink,
    fontSize: 14 * scale,
    fontWeight: '700',
  },
  searchFilterOptionActive: {
    color: brandPink,
    fontWeight: '800',
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: '#dedee4',
    borderRadius: 3 * scale,
    height: 4 * scaleY,
    marginBottom: 10 * scaleY,
    width: 34 * scale,
  },
  searchResultCard: {
    backgroundColor: '#fff',
    borderColor: '#eeeef2',
    borderRadius: 14 * scale,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#17171d',
    shadowOffset: { width: 0, height: 5 * scaleY },
    shadowOpacity: 0.045,
    shadowRadius: 12 * scale,
  },
  searchPhotoSlider: {
    backgroundColor: '#f4f2f3',
    height: 118 * scaleY,
    overflow: 'hidden',
    position: 'relative',
  },
  searchPlaceImage: {
    height: 118 * scaleY,
    resizeMode: 'cover',
    width: 366 * scale,
  },
  searchBookmark: {
    position: 'absolute',
    right: 12 * scale,
    top: 10 * scaleY,
  },
  searchBookmarkPlus: {
    position: 'absolute',
    right: -3 * scale,
    top: 4 * scaleY,
  },
  searchPhotoDots: {
    alignItems: 'center',
    bottom: 8 * scaleY,
    flexDirection: 'row',
    gap: 5 * scale,
    left: 0,
    position: 'absolute',
    right: 0,
    justifyContent: 'center',
  },
  searchPhotoDot: {
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderRadius: 4 * scale,
    height: 7 * scale,
    width: 7 * scale,
  },
  searchPhotoDotActive: {
    backgroundColor: '#fff',
    width: 17 * scale,
  },
  searchPlaceInfo: {
    backgroundColor: '#fff',
    paddingHorizontal: 14 * scale,
    paddingTop: 12 * scaleY,
    paddingBottom: 11 * scaleY,
  },
  searchPlaceName: {
    color: darkText,
    fontSize: 17 * scale,
    fontWeight: '800',
    lineHeight: 22 * scale,
  },
  searchPlaceMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5 * scale,
    marginTop: 8 * scaleY,
  },
  searchPlaceRating: {
    color: darkText,
    fontSize: 15.5 * scale,
    fontWeight: '800',
  },
  searchPlaceAddress: {
    color: '#8a8b92',
    flex: 1,
    fontSize: 12.5 * scale,
  },
  searchPlaceDistance: {
    color: '#b0b0b7',
    fontSize: 12 * scale,
    marginLeft: 5 * scale,
  },
  scheduleBlock: {
    borderTopColor: '#f0f0f3',
    borderTopWidth: 1,
    paddingBottom: 12 * scaleY,
    paddingTop: 11 * scaleY,
  },
  scheduleTitle: {
    color: darkText,
    fontSize: 14.5 * scale,
    fontWeight: '800',
    lineHeight: 19 * scale,
    paddingHorizontal: 14 * scale,
  },
  scheduleSlots: {
    gap: 8 * scale,
    paddingHorizontal: 14 * scale,
    paddingTop: 10 * scaleY,
  },
  scheduleSlot: {
    alignItems: 'center',
    backgroundColor: '#fff2f7',
    borderColor: '#ffd1e1',
    borderRadius: 15 * scale,
    borderWidth: 1,
    height: 32 * scaleY,
    justifyContent: 'center',
    minWidth: 74 * scale,
    paddingHorizontal: 12 * scale,
  },
  scheduleSlotText: {
    color: brandPink,
    fontSize: 12.5 * scale,
    fontWeight: '800',
  },
  scheduleLink: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 4 * scale,
    marginTop: 12 * scaleY,
  },
  scheduleLinkText: {
    color: brandPink,
    fontSize: 14.5 * scale,
    fontWeight: '800',
  },
  detailShell: {
    backgroundColor: '#fff',
    flex: 1,
  },
  detailScrollContent: {
    paddingBottom: 245 * scaleY,
  },
  salonDetailScrollContent: {
    paddingBottom: 132 * scaleY,
  },
  masterHero: {
    height: 342 * scaleY,
    marginBottom: 14 * scaleY,
  },
  masterHeroImage: {
    height: '100%',
    width: '100%',
  },
  detailHeroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  detailActionsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 18 * scale,
    position: 'absolute',
    right: 18 * scale,
    top: 14 * scaleY,
    zIndex: 4,
  },
  detailActionsRight: {
    flexDirection: 'row',
    gap: 12 * scale,
  },
  roundAction: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderColor: 'rgba(20,20,24,0.08)',
    borderWidth: 1,
    borderRadius: 22 * scale,
    height: 44 * scale,
    justifyContent: 'center',
    shadowColor: '#13131a',
    shadowOffset: { width: 0, height: 4 * scaleY },
    shadowOpacity: 0.12,
    shadowRadius: 8 * scale,
    width: 44 * scale,
  },
  masterHeroInfo: {
    backgroundColor: '#fff',
    borderRadius: 18 * scale,
    bottom: -12 * scaleY,
    left: 18 * scale,
    padding: 16 * scale,
    position: 'absolute',
    right: 18 * scale,
    shadowColor: '#15151c',
    shadowOffset: { width: 0, height: 8 * scaleY },
    shadowOpacity: 0.08,
    shadowRadius: 18 * scale,
  },
  verifiedBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff6f9',
    borderRadius: 11 * scale,
    flexDirection: 'row',
    gap: 5 * scale,
    paddingHorizontal: 10 * scale,
    paddingVertical: 5 * scaleY,
  },
  verifiedText: {
    color: darkText,
    fontSize: 10.5 * scale,
    fontWeight: '600',
  },
  detailName: {
    color: '#111114',
    fontSize: 23 * scale,
    fontWeight: '700',
    lineHeight: 29 * scale,
    marginTop: 10 * scaleY,
  },
  detailSub: {
    color: '#77777d',
    fontSize: 14 * scale,
    lineHeight: 21 * scale,
    marginTop: 7 * scaleY,
  },
  inlineRating: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5 * scale,
    marginTop: 7 * scaleY,
  },
  inlineRatingText: {
    color: '#555861',
    fontSize: 13 * scale,
    fontWeight: '600',
  },
  experienceText: {
    color: '#66666c',
    fontSize: 14 * scale,
    marginTop: 10 * scaleY,
  },
  statsRow: {
    backgroundColor: '#fff',
    borderColor: '#eeeef2',
    borderRadius: 15 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    marginHorizontal: 18 * scale,
    marginTop: 12 * scaleY,
    overflow: 'hidden',
    paddingVertical: 12 * scaleY,
  },
  statItem: {
    alignItems: 'center',
    borderRightColor: '#eeeef2',
    borderRightWidth: 1,
    flex: 1,
    paddingHorizontal: 6 * scale,
  },
  statIcon: {
    alignItems: 'center',
    backgroundColor: '#fff6f9',
    borderRadius: 19 * scale,
    height: 38 * scale,
    justifyContent: 'center',
    marginBottom: 5 * scaleY,
    width: 38 * scale,
  },
  statValue: {
    color: darkText,
    fontSize: 12.5 * scale,
    fontWeight: '700',
  },
  statLabel: {
    color: '#77777d',
    fontSize: 10.8 * scale,
    marginTop: 3 * scaleY,
  },
  mediaStrip: {
    gap: 9 * scale,
    paddingHorizontal: 18 * scale,
    paddingTop: 16 * scaleY,
  },
  mediaTile: {
    borderRadius: 8 * scale,
    height: 75 * scaleY,
    overflow: 'hidden',
    width: 74 * scale,
  },
  videoTile: {
    alignItems: 'center',
    borderRadius: 8 * scale,
    height: 75 * scaleY,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 142 * scale,
  },
  mediaImage: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  videoText: {
    color: '#fff',
    fontSize: 12.5 * scale,
    marginTop: 4 * scaleY,
  },
  moreMediaTile: {
    alignItems: 'center',
    borderRadius: 8 * scale,
    height: 75 * scaleY,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 72 * scale,
  },
  moreMediaText: {
    color: '#fff',
    fontSize: 20 * scale,
    fontWeight: '700',
  },
  detailSection: {
    marginTop: 18 * scaleY,
    paddingHorizontal: 18 * scale,
  },
  detailSectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10 * scaleY,
  },
  detailSectionTitle: {
    color: darkText,
    fontSize: 18 * scale,
    fontWeight: '700',
  },
  detailSectionLink: {
    color: brandPink,
    fontSize: 14 * scale,
    fontWeight: '500',
  },
  detailParagraph: {
    color: '#333338',
    backgroundColor: '#fff',
    borderColor: '#eeeef2',
    borderRadius: 14 * scale,
    borderWidth: 1,
    fontSize: 13.5 * scale,
    lineHeight: 20 * scale,
    padding: 14 * scale,
  },
  certificatesRow: {
    flexDirection: 'row',
    gap: 12 * scale,
    paddingRight: 20 * scale,
  },
  certificateCard: {
    alignItems: 'center',
    borderColor: '#eeeef2',
    borderRadius: 7 * scale,
    borderWidth: 1,
    height: 72 * scaleY,
    justifyContent: 'center',
    width: 118 * scale,
  },
  certificateText: {
    color: '#8b7563',
    fontSize: 11 * scale,
    fontWeight: '700',
  },
  certificateName: {
    color: '#8b7563',
    fontSize: 9 * scale,
    marginTop: 6 * scaleY,
  },
  reviewCard: {
    borderColor: '#eeeef2',
    borderRadius: 10 * scale,
    borderWidth: 1,
    minHeight: 112 * scaleY,
    padding: 12 * scale,
  },
  reviewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  reviewAvatar: {
    borderRadius: 20 * scale,
    height: 40 * scale,
    width: 40 * scale,
  },
  reviewNameBlock: {
    flex: 1,
    marginLeft: 10 * scale,
  },
  reviewName: {
    color: darkText,
    fontSize: 13 * scale,
    fontWeight: '700',
  },
  reviewStars: {
    color: brandPink,
    fontSize: 12 * scale,
    marginTop: 3 * scaleY,
  },
  reviewDate: {
    color: mutedText,
    fontSize: 11 * scale,
  },
  reviewText: {
    color: '#333338',
    fontSize: 12.5 * scale,
    lineHeight: 18 * scale,
    marginTop: 9 * scaleY,
    paddingRight: 100 * scale,
  },
  reviewImage: {
    borderRadius: 7 * scale,
    bottom: 12 * scaleY,
    height: 58 * scaleY,
    position: 'absolute',
    right: 12 * scale,
    width: 82 * scale,
  },
  serviceRow: {
    alignItems: 'center',
    borderColor: '#eeeef2',
    borderRadius: 9 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10 * scaleY,
    minHeight: 62 * scaleY,
    padding: 8 * scale,
  },
  serviceRowSelected: {
    backgroundColor: '#fff7fa',
    borderColor: brandPink,
  },
  serviceThumb: {
    borderRadius: 7 * scale,
    height: 45 * scaleY,
    width: 68 * scale,
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 12 * scale,
  },
  serviceName: {
    color: darkText,
    fontSize: 13.5 * scale,
    fontWeight: '700',
  },
  serviceDuration: {
    color: '#8f8f95',
    fontSize: 11.5 * scale,
    marginTop: 5 * scaleY,
  },
  servicePrice: {
    color: brandPink,
    fontSize: 15 * scale,
    fontWeight: '800',
  },
  servicePlus: {
    alignItems: 'center',
    backgroundColor: brandPink,
    borderRadius: 16 * scale,
    height: 32 * scale,
    justifyContent: 'center',
    marginLeft: 12 * scale,
    width: 32 * scale,
  },
  servicePlusSelected: {
    backgroundColor: '#c51f5d',
  },
  bookingBar: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18 * scale,
    borderTopRightRadius: 18 * scale,
    bottom: 0,
    left: 0,
    paddingBottom: 9 * scaleY,
    paddingHorizontal: 24 * scale,
    paddingTop: 14 * scaleY,
    position: 'absolute',
    right: 0,
    shadowColor: '#13131a',
    shadowOffset: { width: 0, height: -5 * scaleY },
    shadowOpacity: 0.08,
    shadowRadius: 14 * scale,
  },
  bookingTitle: {
    color: darkText,
    fontSize: 14 * scale,
    fontWeight: '700',
    marginBottom: 10 * scaleY,
    textAlign: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 11 * scale,
  },
  dateChip: {
    alignItems: 'center',
    borderColor: '#eeeef2',
    borderRadius: 8 * scale,
    borderWidth: 1,
    height: 52 * scaleY,
    justifyContent: 'center',
    width: 50 * scale,
  },
  dateChipActive: {
    borderColor: brandPink,
  },
  dateChipText: {
    color: darkText,
    fontSize: 11.5 * scale,
    lineHeight: 15 * scale,
    textAlign: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 10 * scale,
    marginTop: 10 * scaleY,
  },
  timeChip: {
    alignItems: 'center',
    borderColor: '#eeeef2',
    borderRadius: 8 * scale,
    borderWidth: 1,
    height: 38 * scaleY,
    justifyContent: 'center',
    width: 72 * scale,
  },
  timeChipActive: {
    backgroundColor: '#fff5f9',
    borderColor: brandPink,
  },
  timeChipDisabled: {
    backgroundColor: '#f3f3f5',
    borderColor: '#e3e3e7',
  },
  timeChipText: {
    color: darkText,
    fontSize: 13 * scale,
  },
  timeChipTextActive: {
    color: brandPink,
    fontWeight: '700',
  },
  timeChipTextDisabled: {
    color: '#b8b8bd',
    textDecorationLine: 'line-through',
  },
  bookingBottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12 * scaleY,
  },
  bookingTotal: {
    color: darkText,
    fontSize: 16 * scale,
    fontWeight: '800',
  },
  bookingSub: {
    color: mutedText,
    fontSize: 11.5 * scale,
    marginTop: 3 * scaleY,
  },
  bookingButton: {
    alignItems: 'center',
    backgroundColor: brandPink,
    borderRadius: 9 * scale,
    height: 50 * scaleY,
    justifyContent: 'center',
    width: 178 * scale,
  },
  bookingButtonText: {
    color: '#fff',
    fontSize: 16 * scale,
    fontWeight: '600',
  },
  salonHero: {
    height: 220 * scaleY,
  },
  salonHeroImage: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  salonInfoCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18 * scale,
    borderColor: '#eeeef2',
    borderWidth: 1,
    flexDirection: 'row',
    marginHorizontal: 18 * scale,
    marginTop: -34 * scaleY,
    padding: 15 * scale,
    shadowColor: '#15151c',
    shadowOffset: { width: 0, height: 8 * scaleY },
    shadowOpacity: 0.08,
    shadowRadius: 18 * scale,
  },
  salonLogoCircle: {
    alignItems: 'center',
    backgroundColor: '#fff8f9',
    borderColor: '#f5dfdf',
    borderRadius: 49 * scale,
    borderWidth: 1,
    height: 76 * scale,
    justifyContent: 'center',
    marginRight: 17 * scale,
    width: 76 * scale,
  },
  salonLogoText: {
    color: '#c38b78',
    fontFamily: 'Bodoni 72',
    fontSize: 20 * scale,
  },
  salonLogoMini: {
    color: '#c38b78',
    fontSize: 6.5 * scale,
    letterSpacing: 1.8 * scale,
  },
  salonInfoCopy: {
    flex: 1,
  },
  nameWithBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8 * scale,
  },
  salonWorkingHoursCard: {
    alignItems: 'center',
    backgroundColor: '#fff7fa',
    borderColor: '#ffdce8',
    borderRadius: 14 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 14 * scale,
  },
  salonWorkingHoursIcon: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 22 * scale,
    height: 44 * scale,
    justifyContent: 'center',
    width: 44 * scale,
  },
  salonWorkingHoursCopy: {
    flex: 1,
    marginLeft: 12 * scale,
  },
  salonWorkingHoursTitle: {
    color: darkText,
    fontSize: 14 * scale,
    fontWeight: '800',
  },
  salonWorkingHoursHint: {
    color: mutedText,
    fontSize: 12 * scale,
    lineHeight: 17 * scale,
    marginTop: 4 * scaleY,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10 * scale,
  },
  salonServiceCard: {
    borderColor: '#eeeef2',
    borderRadius: 8 * scale,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: 10 * scaleY,
    width: '48%',
  },
  salonServiceImage: {
    height: 78 * scaleY,
    width: '100%',
  },
  salonMasterInstruction: {
    color: mutedText,
    fontSize: 13 * scale,
    marginBottom: 12 * scaleY,
  },
  salonSelectedMaster: {
    alignItems: 'center',
    backgroundColor: '#eefaf2',
    borderRadius: 11 * scale,
    flexDirection: 'row',
    marginTop: 12 * scaleY,
    paddingHorizontal: 12 * scale,
    paddingVertical: 10 * scaleY,
  },
  salonSelectedMasterText: {
    color: '#187d43',
    fontSize: 13.5 * scale,
    fontWeight: '700',
    marginLeft: 8 * scale,
  },
  salonNoMastersCard: {
    alignItems: 'center',
    backgroundColor: '#f8f8fa',
    borderRadius: 13 * scale,
    gap: 8 * scaleY,
    padding: 18 * scale,
  },
  salonNoMastersText: {
    color: mutedText,
    fontSize: 13.5 * scale,
    textAlign: 'center',
  },
  salonBottomBar: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopColor: '#eeeef2',
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingBottom: 28 * scaleY,
    paddingHorizontal: 24 * scale,
    paddingTop: 14 * scaleY,
    position: 'absolute',
    right: 0,
    shadowColor: '#13131a',
    shadowOffset: { width: 0, height: -7 * scaleY },
    shadowOpacity: 0.08,
    shadowRadius: 16 * scale,
  },
  salonBookButton: {
    borderRadius: 18 * scale,
    height: 58 * scaleY,
    overflow: 'hidden',
    width: '100%',
  },
  salonBookButtonDisabled: {
    opacity: 0.45,
  },
  salonBookGradient: {
    alignItems: 'center',
    borderRadius: 18 * scale,
    flex: 1,
    justifyContent: 'center',
  },
  salonBookButtonText: {
    color: '#fff',
    fontSize: 19 * scale,
    fontWeight: '800',
  },
  registrationScreen: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 22 * scale,
  },
  backIcon: {
    left: 16 * scale,
    position: 'absolute',
    top: 62 * scaleY,
    zIndex: 2,
  },
  progressHeader: {
    alignItems: 'center',
    marginTop: 70 * scaleY,
  },
  progressBars: {
    flexDirection: 'row',
    gap: 6 * scale,
    marginBottom: 18 * scaleY,
  },
  progressBar: {
    backgroundColor: '#d9d9dc',
    borderRadius: 3 * scale,
    height: 3 * scaleY,
    width: 22 * scale,
  },
  salonProgressBar: {
    width: 29 * scale,
  },
  progressBarActive: {
    backgroundColor: brandPink,
  },
  stepText: {
    color: '#77777d',
    fontSize: 15 * scale,
    letterSpacing: 0,
    lineHeight: 20 * scale,
  },
  stepContent: {
    marginTop: 46 * scaleY,
  },
  stepTitle: {
    color: darkText,
    fontSize: 27 * scale,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 36 * scale,
    textAlign: 'center',
  },
  stepSubtitle: {
    color: mutedText,
    fontSize: 16 * scale,
    letterSpacing: 0,
    lineHeight: 25 * scale,
    marginTop: 13 * scaleY,
    textAlign: 'center',
  },
  textInput: {
    borderColor,
    borderRadius: 10 * scale,
    borderWidth: 1,
    color: darkText,
    fontSize: 17 * scale,
    height: 65 * scaleY,
    marginTop: 40 * scaleY,
    paddingHorizontal: 18 * scale,
  },
  selectInput: {
    alignItems: 'center',
    borderColor,
    borderRadius: 10 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    height: 65 * scaleY,
    justifyContent: 'space-between',
    marginTop: 40 * scaleY,
    paddingHorizontal: 18 * scale,
  },
  selectText: {
    color: '#adadb2',
    fontSize: 17 * scale,
  },
  selectTextActive: {
    color: darkText,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.24)',
    flex: 1,
    justifyContent: 'center',
    padding: 24 * scale,
  },
  citySheet: {
    backgroundColor: '#fff',
    borderRadius: 10 * scale,
    maxHeight: 560 * scaleY,
    overflow: 'hidden',
    width: '100%',
  },
  cityOption: {
    borderBottomColor: '#eeeef2',
    borderBottomWidth: 1,
    paddingHorizontal: 20 * scale,
    paddingVertical: 17 * scaleY,
  },
  cityOptionText: {
    color: darkText,
    fontSize: 18 * scale,
  },
  fieldLabel: {
    color: '#4b4b50',
    fontSize: 15 * scale,
    letterSpacing: 0,
    lineHeight: 20 * scale,
    marginTop: 49 * scaleY,
  },
  iconInput: {
    alignItems: 'center',
    borderColor,
    borderRadius: 10 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    height: 57 * scaleY,
    marginTop: 12 * scaleY,
    paddingHorizontal: 18 * scale,
  },
  iconTextInput: {
    color: darkText,
    flex: 1,
    fontSize: 17 * scale,
    marginLeft: 14 * scale,
  },
  datePickerText: {
    color: '#adadb2',
    flex: 1,
    fontSize: 17 * scale,
    marginLeft: 14 * scale,
  },
  datePickerTextActive: {
    color: darkText,
  },
  datePickerOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.24)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  datePickerSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18 * scale,
    borderTopRightRadius: 18 * scale,
    paddingBottom: 28 * scaleY,
    paddingHorizontal: 18 * scale,
    paddingTop: 14 * scaleY,
    width: '100%',
  },
  datePickerDone: {
    alignItems: 'center',
    backgroundColor: brandPink,
    borderRadius: 10 * scale,
    height: 50 * scaleY,
    justifyContent: 'center',
    marginTop: 10 * scaleY,
  },
  datePickerDoneText: {
    color: '#fff',
    fontSize: 17 * scale,
    fontWeight: '600',
  },
  genderLabel: {
    marginTop: 36 * scaleY,
  },
  genderRow: {
    alignItems: 'center',
    borderColor,
    borderRadius: 10 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    height: 64 * scaleY,
    marginTop: 13 * scaleY,
    paddingHorizontal: 19 * scale,
  },
  genderText: {
    color: darkText,
    flex: 1,
    fontSize: 17 * scale,
    marginLeft: 20 * scale,
  },
  radio: {
    alignItems: 'center',
    borderColor: '#cfd0d4',
    borderRadius: 10 * scale,
    borderWidth: 1.5,
    height: 20 * scale,
    justifyContent: 'center',
    width: 20 * scale,
  },
  radioDot: {
    borderRadius: 5 * scale,
    height: 10 * scale,
    width: 10 * scale,
  },
  phoneInput: {
    alignItems: 'center',
    borderColor,
    borderRadius: 10 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    height: 58 * scaleY,
    marginTop: 13 * scaleY,
    paddingHorizontal: 20 * scale,
  },
  flagBox: {
    alignItems: 'center',
    borderRadius: 4 * scale,
    height: 28 * scale,
    justifyContent: 'center',
    marginRight: 16 * scale,
    overflow: 'hidden',
    width: 28 * scale,
  },
  flagText: {
    fontSize: 24 * scale,
  },
  phonePrefix: {
    color: darkText,
    fontSize: 17 * scale,
    marginLeft: 22 * scale,
    marginRight: 18 * scale,
  },
  phoneTextInput: {
    color: darkText,
    flex: 1,
    fontSize: 18 * scale,
    letterSpacing: 1.2 * scale,
  },
  securityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10 * scale,
    marginLeft: 4 * scale,
    marginTop: 16 * scaleY,
  },
  securityText: {
    color: mutedText,
    fontSize: 14 * scale,
  },
  legalConsentBlock: {
    backgroundColor: '#fff8fb',
    borderColor: '#ffe0ea',
    borderRadius: 12 * scale,
    borderWidth: 1,
    gap: 9 * scaleY,
    marginTop: 18 * scaleY,
    paddingHorizontal: 14 * scale,
    paddingVertical: 13 * scaleY,
  },
  legalConsentIntro: {
    color: '#6f727c',
    fontSize: 12.2 * scale,
    fontWeight: '700',
  },
  legalConsentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9 * scale,
    minHeight: 22 * scaleY,
  },
  legalConsentCheck: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: brandPink,
    borderWidth: 1.4,
    borderRadius: 5 * scale,
    height: 18 * scale,
    justifyContent: 'center',
    width: 18 * scale,
  },
  legalConsentCheckActive: {
    backgroundColor: brandPink,
  },
  legalConsentText: {
    color: '#676a74',
    flex: 1,
    fontSize: 12.3 * scale,
    lineHeight: 17 * scale,
  },
  legalConsentLink: {
    color: brandPink,
    fontWeight: '800',
  },
  codeRow: {
    flexDirection: 'row',
    gap: 22 * scale,
    justifyContent: 'center',
    marginTop: 75 * scaleY,
  },
  codeBox: {
    alignItems: 'center',
    borderColor: '#d6d6dc',
    borderRadius: 13 * scale,
    borderWidth: 1,
    height: 76 * scaleY,
    justifyContent: 'center',
    width: 66 * scale,
  },
  codeDigit: {
    color: 'transparent',
    fontSize: 32 * scale,
    fontWeight: '500',
  },
  codeDigitFilled: {
    color: darkText,
  },
  hiddenCodeInput: {
    height: 1,
    opacity: 0,
    position: 'absolute',
    width: 1,
  },
  codeHint: {
    color: '#77777d',
    fontSize: 15 * scale,
    lineHeight: 22 * scale,
    marginTop: 31 * scaleY,
    textAlign: 'center',
  },
  retryMuted: {
    color: '#77777d',
    fontSize: 15 * scale,
    lineHeight: 22 * scale,
    marginTop: 42 * scaleY,
    textAlign: 'center',
  },
  retryPink: {
    color: brandPink,
    fontSize: 15 * scale,
    lineHeight: 22 * scale,
    marginTop: 3 * scaleY,
    textAlign: 'center',
  },
  photosContent: {
    alignItems: 'center',
    marginTop: 43 * scaleY,
  },
  clientPhotoScrollContent: {
    paddingBottom: 34 * scaleY,
  },
  mainPhotoWrap: {
    alignItems: 'center',
    backgroundColor: '#f5f5f6',
    borderRadius: 64 * scale,
    height: 128 * scale,
    justifyContent: 'center',
    marginTop: 47 * scaleY,
    width: 128 * scale,
  },
  mainPhoto: {
    borderRadius: 64 * scale,
    height: 128 * scale,
    width: 128 * scale,
  },
  photoPlus: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 22 * scale,
    bottom: 0,
    height: 44 * scale,
    justifyContent: 'center',
    position: 'absolute',
    right: -5 * scale,
    shadowColor: '#13131a',
    shadowOffset: { width: 0, height: 5 * scaleY },
    shadowOpacity: 0.12,
    shadowRadius: 12 * scale,
    width: 44 * scale,
  },
  mainPhotoTitle: {
    color: darkText,
    fontSize: 15 * scale,
    fontWeight: '600',
    lineHeight: 22 * scale,
    marginTop: 20 * scaleY,
  },
  mainPhotoSubtitle: {
    color: mutedText,
    fontSize: 13 * scale,
    lineHeight: 20 * scale,
    marginTop: 5 * scaleY,
  },
  photoDivider: {
    backgroundColor: '#e9e9ed',
    height: 1,
    marginTop: 28 * scaleY,
    width: '100%',
  },
  extraTitle: {
    alignSelf: 'flex-start',
    color: darkText,
    fontSize: 15 * scale,
    fontWeight: '600',
    lineHeight: 21 * scale,
    marginTop: 25 * scaleY,
  },
  extraOptional: {
    color: '#55555a',
    fontWeight: '400',
  },
  extraPhotosRow: {
    flexDirection: 'row',
    gap: 18 * scale,
    marginTop: 17 * scaleY,
  },
  extraPhotoSlot: {
    alignItems: 'center',
    borderColor: '#d8d8dc',
    borderRadius: 9 * scale,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 105 * scaleY,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 75 * scale,
  },
  extraPhotoImage: {
    height: '100%',
    width: '100%',
  },
  photoLimit: {
    alignSelf: 'flex-start',
    color: mutedText,
    fontSize: 14 * scale,
    lineHeight: 20 * scale,
    marginTop: 16 * scaleY,
  },
  registrationActions: {
    bottom: 44 * scaleY,
    left: 22 * scale,
    position: 'absolute',
    right: 22 * scale,
  },
  registrationActionsInline: {
    marginTop: 32 * scaleY,
  },
  backButton: {
    alignItems: 'center',
    borderColor: '#e4e4e8',
    borderRadius: 10 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    height: 61 * scaleY,
    justifyContent: 'center',
    marginTop: 22 * scaleY,
  },
  backButtonText: {
    color: darkText,
    fontSize: 18 * scale,
    marginLeft: 28 * scale,
  },
  registerPartnerCard: {
    alignItems: 'center',
    borderColor: '#e4e4e8',
    borderRadius: 10 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    height: 68 * scaleY,
    justifyContent: 'center',
    marginTop: 22 * scaleY,
    paddingHorizontal: 24 * scale,
  },
  registerPartnerText: {
    color: darkText,
    flex: 1,
    fontSize: 17 * scale,
    fontWeight: '600',
    marginLeft: 28 * scale,
    textAlign: 'center',
  },
  masterScrollContent: {
    paddingBottom: 34 * scaleY,
  },
  salonRegistrationScrollContent: {
    paddingBottom: 30 * scaleY,
  },
  salonStepContent: {
    marginTop: 18 * scaleY,
  },
  salonStepTitle: {
    fontSize: 22 * scale,
    lineHeight: 29 * scale,
  },
  salonStepSubtitle: {
    fontSize: 14.5 * scale,
    lineHeight: 22 * scale,
    marginTop: 10 * scaleY,
  },
  salonFieldLabel: {
    fontSize: 14 * scale,
    lineHeight: 19 * scale,
    marginTop: 14 * scaleY,
  },
  salonIconInput: {
    height: 46 * scaleY,
    marginTop: 7 * scaleY,
  },
  salonSelectInput: {
    height: 46 * scaleY,
    marginTop: 7 * scaleY,
  },
  salonInputText: {
    fontSize: 15 * scale,
  },
  salonSelectText: {
    fontSize: 15 * scale,
  },
  salonHelperText: {
    fontSize: 12.5 * scale,
    lineHeight: 17 * scale,
    marginTop: 5 * scaleY,
  },
  salonActionsInline: {
    marginTop: 14 * scaleY,
  },
  salonPrimaryButton: {
    height: 54 * scaleY,
  },
  salonPrimaryButtonText: {
    fontSize: 17 * scale,
  },
  salonBackButton: {
    height: 54 * scaleY,
    marginTop: 17 * scaleY,
  },
  salonBackButtonText: {
    fontSize: 16 * scale,
    marginLeft: 22 * scale,
  },
  salonUploadCard: {
    minHeight: 70 * scaleY,
    marginTop: 9 * scaleY,
    paddingVertical: 9 * scaleY,
  },
  salonUploadIconCircle: {
    borderRadius: 25 * scale,
    height: 50 * scale,
    marginRight: 16 * scale,
    width: 50 * scale,
  },
  salonUploadTitle: {
    fontSize: 14.5 * scale,
    lineHeight: 20 * scale,
  },
  salonUploadSubtitle: {
    fontSize: 12.5 * scale,
    lineHeight: 18 * scale,
    marginTop: 3 * scaleY,
  },
  salonUploadCaption: {
    fontSize: 12 * scale,
    lineHeight: 17 * scale,
    marginTop: 7 * scaleY,
  },
  masterContent: {
    marginTop: 44 * scaleY,
  },
  masterContentCompact: {
    marginTop: 33 * scaleY,
  },
  masterFieldLabel: {
    color: darkText,
    fontSize: 15 * scale,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 21 * scale,
    marginTop: 31 * scaleY,
  },
  requiredStar: {
    color: brandPink,
  },
  masterTextInput: {
    borderColor,
    borderRadius: 10 * scale,
    borderWidth: 1,
    color: darkText,
    fontSize: 16 * scale,
    height: 58 * scaleY,
    marginTop: 12 * scaleY,
    paddingHorizontal: 16 * scale,
  },
  masterSelectInput: {
    alignItems: 'center',
    borderColor,
    borderRadius: 10 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    height: 58 * scaleY,
    justifyContent: 'space-between',
    marginTop: 12 * scaleY,
    paddingHorizontal: 16 * scale,
  },
  masterSelectText: {
    color: '#adadb2',
    flex: 1,
    fontSize: 17 * scale,
  },
  masterSelectTextWithIcon: {
    marginLeft: 14 * scale,
  },
  masterIconInput: {
    alignItems: 'center',
    borderColor,
    borderRadius: 10 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    height: 58 * scaleY,
    marginTop: 12 * scaleY,
    paddingHorizontal: 17 * scale,
  },
  masterGenderGrid: {
    flexDirection: 'row',
    gap: 14 * scale,
    marginTop: 14 * scaleY,
  },
  masterGenderPill: {
    alignItems: 'center',
    borderColor,
    borderRadius: 10 * scale,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    height: 52 * scaleY,
    paddingHorizontal: 20 * scale,
  },
  masterGenderText: {
    color: darkText,
    fontSize: 16 * scale,
    marginLeft: 17 * scale,
  },
  radioGroupBox: {
    borderColor,
    borderRadius: 10 * scale,
    borderWidth: 1,
    marginTop: 12 * scaleY,
    paddingHorizontal: 17 * scale,
    paddingVertical: 11 * scaleY,
  },
  radioGroupBoxSmall: {
    borderColor,
    borderRadius: 10 * scale,
    borderWidth: 1,
    marginTop: 12 * scaleY,
    paddingHorizontal: 17 * scale,
    paddingVertical: 10 * scaleY,
  },
  simpleRadioRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 34 * scaleY,
  },
  simpleRadio: {
    alignItems: 'center',
    borderColor: '#9b9ca1',
    borderRadius: 7 * scale,
    borderWidth: 1.3,
    height: 14 * scale,
    justifyContent: 'center',
    width: 14 * scale,
  },
  simpleRadioDot: {
    backgroundColor: brandPink,
    borderRadius: 4 * scale,
    height: 8 * scale,
    width: 8 * scale,
  },
  simpleRadioText: {
    color: darkText,
    fontSize: 15.5 * scale,
    marginLeft: 15 * scale,
  },
  textAreaWrap: {
    borderColor,
    borderRadius: 10 * scale,
    borderWidth: 1,
    height: 123 * scaleY,
    marginTop: 12 * scaleY,
    paddingHorizontal: 12 * scale,
    paddingTop: 11 * scaleY,
  },
  textArea: {
    color: darkText,
    flex: 1,
    fontSize: 14.5 * scale,
    lineHeight: 21 * scale,
  },
  counterText: {
    alignSelf: 'flex-end',
    color: '#77777d',
    fontSize: 13.5 * scale,
    marginBottom: 10 * scaleY,
  },
  helperText: {
    color: mutedText,
    fontSize: 13.5 * scale,
    lineHeight: 20 * scale,
    marginTop: 10 * scaleY,
  },
  uploadSection: {
    marginTop: 0,
  },
  uploadCard: {
    alignItems: 'center',
    borderColor,
    borderRadius: 10 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 77 * scaleY,
    marginTop: 12 * scaleY,
    paddingHorizontal: 13 * scale,
    paddingVertical: 12 * scaleY,
  },
  uploadIconCircle: {
    alignItems: 'center',
    backgroundColor: '#fde8f1',
    borderRadius: 28 * scale,
    height: 56 * scale,
    justifyContent: 'center',
    marginRight: 20 * scale,
    width: 56 * scale,
  },
  uploadText: {
    flex: 1,
  },
  uploadTitle: {
    color: darkText,
    fontSize: 15.5 * scale,
    fontWeight: '500',
    lineHeight: 22 * scale,
  },
  uploadSubtitle: {
    color: mutedText,
    fontSize: 13.5 * scale,
    lineHeight: 20 * scale,
    marginTop: 4 * scaleY,
  },
  uploadCaption: {
    color: mutedText,
    fontSize: 12.5 * scale,
    lineHeight: 18 * scale,
    marginTop: 8 * scaleY,
  },
  workingHoursBox: {
    borderColor,
    borderRadius: 10 * scale,
    borderWidth: 1,
    marginTop: 12 * scaleY,
    paddingHorizontal: 12 * scale,
  },
  workingHourRow: {
    alignItems: 'center',
    borderBottomColor: '#eeeef2',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 45 * scaleY,
  },
  workingHourRowLast: {
    borderBottomWidth: 0,
  },
  workingHourIcon: {
    alignItems: 'center',
    backgroundColor: '#fde8f1',
    borderRadius: 16 * scale,
    height: 32 * scale,
    justifyContent: 'center',
    marginRight: 13 * scale,
    width: 32 * scale,
  },
  workingHourLabel: {
    color: darkText,
    flex: 1,
    fontSize: 14 * scale,
    fontWeight: '500',
  },
  workingHourValue: {
    color: mutedText,
    fontSize: 13.5 * scale,
    marginRight: 7 * scale,
  },
  workingHourValueBox: {
    alignItems: 'center',
    borderColor: '#e4e4e8',
    borderRadius: 8 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 32 * scaleY,
    paddingHorizontal: 9 * scale,
  },
  workingHourValuePlain: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  salonPhotoDescription: {
    color: '#66666c',
    fontSize: 13.5 * scale,
    lineHeight: 20 * scale,
    marginTop: 8 * scaleY,
  },
  salonDropZone: {
    alignItems: 'center',
    borderColor: '#d8d8dc',
    borderRadius: 10 * scale,
    borderStyle: 'dashed',
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 19 * scaleY,
    minHeight: 136 * scaleY,
  },
  salonCenteredIcon: {
    marginRight: 0,
  },
  salonDropTitle: {
    color: darkText,
    fontSize: 16 * scale,
    fontWeight: '600',
    marginTop: 13 * scaleY,
  },
  salonDropSubtitle: {
    color: mutedText,
    fontSize: 13 * scale,
    marginTop: 8 * scaleY,
  },
  salonPhotosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10 * scale,
    marginTop: 17 * scaleY,
  },
  salonPhotoThumb: {
    borderRadius: 8 * scale,
    height: 78 * scale,
    overflow: 'hidden',
    width: 78 * scale,
  },
  salonPhotoImage: {
    height: '100%',
    width: '100%',
  },
  removePhotoButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 13 * scale,
    height: 26 * scale,
    justifyContent: 'center',
    position: 'absolute',
    right: 5 * scale,
    top: 5 * scale,
    width: 26 * scale,
  },
  salonPhotoCount: {
    color: '#77777d',
    fontSize: 14 * scale,
    marginTop: 13 * scaleY,
    textAlign: 'center',
  },
  salonTip: {
    alignItems: 'center',
    backgroundColor: '#fff4f8',
    borderRadius: 8 * scale,
    flexDirection: 'row',
    gap: 15 * scale,
    marginTop: 24 * scaleY,
    padding: 15 * scale,
  },
  portfolioInput: {
    alignItems: 'center',
    borderColor,
    borderRadius: 10 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    height: 63 * scaleY,
    marginTop: 12 * scaleY,
    paddingHorizontal: 17 * scale,
  },
  agreementRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginTop: 46 * scaleY,
  },
  checkBox: {
    alignItems: 'center',
    borderColor: brandPink,
    borderRadius: 5 * scale,
    borderWidth: 1.5,
    height: 20 * scale,
    justifyContent: 'center',
    marginRight: 14 * scale,
    marginTop: 2 * scaleY,
    width: 20 * scale,
  },
  checkBoxActive: {
    backgroundColor: brandPink,
  },
  agreementTextWrap: {
    flex: 1,
  },
  agreementTitle: {
    color: darkText,
    fontSize: 13.5 * scale,
    fontWeight: '500',
    lineHeight: 19 * scale,
  },
  pinkText: {
    color: brandPink,
  },
  agreementDescription: {
    color: '#77777d',
    fontSize: 11.5 * scale,
    lineHeight: 17 * scale,
    marginTop: 6 * scaleY,
  },
  agreementDivider: {
    backgroundColor: '#ececf0',
    height: 1,
    marginTop: 25 * scaleY,
  },
  masterActionsInline: {
    marginTop: 30 * scaleY,
  },
  roleOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  roleSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18 * scale,
    borderTopRightRadius: 18 * scale,
    paddingBottom: 34 * scaleY,
    paddingHorizontal: 22 * scale,
    paddingTop: 12 * scaleY,
  },
  roleHandle: {
    alignSelf: 'center',
    backgroundColor: '#d8d8dd',
    borderRadius: 2 * scale,
    height: 4 * scaleY,
    marginBottom: 21 * scaleY,
    width: 44 * scale,
  },
  roleTitle: {
    color: darkText,
    fontSize: 23 * scale,
    fontWeight: '700',
    textAlign: 'center',
  },
  roleSubtitle: {
    color: mutedText,
    fontSize: 15 * scale,
    lineHeight: 22 * scale,
    marginBottom: 20 * scaleY,
    marginTop: 8 * scaleY,
    textAlign: 'center',
  },
  roleOption: {
    alignItems: 'center',
    borderColor,
    borderRadius: 10 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 12 * scaleY,
    minHeight: 76 * scaleY,
    paddingHorizontal: 16 * scale,
  },
  roleIconCircle: {
    alignItems: 'center',
    backgroundColor: '#fde8f1',
    borderRadius: 24 * scale,
    height: 48 * scale,
    justifyContent: 'center',
    marginRight: 15 * scale,
    width: 48 * scale,
  },
  roleOptionText: {
    flex: 1,
  },
  roleOptionTitle: {
    color: darkText,
    fontSize: 17 * scale,
    fontWeight: '600',
  },
  roleOptionSubtitle: {
    color: mutedText,
    fontSize: 12.8 * scale,
    lineHeight: 18 * scale,
    marginTop: 5 * scaleY,
  },
  successScreen: {
    backgroundColor: '#fff',
    flex: 1,
  },
  successScrollContent: {
    flexGrow: 1,
    paddingBottom: 34 * scaleY,
    paddingHorizontal: 27 * scale,
  },
  successHero: {
    alignItems: 'center',
    marginTop: 74 * scaleY,
  },
  successCelebration: {
    alignItems: 'center',
    height: 178 * scale,
    justifyContent: 'center',
    position: 'relative',
    width: 280 * scale,
  },
  successSparkle: {
    fontSize: 17 * scale,
    position: 'absolute',
  },
  successSparklePinkLeft: {
    color: '#ff83ad',
    left: 45 * scale,
    top: 27 * scale,
  },
  successSparkleGreenLeft: {
    color: '#7ed991',
    left: 15 * scale,
    top: 84 * scale,
  },
  successSparkleGreenRight: {
    color: '#8cdda0',
    right: 39 * scale,
    top: 38 * scale,
  },
  successSparklePinkRight: {
    color: '#ff83ad',
    right: 16 * scale,
    top: 91 * scale,
  },
  successSparklePinkBottom: {
    bottom: 17 * scale,
    color: '#ff83ad',
    left: 48 * scale,
  },
  successSparkleSandBottom: {
    bottom: 0,
    color: '#ceb9ad',
    right: 54 * scale,
  },
  successHalo: {
    alignItems: 'center',
    backgroundColor: '#ecfaef',
    borderRadius: 78 * scale,
    height: 156 * scale,
    justifyContent: 'center',
    width: 156 * scale,
  },
  successTitle: {
    color: darkText,
    fontSize: 25 * scale,
    fontWeight: '600',
    lineHeight: 34 * scale,
    marginTop: 34 * scaleY,
    textAlign: 'center',
  },
  successSubtitle: {
    color: mutedText,
    fontSize: 16 * scale,
    lineHeight: 25 * scale,
    marginTop: 15 * scaleY,
    textAlign: 'center',
  },
  successInfoCard: {
    alignItems: 'center',
    borderColor,
    borderRadius: 10 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 34 * scaleY,
    minHeight: 102 * scaleY,
    paddingHorizontal: 19 * scale,
  },
  successIconCircle: {
    alignItems: 'center',
    backgroundColor: '#ecfaef',
    borderRadius: 31 * scale,
    height: 62 * scale,
    justifyContent: 'center',
    marginRight: 19 * scale,
    width: 62 * scale,
  },
  successInfoText: {
    flex: 1,
  },
  successInfoTitle: {
    color: darkText,
    fontSize: 16 * scale,
    fontWeight: '600',
    lineHeight: 23 * scale,
  },
  successInfoSubtitle: {
    color: '#66666c',
    fontSize: 13.8 * scale,
    lineHeight: 22 * scale,
    marginTop: 7 * scaleY,
  },
  successMailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 18 * scale,
    marginTop: 30 * scaleY,
  },
  mailIconCircle: {
    alignItems: 'center',
    backgroundColor: '#fde8f1',
    borderRadius: 26 * scale,
    height: 52 * scale,
    justifyContent: 'center',
    marginRight: 27 * scale,
    width: 52 * scale,
  },
  successMailText: {
    color: '#66666c',
    fontSize: 14.5 * scale,
    lineHeight: 22 * scale,
  },
  successActionsInline: {
    marginTop: 58 * scaleY,
  },
  homeButton: {
    alignItems: 'center',
    borderColor: '#e4e4e8',
    borderRadius: 10 * scale,
    borderWidth: 1,
    flexDirection: 'row',
    height: 61 * scaleY,
    justifyContent: 'center',
    marginTop: 18 * scaleY,
  },
  homeButtonText: {
    color: darkText,
    fontSize: 18 * scale,
    marginLeft: 25 * scale,
  },
});
