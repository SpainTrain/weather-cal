import {
  Avatar,
  Box,
  Button,
  Divider,
  Grid2,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material'
import { CalendarMonth, Google, MyLocation, WbSunny } from '@mui/icons-material'

import ProdMktScreenshot from '/prodmkt-screenshot.png'

import { useLoginWithGoogle } from './firebase'

const MarketingBullets = () => {
  const theme = useTheme()

  return (
    <List>
      <ListItem>
        <ListItemAvatar>
          <Avatar sx={{ backgroundColor: theme.palette.success.main }}>
            <WbSunny />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary="Your Weather, Your Calendar"
          secondary="Plan ahead with an 8-day personalized weather forecast integrated into your calendar."
        />
      </ListItem>
      <ListItem>
        <ListItemAvatar>
          <Avatar sx={{ backgroundColor: theme.palette.success.main }}>
            <MyLocation />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary="Custom Forecasts for Your Location"
          secondary="Pick your location and get a personalized weather calendar. On the go? Update anytime for an up-to-date forecast."
        />
      </ListItem>
      <ListItem>
        <ListItemAvatar>
          <Avatar sx={{ backgroundColor: theme.palette.success.main }}>
            <CalendarMonth />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary="Add to Any Calendar"
          secondary="Your weather forecast syncs effortlessly with your calendar using the universal iCal format."
        />
      </ListItem>
    </List>
  )
}

export const Login = () => {
  const { loginWithGoogle } = useLoginWithGoogle()

  return (
    <Box sx={{ flexGrow: 1, alignContent: 'center', paddingTop: '2em' }}>
      <Grid2 container spacing={2}>
        <Grid2
          size={{
            xs: 0,
            sm: 1,
          }}
        />
        <Grid2
          size={{
            xs: 12,
            sm: 12,
            md: 5,
            lg: 3,
          }}
        >
          <Box sx={{ textAlign: 'center', paddingBottom: '2em' }}>
            <Typography variant="h5" sx={{ marginBottom: '1em' }}>
              Log in to setup your weather calendar
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Google />}
              onClick={loginWithGoogle}
            >
              Log in with Google
            </Button>
          </Box>
          <Divider />
          <MarketingBullets />
        </Grid2>
        <Grid2
          size={{
            xs: 12,
            sm: 12,
            md: 6,
            lg: 8,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Box
              component="img"
              src={ProdMktScreenshot}
              sx={{
                maxHeight: '48vh',
                maxWidth: '100%',
              }}
            />
          </Box>
        </Grid2>
      </Grid2>
    </Box>
  )
}
