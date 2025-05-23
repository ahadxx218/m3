mapboxgl.accessToken = 'pk.eyJ1IjoiYWhhZHh4MjE4IiwiYSI6ImNtYjB2bGQ4djB4bjUya3NoeXBuNGh0MjMifQ.MflYCvVk2gJfJ1ycSdLdqw';
let destinationMarker = null;
let directions = null;
let styleToggle = false;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [39.8262, 21.4225],
  zoom: 15
});

navigator.geolocation.getCurrentPosition(pos => {
  const userLng = pos.coords.longitude;
  const userLat = pos.coords.latitude;
  map.setCenter([userLng, userLat]);

  new mapboxgl.Marker({ color: 'blue' })
    .setLngLat([userLng, userLat])
    .addTo(map);

  map.on('click', (e) => {
    const lng = e.lngLat.lng;
    const lat = e.lngLat.lat;

    if (destinationMarker) destinationMarker.remove();

    destinationMarker = new mapboxgl.Marker({ color: 'green' })
      .setLngLat([lng, lat])
      .addTo(map);

    fetch(`https://api.mapbox.com/directions/v5/mapbox/walking/${userLng},${userLat};${lng},${lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`)
      .then(response => response.json())
      .then(data => {
        if (map.getSource('route')) {
          map.removeLayer('route');
          map.removeSource('route');
        }

        const route = data.routes[0].geometry;
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: route
          }
        });

        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b9ddd',
            'line-width': 5
          }
        });
      });
  });
});

function resetDestination() {
  if (destinationMarker) {
    destinationMarker.remove();
    destinationMarker = null;
  }
  if (map.getSource('route')) {
    map.removeLayer('route');
    map.removeSource('route');
  }
}

function toggleStyle() {
  styleToggle = !styleToggle;
  map.setStyle(styleToggle ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/streets-v11');
}
