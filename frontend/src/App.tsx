import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  LinearProgress,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from '@mui/material'

import WeatherCalLogo from '/logo.png'

import { useFirebaseAuth, useLogout } from './firebase'
import { initFullstory } from './fullstory'
import { Login } from './Login'
import { UsersCalendar } from './UsersCalendar'

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
})

function App() {
  initFullstory()
  const { loading, user } = useFirebaseAuth()
  const { logout } = useLogout()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <AppBar position="static">
          <Container maxWidth="xl">
            <Toolbar disableGutters>
              <Box
                component="img"
                sx={{
                  height: '6em',
                  marginBottom: '0.5em',
                  marginRight: '1em',
                  marginTop: '0.5em',
                }}
                src={WeatherCalLogo}
                className="logo"
                alt="Weather Calendar Logo"
              />
              <Typography variant="h3" sx={{ flexGrow: 1 }}>
                <Box sx={{ display: { xs: 'none', sm: 'none', md: 'flex' } }}>
                  Weather Calendar
                </Box>
              </Typography>
              {user === null ? (
                <Box />
              ) : (
                <Box>
                  <Typography>{user.email}</Typography>
                  <Button sx={{ float: 'right' }} onClick={logout}>
                    Log out
                  </Button>
                </Box>
              )}
            </Toolbar>
          </Container>
        </AppBar>

        {loading ? (
          <LinearProgress />
        ) : user === null ? (
          <Login />
        ) : (
          <UsersCalendar uid={user.uid} />
        )}
      </CssBaseline>
    </ThemeProvider>
  )
}

export default App
