import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function geocodeStop(stop, near) {
  if (Number.isFinite(Number(stop.lat)) && Number.isFinite(Number(stop.lng))) return [Number(stop.lat), Number(stop.lng)];
  const key = `careerz-geocode:${stop.name}`;
  const cached = sessionStorage.getItem(key);
  if (cached) return JSON.parse(cached);
  const viewbox = near ? `&viewbox=${near[1] - 0.7},${near[0] + 0.7},${near[1] + 0.7},${near[0] - 0.7}&bounded=0` : '';
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(stop.name)}${viewbox}`, { headers: { 'Accept-Language': 'en' } });
  if (!response.ok) throw new Error(`Could not find ${stop.name} on the map.`);
  const rows = await response.json();
  if (!rows[0]) throw new Error(`Could not find ${stop.name} on the map. Add its coordinates in Manage Route.`);
  const point = [Number(rows[0].lat), Number(rows[0].lon)];
  sessionStorage.setItem(key, JSON.stringify(point));
  return point;
}

function instructionText(step) {
  const maneuver = step?.maneuver || {};
  const road = step?.name ? ` onto ${step.name}` : '';
  if (maneuver.type === 'arrive') return 'You have reached the destination';
  if (maneuver.type === 'depart') return `Start${road}`;
  if (maneuver.type === 'turn') return `Turn ${maneuver.modifier || ''}${road}`.trim();
  if (maneuver.type === 'roundabout' || maneuver.type === 'rotary') return `Enter the roundabout${road}`;
  return `${maneuver.type || 'Continue'} ${maneuver.modifier || ''}${road}`.trim();
}

export default function TransportNavigationMap({ ping, vehicle, navigation = false }) {
  const elementRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const accuracyRef = useRef(null);
  const routeRef = useRef(null);
  const [route, setRoute] = useState(null);
  const [error, setError] = useState('');
  const stops = (vehicle?.stopPoints || []).filter((stop) => stop?.name);

  useEffect(() => {
    if (!elementRef.current || mapRef.current) return;
    const map = L.map(elementRef.current, { zoomControl: true }).setView([31.42, 73.08], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      routeRef.current = null;
      accuracyRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || ping?.lat == null || ping?.lng == null) return;
    const position = [Number(ping.lat), Number(ping.lng)];
    const heading = ping.heading != null && Number.isFinite(Number(ping.heading)) ? Number(ping.heading) : 0;
    const arrowSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#087d78" stroke="white" stroke-width="5"/><g transform="rotate(${heading} 32 32)"><path d="M32 8 L48 50 L32 42 L16 50 Z" fill="white" stroke="#083e38" stroke-width="2" stroke-linejoin="round"/></g></svg>`;
    const icon = L.icon({ iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(arrowSvg)}`, iconSize: [64, 64], iconAnchor: [32, 32] });
    if (!markerRef.current) markerRef.current = L.marker(position, { icon, zIndexOffset: 1000 }).addTo(mapRef.current);
    else { markerRef.current.setLatLng(position); markerRef.current.setIcon(icon); }
    if (!accuracyRef.current) accuracyRef.current = L.circleMarker(position, { radius: 7, color: '#ffffff', weight: 3, fillColor: '#087d78', fillOpacity: 1 }).addTo(mapRef.current);
    else accuracyRef.current.setLatLng(position);
    if (navigation) mapRef.current.setView(position, 16, { animate: true });
    else if (!routeRef.current) mapRef.current.setView(position, 15);
  }, [ping?.lat, ping?.lng, ping?.heading]);

  useEffect(() => {
    if (!mapRef.current || ping?.lat == null || ping?.lng == null || stops.length === 0) return;
    let cancelled = false;
    async function buildRoute() {
      try {
        setError('');
        const current = [Number(ping.lat), Number(ping.lng)];
        const points = [];
        for (const stop of stops) {
          points.push(await geocodeStop(stop, current));
          if (!stop.lat || !stop.lng) await wait(1050);
        }
        if (cancelled) return;
        const coords = [current, ...points].map(([lat, lng]) => `${lng},${lat}`).join(';');
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=true`);
        const payload = await response.json();
        if (!response.ok || !payload.routes?.[0]) throw new Error('A road route could not be calculated for these stops.');
        const selected = payload.routes[0];
        const line = selected.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        if (routeRef.current) routeRef.current.remove();
        routeRef.current = L.polyline(line, { color: '#4b18d1', weight: 7, opacity: 0.9 }).addTo(mapRef.current);
        points.forEach((point, index) => L.circleMarker(point, { radius: 6, color: index === points.length - 1 ? '#c94f43' : '#f2a62b', fillOpacity: 1 }).addTo(mapRef.current));
        if (navigation) mapRef.current.setView(current, 16, { animate: true });
        else mapRef.current.fitBounds(routeRef.current.getBounds(), { padding: [25, 25] });
        const steps = selected.legs.flatMap((leg) => leg.steps || []).filter((step) => step.distance > 5);
        const actualTurn = steps.find((step) => !['depart', 'arrive'].includes(step.maneuver?.type)) || steps[0];
        setRoute({ distance: selected.distance, duration: selected.duration, next: actualTurn });
      } catch (err) { if (!cancelled) setError(err.message); }
    }
    buildRoute();
    return () => { cancelled = true; };
  }, [vehicle?._id, ping?.lat, ping?.lng, JSON.stringify(stops)]); // eslint-disable-line react-hooks/exhaustive-deps

  function recenter() {
    if (mapRef.current && ping?.lat != null && ping?.lng != null) mapRef.current.setView([Number(ping.lat), Number(ping.lng)], 17, { animate: true });
  }

  return <div style={{ position: 'relative' }}>
    {navigation && <div style={{ position: 'absolute', zIndex: 500, top: 12, left: 60, right: 12, maxWidth: 620, padding: '14px 18px', borderRadius: 16, color: 'white', background: '#06645f', boxShadow: '0 4px 16px #0005', fontWeight: 800 }}>
      {route ? <>
      <div style={{ fontSize: '1.1rem' }}>{instructionText(route.next)}</div>
      <div style={{ marginTop: 4, fontSize: '0.8rem', opacity: 0.9 }}>{(route.distance / 1000).toFixed(1)} km remaining · approximately {Math.max(1, Math.round(route.duration / 60))} min</div>
      </> : <div style={{ fontSize: '0.95rem' }}>Calculating road route and next turn…</div>}
    </div>}
    <div ref={elementRef} style={{ width: '100%', height: navigation ? 480 : 300, border: '1px solid var(--sand-line)', borderRadius: 14, overflow: 'hidden' }} />
    {navigation && <button type="button" onClick={recenter} style={{ position: 'absolute', zIndex: 1200, left: 18, bottom: 20, border: 0, borderRadius: 999, padding: '13px 18px', background: '#fff', color: '#087d78', boxShadow: '0 3px 14px #0005', fontWeight: 800, cursor: 'pointer' }}>➤ Re-center</button>}
    {error && <p className="text-xs" style={{ color: 'var(--rose)', marginTop: 6 }}>{error}</p>}
  </div>;
}
