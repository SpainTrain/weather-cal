import { isString } from 'lodash'
import { useCallback } from 'react'

import {
  Box,
  Button,
  Grid2,
  InputAdornment,
  LinearProgress,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'

import { Check, ContentCopy } from '@mui/icons-material'

import { useCopyToClipboard } from './hooks'
import { useUserRecord } from './firebase'
import { LocationWidget } from './LocationWidget'
import { Location, Units } from './types'
import { CalendarDirections } from './CalendarDirections'

interface UsersCalendarProps {
  uid: string
}

export const UsersCalendar = ({ uid }: UsersCalendarProps) => {
  const { userRecord, loading, updateUserRecord, updating } = useUserRecord(uid)

  const units = userRecord?.units ?? 'imperial'

  const handleToggleUnits = useCallback(
    (_: unknown, newUnits: Units) => {
      if (isString(newUnits) && newUnits !== units && userRecord !== null) {
        updateUserRecord({ units: newUnits, location: userRecord.location })
      }
    },
    [userRecord],
  )

  const handleUpdateLocation = useCallback(
    (location: Location) => {
      updateUserRecord({ location, units })
    },
    [updateUserRecord],
  )

  const webcalUrl = `${location.protocol}//${location.host}/forecast?calid=${uid}`

  const { copied: urlCopied, copyToClipboard: handleCopyUrl } =
    useCopyToClipboard(webcalUrl)

  return loading ? (
    <LinearProgress />
  ) : (
    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 0, sm: 1, md: 1, lg: 2, xl: 3 }}></Grid2>
      <Grid2 size={{ xs: 12, sm: 10, md: 10, lg: 8, xl: 6 }}>
        {userRecord ? (
          <Box
            sx={{
              paddingLeft: { xs: '1em', sm: 0 },
            }}
          >
            <Grid2
              container
              alignItems="center"
              spacing={2}
              sx={{ marginTop: '2em' }}
            >
              <Grid2
                size={{
                  xs: 8,
                  sm: 8,
                  md: 9,
                  lg: 9,
                  xl: 10,
                }}
              >
                <TextField
                  fullWidth
                  label="Location"
                  variant="standard"
                  value={userRecord?.location.friendlyName}
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                  }}
                />
              </Grid2>
              <Grid2
                container
                size={{
                  xs: 4,
                  sm: 4,
                  md: 3,
                  lg: 3,
                  xl: 2,
                }}
                sx={{ justifyContent: 'center' }}
              >
                <ToggleButtonGroup
                  color="secondary"
                  exclusive
                  value={units}
                  onChange={handleToggleUnits}
                  aria-label="Units"
                  size="large"
                  disabled={updating}
                >
                  <ToggleButton
                    value="imperial"
                    aria-label="Imperial - Fahrenheit"
                  >
                    ° F
                  </ToggleButton>
                  <ToggleButton value="metric" aria-label="Metric - Celsius">
                    ° C
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid2>
              <Grid2 size={12}>
                <TextField
                  fullWidth
                  label="Calendar URL"
                  variant="standard"
                  value={webcalUrl}
                  slotProps={{
                    input: {
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Button
                            startIcon={urlCopied ? <Check /> : <ContentCopy />}
                            color={urlCopied ? 'success' : 'primary'}
                            onClick={handleCopyUrl}
                            sx={{ minWidth: '7em' }}
                          >
                            {urlCopied ? 'Copied' : 'Copy'}
                          </Button>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid2>
            </Grid2>
            <Box>
              <CalendarDirections webcalUrl={webcalUrl} />
            </Box>
          </Box>
        ) : null}
        <Box
          sx={{
            marginTop: '2em',
            textAlign: 'center',
            height: '100vh',
          }}
        >
          <LocationWidget
            currentLocation={userRecord?.location}
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            googleMapsMapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
            updateLocation={handleUpdateLocation}
            updating={updating}
          />
        </Box>
      </Grid2>
      <Grid2 size="grow"></Grid2>
    </Grid2>
  )
}
