import {SearchResult} from '../../api/search/SearchResult';
import {launchSearch} from '../search/searchSlice';
import {createReducer} from '@reduxjs/toolkit';

export interface ResultsState {
  list: SearchResult[];
  firstResult: number;
  numberOfResults: number;
}

const initialState: ResultsState = {
  list: [],
  firstResult: 0,
  numberOfResults: 10,
};

export const resultsReducer = createReducer(initialState, builder =>
  builder.addCase(launchSearch.fulfilled, (state, action) => {
    state.list = action.payload.results;
  })
);
