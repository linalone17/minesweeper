import {combineReducers, configureStore} from "@reduxjs/toolkit";
import {fieldReducer} from "./slices/FieldSlice";

const rootReducer = combineReducers({
    field: fieldReducer
})

export const setupStore = () => {
    return configureStore({
        reducer: rootReducer
    })
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];