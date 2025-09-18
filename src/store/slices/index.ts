// Export slice reducers as default exports
export { default as authReducer } from './authSlice'
export { default as itinerariesReducer } from './itinerariesSlice'
export { default as audioReducer } from './audioSlice'
export { default as mapReducer } from './mapSlice'
export { default as userPreferencesReducer } from './userPreferencesSlice'

// Export actions with prefixes to avoid conflicts
export * as authActions from './authSlice'
export * as itinerariesActions from './itinerariesSlice'
export * as audioActions from './audioSlice'
export * as mapActions from './mapSlice'
export * as userPreferencesActions from './userPreferencesSlice'