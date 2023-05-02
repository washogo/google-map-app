import { useEffect, useState } from 'react';
import { Box, Button, Flex, Text, Image, Input } from '@chakra-ui/react';
import { Map } from './Map';

const defaultLatLng = {
  lat: 35.7022589,
  lng: 129.7744733,
};

export const MapContainer = () => {
  const [location, setLocation] = useState<google.maps.LatLngLiteral>(defaultLatLng);
  const [isSwitchLocation, setIsSwitchLocation] = useState('off');
  const [isLoading, setIsLoading] = useState(location === defaultLatLng);
  const [searchText, setSearchText] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const searchNearbyPlaces = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setIsLoading(latitude === defaultLatLng.lat && longitude === defaultLatLng.lng);
        setLocation({
          lat: latitude,
          lng: longitude,
        });
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  useEffect(() => {
    searchNearbyPlaces();
  }, []);

  const resetSwitchLocation = () => {
    setIsSwitchLocation('off');
  };



  return (
    <>
      <Flex justifyContent="center" alignItems="center" bgColor="#6C9F43" textAlign="center" flexDirection="row">
        <Box>
          <Text fontFamily="游ゴシック, YuGothic, sans-serif" color="white" pb={'10px'}>
            <Image src="/images/marker.png" width={30} height={30} alt="ジム" />
            がジム
          </Text>
        </Box>
        <Box>
          <Text fontFamily="游ゴシック, YuGothic, sans-serif" color="white" ml={'10px'}>
            <Box as="span" color="blue" fontWeight="bold">
              〇
            </Box>
            が温泉・銭湯・サウナ
          </Text>
        </Box>
      </Flex>

      <Box display="flex" justifyContent="center" alignItems="center" textAlign="center" bgColor="#6C9F43">
        <Button
          onClick={() => setIsSwitchLocation('on')}
          borderRadius="50px"
          px={20}
          py={10}
          bg="#38B6FF"
          color="white"
          fontFamily="游ゴシック, YuGothic, sans-serif"
          cursor="pointer"
          _hover={{ cursor: 'pointer' }}
          width="100px"
          height={'15px'}
          margin={'5px'}
        >
          現在地に戻る
        </Button>
        <Input
          type="text"
          placeholder="    地名を入力   例:東京"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          borderRadius={'10px'}
          fontFamily="游ゴシック, YuGothic, sans-serif"
          cursor="pointer"
          _hover={{ cursor: 'pointer' }}
        />
        <Button
          borderRadius={'10px'}
          cursor="pointer"
          _hover={{ cursor: 'pointer' }}
          fontFamily="游ゴシック, YuGothic,sans-serif"
          onClick={() => setSearchLocation(searchText)}
        >
          検索
        </Button>
      </Box>
      {!isLoading && (
        <Map
          location={location}
          searchLocation={searchLocation}
          isSwitchLocation={isSwitchLocation}
          onClickResetSwitch={resetSwitchLocation}
        />
      )}
    </>
  );
};
