import L from 'leaflet';
import mapboxgl from 'mapbox-gl';
import { updateState } from '../core/state.js';

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
if (!MAPBOX_ACCESS_TOKEN) {
	console.warn('VITE_MAPBOX_TOKEN is not set. Falling back to OpenFreeMap vector tiles for artistic mode.');
}

let map = null;
let tileLayer = null;
let artisticMap = null;
let currentArtisticThemeName = null;
let isSyncing = false;
let styleChangeInProgress = false;
let pendingArtisticStyle = null;
let pendingArtisticThemeName = null;

export function initMap(containerId, initialCenter, initialZoom, initialTileUrl) {
	map = L.map(containerId, {
		zoomControl: false,
		attributionControl: false,
		scrollWheelZoom: 'center',
		touchZoom: 'center'
	}).setView(initialCenter, initialZoom);

	tileLayer = L.tileLayer(initialTileUrl, {
		maxZoom: 19,
		crossOrigin: true,
	}).addTo(map);

	map.on('moveend', () => {
		if (isSyncing) return;
		isSyncing = true;

		const center = map.getCenter();
		const zoom = map.getZoom();
		updateState({
			lat: center.lat,
			lon: center.lng,
			zoom: zoom
		});

		if (artisticMap) {
			artisticMap.jumpTo({
				center: [center.lng, center.lat],
				zoom: zoom - 1
			});
		}

		isSyncing = false;
	});

	initArtisticMap('artistic-map', [initialCenter[1], initialCenter[0]], initialZoom - 1);

	return map;
}

function initArtisticMap(containerId, center, zoom) {
	artisticMap = new mapboxgl.Map({
		container: containerId,
		style: { version: 8, sources: {}, layers: [] },
		center: center,
		zoom: zoom,
		interactive: true,
		attributionControl: false,
		preserveDrawingBuffer: true
	});

	artisticMap.scrollZoom.setWheelZoomRate(1);
	artisticMap.scrollZoom.setZoomRate(1 / 600);

	artisticMap.on('style.load', () => {
		if (pendingArtisticStyle) {
			const next = pendingArtisticStyle;
			const nextName = pendingArtisticThemeName;
			pendingArtisticStyle = null;
			pendingArtisticThemeName = null;
			currentArtisticThemeName = nextName;
			artisticMap.setStyle(next);
		} else {
			styleChangeInProgress = false;
		}
	});
	artisticMap.on('moveend', () => {
		if (isSyncing) return;
		isSyncing = true;

		const center = artisticMap.getCenter();
		const zoom = artisticMap.getZoom();

		updateState({
			lat: center.lat,
			lon: center.lng,
			zoom: zoom + 1
		});

		if (map) {
			map.setView([center.lat, center.lng], zoom + 1, { animate: false });
		}

		isSyncing = false;
	});
}

export function updateArtisticStyle(theme) {
	if (!artisticMap) return;
	if (currentArtisticThemeName === theme.name) return;

	currentArtisticThemeName = theme.name;
	const style = generateArtisticStyle(theme);

	if (styleChangeInProgress) {
		pendingArtisticStyle = style;
		pendingArtisticThemeName = theme.name;
		try { artisticMap.setStyle(style); } catch (e) { }
		return;
	}

	styleChangeInProgress = true;
	try {
		artisticMap.setStyle(style);
	} catch (e) {
		pendingArtisticStyle = style;
		pendingArtisticThemeName = theme.name;
	}
}

