import React, { useState } from 'react';
import GoogleMapReact, { Coords } from 'google-map-react';

type Props = {
  location: Coords;
};

const Map = (props: Props) => {
  const { location } = props;

  // TODO: どこにもどこにも使用していないため不要なら削除してください
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [maps, setMaps] = useState<any>(null);

  // 「サウナ　ジム」で検索して結果に基づいてマーカーを立てる処理
  const handleApiLoaded = ({ map, maps }: { map: google.maps.Map; maps: any }) => {
    setMap(map);
    setMaps(maps);

    const service = new google.maps.places.PlacesService(map);
    if (maps === null) return;
    const bounds = new maps.LatLngBounds();

    service.textSearch(
      {
        location, // 現在地
        radius: 1500, // 対象範囲
        query: 'サウナ ジム', // 検索ワード
      },
      (results, status) => {
        // TODO: この結果から実装を組み立ててください
        // 検索結果をコンソールに出力
        console.log('検索結果', results);

        // 検索に成功したらマーカーを立てる
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          // 検索結果がないなら処理を終了
          if (!results) return;

          // 検索結果から緯度経度を取得
          const locationItemList = results.map((result) => {
            return {
              lat: result.geometry?.location?.lat(),
              lng: result.geometry?.location?.lng(),
            };
          });
          locationItemList.forEach((item) => {
            const marker = new maps.Marker({
              position: {
                lat: item.lat,
                lng: item.lng,
              },
              map,
            });
            bounds.extend(marker.position);
          });
          map.fitBounds(bounds);
        }
      }
    );
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{
          // 自分のAPIキーを環境変数に設定して使用してください
          key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API as string,
          libraries: ['drawing', 'geometry', 'places', 'visualization'],
        }}
        defaultCenter={location}
        defaultZoom={12}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={handleApiLoaded}
      />
    </div>
  );
};

export default Map;
