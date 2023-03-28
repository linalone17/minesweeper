import {
    Cell,
    Field,
    initField,
    openCell as openFieldCell,
    markCell as markFieldCell
} from "../../game/logic";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../store";

const initialState: Field = initField();
export const fieldSlice = createSlice({
    name: 'field',
    initialState,
    reducers: {
        switchWait(state, action: PayloadAction<boolean>){
            state.isWaiting = action.payload;
        },
        restart() {
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
