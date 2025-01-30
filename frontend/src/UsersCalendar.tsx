import { useCallback } from 'react'

import {
  Alert,
  Box,
  Grid2,
  LinearProgress,
  Link,
  TextField,
  useTheme,
} from '@mui/material'

import { useUserRecord } from './firebase'
import { LocationWidget } from './LocationWidget'
import { Location } from './types'

interface UsersCalendarProps {
  uid: string
}

export const UsersCalendar = ({ uid }: UsersCalendarProps) => {
  const theme = useTheme()

  const { userRecord, loading, updateUserRecord, updating } = useUserRecord(uid)

  const updateLocation = useCallback(
    (location: Location) => {
      updateUserRecord({ location })
    },
    [updateUserRecord],
  )

  const webcalUrl = `${location.protocol}//${location.host}/forecast?calid=${uid}`

  return loading ? (
    <LinearProgress />
  ) : (
    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 0, sm: 1, md: 2, lg: 3 }}></Grid2>
      <Grid2 size={{ xs: 12, sm: 10, md: 8, lg: 6 }}>
        {userRecord ? (
          <Grid2
            container
            alignItems="center"
            spacing={2}
            sx={{ marginTop: '2em' }}
          >
            <Grid2 size={12}>
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
            <Grid2 size={12}>
              <TextField
                fullWidth
                label="Calendar URL"
                variant="standard"
                value={webcalUrl}
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
              />
              <Grid2>
                <Alert
                  variant="outlined"
                  severity="info"
                  sx={{
                    marginTop: '2em',
                    fontSize: theme.typography.h6.fontSize,
                  }}
                >
                  <span>
                    To add your calendar to Google Calendar, paste the above URL
                    into &nbsp;
                  </span>
                  <Link
                    underline="hover"
                    target="_blank"
                    rel="noopener"
                    href="https://calendar.google.com/calendar/u/0/r/settings/addbyurl"
                  >
                    https://calendar.google.com/calendar/u/0/r/settings/addbyurl
                  </Link>
                </Alert>
              </Grid2>
            </Grid2>
          </Grid2>
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
            updateLocation={updateLocation}
            updating={updating}
          />
        </Box>
      </Grid2>
      <Grid2 size={{ xs: 0, sm: 1, md: 2, lg: 3 }}></Grid2>
    </Grid2>
  )
}
