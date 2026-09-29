'use client';

import { useEffect, useRef, useState } from 'react';
import type { Patient } from '../lib/demo';

const CABINET = {
  name: 'Cabinet des Tilleuls',
  address: '3 place Viarme, 44000 Nantes',
  coordinates: [47.2199, -1.5629] as [number, number],
};

export function RouteMap({ stops }: { stops: Patient[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [routingState, setRoutingState] = useState<'loading' | 'ready' | 'fallback'>('loading');

  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;
    let map: import('leaflet').Map | undefined;

    async function mountMap() {
      const L = await import('leaflet');
      if (disposed || !containerRef.current) return;
      map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const points: [number, number][] = [CABINET.coordinates, ...stops.map((stop) => stop.coordinates)];
      const cabinetIcon = L.divIcon({
        className: 'route-marker-shell',
        html: '<span class="route-marker cabinet-marker">C</span>',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      L.marker(CABINET.coordinates, { icon: cabinetIcon })
        .addTo(map)
        .bindPopup(`<strong>${CABINET.name}</strong><br>${CABINET.address}`);

      stops.forEach((stop, index) => {
        const icon = L.divIcon({
          className: 'route-marker-shell',
          html: `<span class="route-marker">${index + 1}</span>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });
        L.marker(stop.coordinates, { icon })
          .addTo(map!)
          .bindPopup(`<strong>${index + 1}. ${stop.name}</strong><br>${stop.address}<br>${stop.care}`);
      });
      map.fitBounds(L.latLngBounds(points), { padding: [34, 34] });

      const coordinates = points.map(([lat, lng]) => `${lng},${lat}`).join(';');
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`,
        );
        if (!response.ok) throw new Error('routing unavailable');
        const data = (await response.json()) as { routes?: { geometry: GeoJSON.LineString }[] };
        if (!data.routes?.[0]) throw new Error('route missing');
        L.geoJSON(data.routes[0].geometry, {
          style: { color: '#ffffff', weight: 11, opacity: 0.96, lineCap: 'round', lineJoin: 'round' },
        }).addTo(map);
        L.geoJSON(data.routes[0].geometry, {
          style: {
            className: 'route-path-flow',
            color: '#167455',
            weight: 7,
            opacity: 1,
            lineCap: 'round',
            lineJoin: 'round',
          },
        }).addTo(map);
        const routePoints = data.routes[0].geometry.coordinates.map(
          ([lng, lat]) => [lat, lng] as [number, number],
        );
        map.fitBounds(L.latLngBounds(routePoints), { padding: [38, 38] });
        if (!disposed) setRoutingState('ready');
      } catch {
        L.polyline(points, { color: '#ffffff', weight: 10, opacity: 0.92 }).addTo(map);
        L.polyline(points, {
          className: 'route-path-flow',
          color: '#167455',
          weight: 6,
          opacity: 1,
          dashArray: '10 9',
        }).addTo(map);
        if (!disposed) setRoutingState('fallback');
      }
    }

    void mountMap();
    return () => {
      disposed = true;
      map?.remove();
    };
  }, [stops]);

  return (
    <div className="map-canvas real-map-wrap">
      <div ref={containerRef} className="real-route-map" aria-label="Carte réelle de la tournée dans Nantes" />
      <div className="map-legend">
        <span className="route-line-sample" aria-hidden="true" />
        {routingState === 'loading' && 'Calcul du tracé…'}
        {routingState === 'ready' && 'Tracé de la tournée · sens C → 8'}
        {routingState === 'fallback' && 'Tracé simplifié · sens C → 8'}
      </div>
    </div>
  );
}

export { CABINET };
