type OpenWeatherExcludeType =
  | 'current'
  | 'minutely'
  | 'hourly'
  | 'daily'
  | 'alerts'

interface FetchOpenWeatherArgs {
  openWeatherKey: string
  lat: number
  lon: number
  exclude?: OpenWeatherExcludeType[]
}

export const fetchOpenWeather = async ({
  lat,
  lon,
  openWeatherKey,
  exclude = ['current', 'minutely', 'hourly', 'alerts'],
}: FetchOpenWeatherArgs) => {
  const res = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=${exclude.join(
      ',',
    )}&appid=${openWeatherKey}&units=imperial`,
  )
  const data = await res.json()
  return data
}
