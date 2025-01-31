import { useCallback, useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  Box,
  Button,
  Divider,
  Grid2,
  InputAdornment,
  Link,
  List,
  ListItem,
  TextField,
  Typography,
} from '@mui/material'

import {
  Apple,
  Check,
  ContentCopy,
  Google,
  Microsoft,
  ArrowRight,
} from '@mui/icons-material'

import { useCopyToClipboard } from './hooks'
import { cond, matches } from 'lodash'

interface CalendarDirectionsProps {
  webcalUrl: string
}

const GoogleDirections = ({ webcalUrl }: CalendarDirectionsProps) => {
  const googleCalAddByUrlLink =
    'https://calendar.google.com/calendar/u/0/r/settings/addbyurl'
  const { copied: addByUrlCopied, copyToClipboard: handleAddByUrlCopied } =
    useCopyToClipboard(googleCalAddByUrlLink)

  const { copied: webcalCopied, copyToClipboard: handleWebcalCopied } =
    useCopyToClipboard(webcalUrl)

  return (
    <Box>
      <Typography variant="h5">Mobile</Typography>
      <List>
        <ListItem>
          <ArrowRight />
          <Typography>
            COPY this Google Calendar link and manually visit in a browser tab{' '}
            <TextField
              fullWidth
              label="GCal Add By URL"
              variant="standard"
              value={googleCalAddByUrlLink}
              sx={{ marginTop: '0.5em' }}
              slotProps={{
                input: {
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Button
                        startIcon={addByUrlCopied ? <Check /> : <ContentCopy />}
                        color={addByUrlCopied ? 'success' : 'primary'}
                        onClick={handleAddByUrlCopied}
                        sx={{ minWidth: '7em' }}
                      >
                        {addByUrlCopied ? 'Copied' : 'Copy'}
                      </Button>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Typography>
        </ListItem>
        <ListItem>
          <ArrowRight />
          <Typography>
            Copy the Weather Calendar URL{' '}
            <TextField
              fullWidth
              label="Calendar URL"
              variant="standard"
              value={webcalUrl}
              sx={{ marginTop: '0.5em' }}
              slotProps={{
                input: {
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Button
                        startIcon={webcalCopied ? <Check /> : <ContentCopy />}
                        color={webcalCopied ? 'success' : 'primary'}
                        onClick={handleWebcalCopied}
                        sx={{ minWidth: '7em' }}
                      >
                        {webcalCopied ? 'Copied' : 'Copy'}
                      </Button>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Typography>
        </ListItem>
        <ListItem>
          <ArrowRight />
          <Typography>
            Paste your Weather Calendar URL into the textbox and tap "Add
            Calendar"
          </Typography>
        </ListItem>
      </List>

      <Divider />

      <Typography variant="h5" sx={{ marginTop: '0.5em' }}>
        Desktop
      </Typography>
      <List>
        <ListItem>
          <ArrowRight />
          <Typography>
            Copy the Weather Calendar URL{' '}
            <TextField
              fullWidth
              label="Calendar URL"
              variant="standard"
              value={webcalUrl}
              sx={{ marginTop: '0.5em' }}
              slotProps={{
                input: {
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Button
                        startIcon={webcalCopied ? <Check /> : <ContentCopy />}
                        color={webcalCopied ? 'success' : 'primary'}
                        onClick={handleWebcalCopied}
                        sx={{ minWidth: '7em' }}
                      >
                        {webcalCopied ? 'Copied' : 'Copy'}
                      </Button>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Typography>
        </ListItem>
        <ListItem>
          <ArrowRight />
          <Typography>
            Go to{' '}
            <Link rel="noopener" target="_blank" href={googleCalAddByUrlLink}>
              Google Calendar Add By URL
            </Link>
          </Typography>
        </ListItem>
        <ListItem>
          <ArrowRight />
          <Typography>
            Paste your Weather Calendar URL into the textbox and select "Add
            Calendar"
          </Typography>
        </ListItem>
      </List>
    </Box>
  )
}

const OutlookDirections = () => (
  <Box>
    <List>
      <ListItem>
        <ArrowRight />
        <Typography>
          {'Copy the URL for your Weather Calendar above'}
        </Typography>
      </ListItem>
      <ListItem>
        <ArrowRight />
        <Typography>
          {'On the Home tab, select Add Calendar > From Internet'}
        </Typography>
      </ListItem>
      <ListItem>
        <ArrowRight />
        <Typography>
          {'Paste the URL for your Weather Calendar and select "OK"'}
        </Typography>
      </ListItem>
      <ListItem>
        <ArrowRight />
        <Typography>
          {'Select "Yes" when Outlook asks to subscribe to updates'}
        </Typography>
      </ListItem>
    </List>
  </Box>
)

const AppleDirections = () => (
  <Box>
    <List>
      <ListItem>
        <ArrowRight />
        <Typography>
          {'Copy the URL for your Weather Calendar above'}
        </Typography>
      </ListItem>
      <ListItem>
        <ArrowRight />
        <Typography>{'Open the native iOS Calendar app'}</Typography>
      </ListItem>
      <ListItem>
        <ArrowRight />
        <Typography>{'Tap "Calendars" at the bottom of the screen'}</Typography>
      </ListItem>
      <ListItem>
        <ArrowRight />
        <Typography>
          {
            'Tap "Add Calendar" in the bottom left of the screen and tap "Add Subscription Calendar"'
          }
        </Typography>
      </ListItem>
      <ListItem>
        <ArrowRight />
        <Typography>
          {
            'Paste your Weather Calendar URL into "Subscription URL" and tap "Subscribe"'
          }
        </Typography>
      </ListItem>
    </List>
  </Box>
)

type CalType = 'google' | 'outlook' | 'apple'

export const CalendarDirections = ({ webcalUrl }: CalendarDirectionsProps) => {
  const [selectedDirections, setSelectedDirections] = useState<null | CalType>(
    null,
  )
  const [lastSelectedCal, setLastSelectedCal] = useState<CalType>('google')

  const handleSelectGoogle = useCallback(() => {
    setLastSelectedCal('google')
    setSelectedDirections(selectedDirections === 'google' ? null : 'google')
  }, [lastSelectedCal, selectedDirections])

  const handleSelectOutlook = useCallback(() => {
    setLastSelectedCal('outlook')
    setSelectedDirections(selectedDirections === 'outlook' ? null : 'outlook')
  }, [lastSelectedCal, selectedDirections])

  const handleSelectApple = useCallback(() => {
    setLastSelectedCal('apple')
    setSelectedDirections(selectedDirections === 'apple' ? null : 'apple')
  }, [lastSelectedCal, selectedDirections])

  const renderBySelection = cond([
    [matches('google'), () => <GoogleDirections webcalUrl={webcalUrl} />],
    [matches('outlook'), () => <OutlookDirections />],
    [matches('apple'), () => <AppleDirections />],
  ])

  return (
    <Grid2
      container
      spacing={2}
      sx={{
        marginTop: '2em',
      }}
    >
      <Grid2 size="auto">
        <Typography variant="h6">Add to:</Typography>
      </Grid2>
      <Grid2 container size="grow">
        <Grid2 size="auto">
          <Button
            startIcon={<Google />}
            onClick={handleSelectGoogle}
            variant={selectedDirections === 'google' ? 'contained' : 'text'}
          >
            Google Calendar
          </Button>
        </Grid2>
        <Grid2 size="auto">
          <Button
            startIcon={<Apple />}
            onClick={handleSelectApple}
            variant={selectedDirections === 'apple' ? 'contained' : 'text'}
          >
            iOS Apple Calendar
          </Button>
        </Grid2>
        <Grid2 size="auto">
          <Button
            startIcon={<Microsoft />}
            onClick={handleSelectOutlook}
            variant={selectedDirections === 'outlook' ? 'contained' : 'text'}
          >
            Outlook Calendar
          </Button>
        </Grid2>
      </Grid2>
      <Grid2 size={12}>
        <Accordion expanded={selectedDirections !== null}>
          {/* Hidden when unselected (empty Box) */}
          <Box></Box>
          {/* Show content when selected */}
          <AccordionDetails>
            {selectedDirections === null
              ? renderBySelection(selectedDirections)
              : renderBySelection(lastSelectedCal)}
          </AccordionDetails>
        </Accordion>
      </Grid2>
    </Grid2>
  )
}
