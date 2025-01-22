/* eslint-disable */
export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'sk.eyJ1IjoiYWtraTg4MjciLCJhIjoiY202ODBoZjAyMDh4aTJrcXVscmt1c2wzZiJ9.xPl_YgFAx88acdnAlT7UEg';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/akki8827/cm67zl91600hp01sfcn6ugr3l',
    scrollZoom: false,
    // center: [-118.113491, 34.111745],
    // zoom: 10,
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
