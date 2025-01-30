import { once } from 'lodash'
import { init } from '@fullstory/browser'

export const initFullstory = once(() =>
  init({
    orgId: import.meta.env.VITE_FULLSTORY_ORG_ID,
    devMode: import.meta.env.DEV,
  }),
)