function generateArtisticStyle(theme) {
	const hasMapboxToken = !!MAPBOX_ACCESS_TOKEN;
	const sourceId = hasMapboxToken ? 'mapbox-streets' : 'openfreemap';
	const sourceLayerRoad = hasMapboxToken ? 'road' : 'transportation';
	const sourceLayerPark = hasMapboxToken ? 'landuse' : 'park';
	const parkFilter = hasMapboxToken
		? ['match', ['get', 'class'], ['park', 'pitch', 'grass', 'wood', 'scrub', 'cemetery', 'school'], true, false]
		: true;
	const roadFilterCommon = hasMapboxToken
		? ['==', ['geometry-type'], 'LineString']
		: true;

	const motorwayClasses = hasMapboxToken
		? ['motorway', 'trunk', 'motorway_link', 'trunk_link']
		: ['motorway'];
	const primaryClasses = hasMapboxToken
		? ['primary', 'primary_link']
		: ['primary'];
	const secondaryClasses = hasMapboxToken
		? ['secondary', 'secondary_link']
		: ['secondary'];
	const tertiaryClasses = hasMapboxToken
		? ['tertiary', 'tertiary_link']
		: ['tertiary'];
	const residentialClasses = hasMapboxToken
		? ['street', 'street_limited', 'service', 'track', 'residential']
		: ['residential'];
	const coveredRoadClasses = hasMapboxToken
		? [...motorwayClasses, ...primaryClasses, ...secondaryClasses, ...tertiaryClasses, ...residentialClasses]
		: ['motorway', 'primary', 'secondary', 'tertiary', 'residential'];

	return {
		version: 8,
		name: theme.name,
		sources: {
			[sourceId]: hasMapboxToken
				? {
					type: 'vector',
					url: 'mapbox://mapbox.mapbox-streets-v8'
				}
				: {
				type: 'vector',
				url: 'https://tiles.openfreemap.org/planet'
			}
		},
		layers: [
			{
				id: 'background',
				type: 'background',
				paint: { 'background-color': theme.bg }
			},
			{
				id: 'water',
				source: sourceId,
				'source-layer': 'water',
				type: 'fill',
				paint: { 'fill-color': theme.water }
			},
			{
				id: 'park',
				source: sourceId,
				'source-layer': sourceLayerPark,
				type: 'fill',
				filter: parkFilter,
				paint: { 'fill-color': theme.parks }
			},
			{
				id: 'road-default',
				source: sourceId,
				'source-layer': sourceLayerRoad,
				type: 'line',
				filter: ['all', roadFilterCommon, ['!', ['match', ['get', 'class'], coveredRoadClasses, true, false]]],
				paint: { 'line-color': theme.road_default, 'line-width': 0.5 }
			},
			{
				id: 'road-residential',
				source: sourceId,
				'source-layer': sourceLayerRoad,
				type: 'line',
				filter: ['all', roadFilterCommon, ['match', ['get', 'class'], residentialClasses, true, false]],
				paint: { 'line-color': theme.road_residential, 'line-width': 0.5 }
			},
			{
				id: 'road-tertiary',
				source: sourceId,
				'source-layer': sourceLayerRoad,
				type: 'line',
				filter: ['all', roadFilterCommon, ['match', ['get', 'class'], tertiaryClasses, true, false]],
				paint: { 'line-color': theme.road_tertiary, 'line-width': 0.8 }
			},
			{
				id: 'road-secondary',
				source: sourceId,
				'source-layer': sourceLayerRoad,
				type: 'line',
				filter: ['all', roadFilterCommon, ['match', ['get', 'class'], secondaryClasses, true, false]],
				paint: { 'line-color': theme.road_secondary, 'line-width': 1.0 }
			},
			{
				id: 'road-primary',
				source: sourceId,
				'source-layer': sourceLayerRoad,
				type: 'line',
				filter: ['all', roadFilterCommon, ['match', ['get', 'class'], primaryClasses, true, false]],
				paint: { 'line-color': theme.road_primary, 'line-width': 1.5 }
			},
			{
				id: 'road-motorway',
				source: sourceId,
				'source-layer': sourceLayerRoad,
				type: 'line',
				filter: ['all', roadFilterCommon, ['match', ['get', 'class'], motorwayClasses, true, false]],
				paint: { 'line-color': theme.road_motorway, 'line-width': 2.0 }
			}
		]
	};
}

export function updateMapPosition(lat, lon, zoom, options = { animate: true }) {
	if (map) {
		if (lat !== undefined && lon !== undefined) {
			map.setView([lat, lon], zoom || map.getZoom(), options);
		} else if (zoom !== undefined) {
			map.setZoom(zoom, options);
		}
	}
}

export function updateMapTheme(tileUrl) {
	if (tileLayer) {
		tileLayer.setUrl(tileUrl);
	}
}

export function waitForTilesLoad(timeout = 5000) {
	return new Promise((resolve) => {
		if (!map || !tileLayer) return resolve();

		try {
			if (tileLayer._tiles) {
				const tiles = Object.values(tileLayer._tiles || {});
				const anyLoading = tiles.some(t => {
					const el = t.el || t.tile || (t._el);
					return el && el.complete === false;
				});
				if (!anyLoading) return resolve();
			}
		} catch (e) {
		}

		let resolved = false;
		const onLoad = () => {
			if (resolved) return;
			resolved = true;
			clearTimeout(timer);
			resolve();
		};

		tileLayer.once('load', onLoad);

		const timer = setTimeout(() => {
			if (resolved) return;
			resolved = true;
			resolve();
		}, timeout);
	});
}

export function waitForArtisticIdle(timeout = 2000) {
	return new Promise((resolve) => {
		if (!artisticMap) return resolve();

		let resolved = false;
		const onIdle = () => {
			if (resolved) return;
			resolved = true;
			clearTimeout(timer);
			resolve();
		};

		try {
			artisticMap.once('idle', onIdle);
		} catch (e) {
			resolve();
			return;
		}

		const timer = setTimeout(() => {
			if (resolved) return;
			resolved = true;
			resolve();
		}, timeout);
	});
}

export function getMapInstance() {
	return map;
}

export function getArtisticMapInstance() {
	return artisticMap;
}

export function invalidateMapSize() {
	if (map) {
		map.invalidateSize({ animate: false });
	}
	if (artisticMap) {
		artisticMap.resize();
	}
}
