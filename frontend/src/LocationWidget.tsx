import { useState, useEffect, useRef, useCallback } from 'react'

import {
  Box,
  Button,
  useTheme,
  TextField,
  CircularProgress,
} from '@mui/material'

import {
  APIProvider,
  ControlPosition,
  MapControl,
  AdvancedMarker,
  Map,
  useMap,
  useMapsLibrary,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps'

import { Location } from './types'

interface LocationWidgetProps {
  googleMapsApiKey: string
  googleMapsMapId: string
  currentLocation?: Location
  updateLocation: (location: Location) => void
  updating: boolean
}

export const LocationWidget = ({
  currentLocation,
  googleMapsApiKey,
  googleMapsMapId,
  updateLocation,
  updating,
}: LocationWidgetProps) => {
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null)
  const [markerRef, marker] = useAdvancedMarkerRef()

  const handleUpdateLocation = useCallback(() => {
    const friendlyName = selectedPlace?.formatted_address
    const lat = selectedPlace?.geometry?.location?.lat()
    const lon = selectedPlace?.geometry?.location?.lng()

    if (friendlyName === undefined) {
      console.error('handleUpdateLocation', 'Unexpected undefined friendlyName')
      return
    }
    if (lat === undefined || lon === undefined) {
      console.error('handleUpdateLocation', 'Unexpected undefined lat or lon')
      return
    }

    updateLocation({
      friendlyName,
      lat,
      lon,
    })
  }, [selectedPlace, updateLocation])

  const locMatchesSelectedPlace =
    currentLocation?.friendlyName === selectedPlace?.formatted_address &&
    currentLocation?.lat === selectedPlace?.geometry?.location?.lat() &&
    currentLocation?.lon === selectedPlace?.geometry?.location?.lng()

  return (
    <APIProvider apiKey={googleMapsApiKey}>
      <Map
        mapId={googleMapsMapId}
        defaultZoom={3}
        defaultCenter={{ lat: 22.54992, lng: 0 }}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        <AdvancedMarker ref={markerRef} position={null} />
      </Map>
      <MapControl position={ControlPosition.TOP}>
        <Box>
          <PlaceAutocomplete
            locationAlreadySet={!!currentLocation}
            onPlaceSelect={setSelectedPlace}
          />

          <Box sx={{ marginTop: '1em' }}>
            {updating ? (
              <CircularProgress />
            ) : (
              <Button
                disabled={selectedPlace === null || locMatchesSelectedPlace}
                variant="contained"
                onClick={handleUpdateLocation}
              >
                Update Weather Location
              </Button>
            )}
          </Box>
        </Box>
      </MapControl>
      <MapHandler loc={currentLocation} place={selectedPlace} marker={marker} />
    </APIProvider>
  )
}

interface MapHandlerProps {
  loc?: Location
  place: google.maps.places.PlaceResult | null
  marker: google.maps.marker.AdvancedMarkerElement | null
}

const MapHandler = ({ loc, place, marker }: MapHandlerProps) => {
  const map = useMap()

  useEffect(() => {
    if (!map || (!place && !loc) || !marker) return

    if (place?.geometry?.viewport) {
      map.fitBounds(place.geometry?.viewport)
    } else if (loc) {
      map.fitBounds({
        north: loc.lat + 0.01,
        south: loc.lat - 0.01,
        east: loc.lon + 0.01,
        west: loc.lon - 0.01,
      })
    }

    marker.position = place?.geometry
      ? place?.geometry?.location
      : loc
      ? { lat: loc.lat, lng: loc.lon }
      : undefined
  }, [map, loc, place, marker])

  return null
}

interface PlaceAutocompleteProps {
  locationAlreadySet: boolean
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void
}

const PlaceAutocomplete = ({
  locationAlreadySet,
  onPlaceSelect,
}: PlaceAutocompleteProps) => {
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const places = useMapsLibrary('places')

  useEffect(() => {
    if (!places || !inputRef.current) return

    const options = {
      fields: ['geometry', 'name', 'formatted_address'],
    }

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options))
  }, [places])

  useEffect(() => {
    if (!placeAutocomplete) return

    placeAutocomplete.addListener('place_changed', () => {
      onPlaceSelect(placeAutocomplete.getPlace())
    })
  }, [onPlaceSelect, placeAutocomplete])

  const theme = useTheme()

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        borderRadius: '0.5em',
        marginTop: '1em',
        minWidth: '16vw',
      }}
    >
      <TextField
        label={locationAlreadySet ? 'Update location' : 'Search for a location'}
        variant="filled"
        inputRef={inputRef}
        fullWidth
      />
    </Box>
  )
}
