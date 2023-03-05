import {
    Cell,
    Field,
    initField,
    openCell as openFieldCell,
    markCell as markFieldCell
} from "../../logic/game";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../store";

const initialState = initField();
export const fieldSlice = createSlice({
    name: 'field',
    initialState,
    reducers: {
        init() {
            return initField();
        },
        switchWait(state, action: PayloadAction<boolean>){
            state.isWaiting = action.payload;
        },
        start(state) {
            state.status = 'inGame';
        },
        restart(state) {
            return initField();
        },
        openCell(state, action: PayloadAction<Cell>) {
            return openFieldCell(action.payload, state)
        },
        markCell(state, action: PayloadAction<Cell>) {
            return markFieldCell(action.payload, state)
        }
    }

})

export const actions = fieldSlice.actions;
export const selectField = (state: RootState) => state.field

export const fieldReducer = fieldSlice.reducer;
