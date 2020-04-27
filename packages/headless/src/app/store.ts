import {
  configureStore as configureStoreToolkit,
  getDefaultMiddleware,
} from '@reduxjs/toolkit';
import {rootReducer} from './rootReducer';
import {RootState} from '@coveo/headless';

export function configureStore(preloadedState?: RootState) {
  const store = configureStoreToolkit({
    reducer: rootReducer,
    preloadedState,
    middleware: [...getDefaultMiddleware()],
  });

  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('./rootReducer', () => {
      store.replaceReducer(require('./rootReducer').rootReducer);
    });
  }

  return store;
}
