import GoogleMapReact, { Coords } from 'google-map-react';
import { useEffect, useState } from 'react';
import Geocode from 'react-geocode';

type Props = {
  location: Coords;
  isSwitchLocation: string;
  onClickResetSwitch: () => void;
  searchLocation: string;
};

Geocode.setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API as string);

export const Map = (props: Props) => {
  const { location, isSwitchLocation, onClickResetSwitch, searchLocation } = props;
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [maps, setMaps] = useState<any>(null);
  const [value, setValue] = useState('');

  // 現在地に戻す処理
  const getCenterPosition = (location: Coords, isSwitchLocation: string, onClickResetSwitch: () => void) => {
    if (map && isSwitchLocation === 'on') {
      const { lat, lng } = location;
      const centerLocation = new google.maps.LatLng(lat, lng);
      map.setCenter(centerLocation);
      map.setZoom(15);
      onClickResetSwitch();
    }
  };

  useEffect(() => {
    // 「現在地に戻る」ボタンがクリックされたときに現在地まで移動する
    getCenterPosition(location, isSwitchLocation, onClickResetSwitch);
    // 「検索」ボタンをクリックしたときに住所検索を行う
    if (searchLocation !== '') {
      searchLocationHandler(searchLocation, map);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, isSwitchLocation, onClickResetSwitch, searchLocation, map]);

  // 入力値を使って住所検索を行い、マーカーを立てて、その周辺まで移動する処理
  const searchLocationHandler = (keyword: string, map: google.maps.Map | null) => {
    if (!map) return;

    const infowindow = new google.maps.InfoWindow();

    Geocode.fromAddress(keyword)
      .then((response) => {
        const results = response.results;
        if (!results) return;
        const locationItemList = results.map((item: any) => {
          return {
            location: item.geometry?.location,
            address: item.formatted_address,
          };
        });

        infowindow.close();

        locationItemList.forEach((item: any) => {
          map.setCenter(item.location);
          map.setZoom(10);
          const marker = new google.maps.Marker({
            map: map,
            position: item.location,
          });
          marker.addListener('click', () => {
            infowindow.setContent("<div style='color: black;'><strong>" + item.address + '</strong></div>');
            infowindow.open(map, marker);
          });
        });
      })
      .catch((e) => console.log(e));
  };

  const handleApiLoaded = ({ map, maps }: { map: google.maps.Map; maps: any }) => {
    setMap(map);
    setMaps(maps);

    const service = new google.maps.places.PlacesService(map);
    if (maps === null) return;
    const bounds = new maps.LatLngBounds();

    // 現在地から半径1.5km以内の範囲を円形に表示
    const circle = new google.maps.Circle({
      center: location,
      radius: 1500,
    });
    map.fitBounds(circle.getBounds()!);

    const searchKeywords = ['gym', 'spa', 'ジム', '温泉', '銭湯', 'サウナ'];

    searchKeywords.forEach((keyword) => {
      service.textSearch(
        {
          location, // 現在地
          radius: 1500, // 対象範囲
          query: keyword, // 検索ワード
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            if (!results) return;

            const locationItemList = results.map((result) => {
              return {
                lat: result.geometry?.location?.lat(),
                lng: result.geometry?.location?.lng(),
                placeId: result.place_id,
              };
            });

            locationItemList.forEach((item) => {
              let markerIcon;
              if (['温泉', '銭湯', 'サウナ'].includes(keyword)) {
                markerIcon = {
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: 'blue',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  scale: 8,
                };
              } else {
                markerIcon = undefined;
              }

              const marker = new maps.Marker({
                position: {
                  lat: item.lat,
                  lng: item.lng,
                },
                map,
                icon: markerIcon,
              });

              marker.addListener('click', () => {
                const request = {
                  placeId: item.placeId || '',
                  fields: ['name', 'formatted_address', 'formatted_phone_number', 'rating', 'opening_hours', 'website'],
                };
                service.getDetails(request, (place, status) => {
                  if (status !== google.maps.places.PlacesServiceStatus.OK) return;

                  const content = `
              <div style='color: black;'>
                <h4>${place?.name}</h4>
                <p>${place?.formatted_address}</p>
                <p>電話番号：${place?.formatted_phone_number}</p>
                <p>評価：${place?.rating}</p>
                <p>営業時間：${place?.opening_hours?.weekday_text}</p>
                <p>ウェブサイト：${place?.website}</p>
                <a href="https://www.google.com/maps/search/?api=1&query=${place?.name}" target="_blank" rel="noopener noreferrer" style='fontWeight: bold; color: blue;'>Google Map で見る</a>
              </div>
            `;

                  const infoWindow = new google.maps.InfoWindow({
                    content,
                  });
                  infoWindow.open(map, marker);
                });
              });

              bounds.extend(marker.position);

              // TODO: 不要なら削除すること
              // NOTE: この処理により表示位置がずれるためコメントアウトした
              // map.fitBounds(bounds);
            });
          }
        }
      );
    });
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{
          key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API as string,
          libraries: ['drawing', 'geometry', 'places', 'visualization'],
        }}
        defaultCenter={location}
        defaultZoom={1}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={handleApiLoaded}
      />
    </div>
  );
};
