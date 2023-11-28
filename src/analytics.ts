import ReactGA from 'react-ga4'

let initialized: boolean = false
type AnalyticsMode = "console" | "live"
let mode: AnalyticsMode

type EventTracker = (action: string, label?: string, value?: number) => Promise<void>

export const analyticsInit = () => {
  if (initialized) return
  initialized = true
  const GoogleAnalyticsID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID
  if (GoogleAnalyticsID) {
    mode = "live"
    ReactGA.initialize(GoogleAnalyticsID)
  } else {
    mode = "console"
  }
}

export const useAnalytics = (category: string): EventTracker => {
  const LiveEventTracker: EventTracker = async (action: string, label?: string, value?: number) => {
    ReactGA.event({ category, action, label, value })
  }
  const ConsoleEventTracker: EventTracker = async (action: string, label?: string, value?: number) => {
    console.log("Console mode GA event")
    console.log({ category, action, label, value })
  }
  return mode === "live" ? LiveEventTracker : ConsoleEventTracker
}

export const pageview = (page: string, title: string) => {
  const event = { hitType: "pageview", page, title }
  if (mode === "live") {
    ReactGA.send(event)
  } else {
    console.log("Console mode GA pageview")
    console.log(event)
  }
}