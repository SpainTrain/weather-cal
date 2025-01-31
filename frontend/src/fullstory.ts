import { once } from 'lodash'
import { init, FullStory } from '@fullstory/browser'
import { useCallback } from 'react'

export const initFullstory = once(() =>
  init({
    orgId: import.meta.env.VITE_FULLSTORY_ORG_ID,
    devMode: import.meta.env.DEV,
  }),
)

interface FullStoryIdentity {
  uid: string
  email?: string
  displayName?: string
}

export const useFullstoryIdentify = () => {
  initFullstory()
  const fullstoryIdentify = useCallback(
    ({ displayName, email, uid }: FullStoryIdentity) => {
      FullStory('setIdentity', {
        uid,
        properties: {
          email,
          displayName,
        },
      })
    },
    [],
  )
  return { fullstoryIdentify }
}
